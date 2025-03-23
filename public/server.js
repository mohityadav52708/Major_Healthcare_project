require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); 
// const cryptoRandomString = require('crypto-random-string');
const randomstring = require('randomstring');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
// const PORT = process.env.PORT || 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Connect to MongoDB (replace 'auth-app' with your actual database name)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>{
    console.log("Database is connected");
})
.catch((error)=>{
    console.log(error);
})
app.listen(4000,(req,res)=>{
    console.log("Port is listening on port 4000");
});
// Define the user schema and model (in a separate file if preferred)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  verificationKey: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});
const User = mongoose.model('User', UserSchema);
const patientSchema = new mongoose.Schema({
  name: String,
  email: String,
  dob: String,
  gender: String,
  medicalHistory: String,
  age: Number,
  contact: Number,
  bloodGroup: String,
  address: String,
});

// Create a model based on the schema
const Patient = mongoose.model('Patient', patientSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../views')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.post('/submit', async (req, res) => {
  try {
    // Create a new patient instance with data from the form
    const newPatient = new Patient(req.body);

    // Save the patient to the database
    await newPatient.save();

    res.send('Data submitted successfully!');
  } catch (error) {
    res.status(500).send('Error submitting data.');
  }
});


//For routing
app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/about", function(req, res){
  res.render("AboutUs");
});
app.get("/healthCare", function(req, res){
  res.render("health_care");
});


// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/index.html'));

});

app.post('/index', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return res.sendFile(path.join(__dirname, '../views/index.html'));
    }

    console.log('Entered Password:', password);
    console.log('Hashed Password in Database:', user.password);
    
    // Check case sensitivity, trim, and log lengths
    const enteredPasswordTrimmed = password.trim();
    const hashedPasswordTrimmed = user.password.trim();
    console.log('Entered Password Length:', enteredPasswordTrimmed.length);
    console.log('Hashed Password Length in Database:', hashedPasswordTrimmed.length);

    if (bcrypt.compareSync(enteredPasswordTrimmed, hashedPasswordTrimmed)) {
      // Authentication successful, store user session
      req.session.userId = user._id;
      return   res.sendFile(path.join(__dirname, '../views/home.html'));
    } else {
      console.log('Invalid password');
      // Authentication failed, show an error message
      return res.sendFile(path.join(__dirname, '../views/index.html'));
    }
  } catch (error) {
    console.error('Error during index:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    await User.create({ email, password: hashedPassword });
    res.sendFile(path.join(__dirname, '../views/index.html'));
  } catch (error) {
    res.sendFile(path.join(__dirname, '../views/signup.html'), { error: 'User already exists' });
  }
});
app.get('/logout', (req, res) => {
    // Clear the user session
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.sendFile(path.join(__dirname, '../views/index.html')); // Redirect to the index page after logout
      }
    });
  });

app.use(bodyParser.json());
  //
  
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token and expiry
  const resetToken = crypto.randomBytes(10).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

  // Update user with reset token and expiry
  user.resetToken = resetToken;
  user.resetTokenExpiry = resetTokenExpiry;
  await user.save();

  // Send email with reset link
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const resetLink = `http://localhost:${PORT}/reset-password/${resetToken}`;
  const mailOptions = {
    from: 'process.env.EMAIL_USER',
    to: email,
    subject: 'Password Reset',
    text: `Your token: ${resetToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    const redirectUrl = `/reset-password?email=${email}`;
    res.sendFile(path.join(__dirname, '../views/reset-password.html'));
    // res.json({ message: 'Reset email sent. Check your inbox.', redirectUrl, resetToken });
  });
});
app.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  console.log('Reset Password Request:', { email, token, newPassword });

  try {
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const user = await User.findOne({ email }); 
    console.log('User found:', user);

    if (!user || user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
      console.log('Invalid or expired reset token');
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password before updating the user
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password and reset token fields
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    
    // Save the updated user document
    await user.save();

    console.log('Password reset successful');
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// Start the server


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});