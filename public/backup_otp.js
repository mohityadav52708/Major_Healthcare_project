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
// const PORT = 3000;
const PORT = process.env.PORT || 3000;
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

// Define the user schema and model (in a separate file if preferred)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  verificationExpiry: { type: Date },
  verificationOTP: { type: String },
  isVerified: { type: Boolean, default: false },
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
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
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
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));

});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    console.log('User found:', user);
    if (!user) {
      console.log('User not found');
      // return res.sendFile(path.join(__dirname, '../public/index.html'));
      return res.send('<script>alert("User not exist Please Signup !!"); window.location="/signup";</script>');
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
      return   res.sendFile(path.join(__dirname, '../public/home.html'));
    } else {
      console.log('Invalid password');
      // Authentication failed, show an error message
      return res.sendFile(path.join(__dirname, '../public/index.html'));
    }
  } catch (error) {
    console.error('Error during index:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.get('/verification', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/verification.html'));
});

// Modify the signup route to redirect to the verification page
// Modify the signup route to handle cleanup if the user doesn't complete OTP verification
// Cleanup function to remove incomplete user data
async function cleanupIncompleteUser(userId) {
  try {
    await User.deleteOne({ _id: userId });
    console.log('Incomplete user data deleted successfully');
  } catch (error) {
    console.error('Error deleting incomplete user:', error);
  }
}

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const verificationOTP = generateOTP();
  const verificationExpiry = new Date(Date.now() + 60 * 1000); // 1 minute expiry

  try {
    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // User already exists, redirect to index page
      return res.send('<script>alert("User Already exist Please Login !!"); window.location="/index";</script>');
    }

    // Create a new user with email, hashed password, OTP, and its expiry
    const newUser = new User({
      email,
      password: hashedPassword,
      verificationOTP,
      verificationExpiry,
    });

    // Save the user to the database
    await newUser.save();

    // Send verification email with OTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification',
      text: `Your OTP for email verification is: ${verificationOTP}`,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.error('Failed to send verification email:', error);
        // If email sending fails, handle cleanup by removing the incomplete user
        await cleanupIncompleteUser(newUser._id);
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      // Display an alert and redirect to the verification page
      res.send(
        '<script>alert("Verification email sent. Check your inbox."); window.location="/verification";</script>'
      );
    });
  } catch (error) {
    console.error('Error during signup:', error);
    // Display an alert and redirect to the signup page with an error message
    res.send('<script>alert("Error during signup. User already exists."); window.location="/signup";</script>');
  }
});

app.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      // Display an alert and redirect to the signup page with an error message
      return res.send('<script>alert("User not found."); window.location="/signup";</script>');
    }

    // Check if OTP is correct and not expired
    if (user.verificationOTP === otp && user.verificationExpiry > Date.now()) {
      // Update user as verified and clear OTP fields
      user.verificationOTP = null;
      user.verificationExpiry = null;
      await user.save();

      // Display an alert and redirect to the index page
      return res.send('<script>alert("Email verified successfully."); window.location="/index";</script>');
    } else {
      // If OTP is invalid or expired, handle cleanup by removing the incomplete user
      await cleanupIncompleteUser(user._id);
      // Display an alert and redirect to the signup page with an error message
      return res.send('<script>alert("Invalid or expired OTP."); window.location="/signup";</script>');
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    // Display an alert and redirect to the signup page with an error message
    res.send('<script>alert("Internal server error."); window.location="/signup";</script>');
  }
});

// Existing routes...

function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Existing routes...

function generateOTP() {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}
app.get('/logout', (req, res) => {
    // Clear the user session
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.sendFile(path.join(__dirname, '../public/index.html')); // Redirect to the index page after logout
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
    res.sendFile(path.join(__dirname, '../public/reset-password.html'));
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
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/book-appointment', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated.' });
      
    }

    const { date, time, patientName, contactNumber } = req.body;



    // Check if the user already has an upcoming appointment
    const existingAppointment = await Booking.findOne({
      user: userId,
      date: { $gte: new Date() }, // Check for future dates
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an upcoming appointment.' });
      
    }

    // Check if there is an existing appointment for the specified date and time
    const overlappingBooking = await Booking.findOne({ date, time });

    if (overlappingBooking) {
      return res.status(400).json({ message: 'Appointment already booked for this date and time.' });
    }

    // Get user details from the User model
    const user = await User.findById(userId);

    // Create a new booking
    const newBooking = new Booking({
      user: userId,
      date,
      time,
      name: patientName,
      email: user.email,
      contact: contactNumber,
    });

    // Save the booking to the database
    await newBooking.save();

    // Send confirmation email to the user
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Appointment Confirmation',
      html: `
        <p>Dear ${user.email},</p>
        <p>Your appointment has been booked successfully!</p>
        <p>Appointment Details:</p>
        <ul>
          <li>Date: ${date}</li>
          <li>Time: ${time}</li>
          <li>Patient Name: ${patientName}</li>
          <li>Contact Number: ${contactNumber}</li>
        </ul>
        <p>Thank you for choosing our service!</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Failed to send confirmation email:', error);
        return res.status(500).json({ message: 'Failed to send confirmation email' });
      }

      res.json({ message: 'Appointment booked successfully. Confirmation email sent.' });
    });

  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});