function sendMessage() {
    const userInput = document.getElementById('userInput');
    const chatBody = document.getElementById('chatBody');

    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    appendMessage('user', userMessage);
    userInput.value = '';

    // Simulate a response from the bot (replace with actual chatbot logic)
    const botResponse = getBotResponse(userMessage);
    setTimeout(() => {
        appendMessage('bot', botResponse);
    }, 500);
}

function appendMessage(sender, message) {
    const chatBody = document.getElementById('chatBody');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', sender === 'bot' ? 'bot' : 'user');
    messageContainer.innerHTML = `<p>${message}</p>`;

    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function getBotResponse(userMessage) {
    if (userMessage.toLowerCase().includes('medication')) {
        return "I'm not a doctor, but I can provide general information. Please consult with a healthcare professional for personalized advice on medications.";
    }

    if (userMessage.toLowerCase().includes('health advice')) {
        return "For personalized health advice, it's recommended to consult with a healthcare professional.";
    }

    if (userMessage.toLowerCase().includes('what is your name') || userMessage.toLowerCase().includes('your name')) {
        return "I am Ahana made by RGM sir!! How can I help you?";
    }

    if (userMessage.toLowerCase().includes('what are the symptoms of the flu') || userMessage.toLowerCase().includes('flu symptoms') || userMessage.toLowerCase().includes('flu')) {
        return "Common symptoms of the flu include fever, cough, sore throat, body aches, and fatigue. If you experience these symptoms, it's recommended to consult with a healthcare professional.";
    }

    if (userMessage.toLowerCase().includes('how to prevent a cold') || userMessage.toLowerCase().includes('cold prevention')) {
        return "To prevent colds, practice good hygiene by washing hands regularly, avoiding close contact with sick individuals, and maintaining a healthy lifestyle with proper nutrition and sleep.";
    }

    if (userMessage.toLowerCase().includes('headache remedies') || userMessage.toLowerCase().includes('what to do for a headache')) {
        return "If you have a headache, try resting in a quiet, dark room, staying hydrated, and taking over-the-counter pain relievers if needed. If the headache persists, consult with a healthcare provider.";
    }

    if (userMessage.toLowerCase().includes('tired all the time') || userMessage.toLowerCase().includes('constant fatigue')) {
        return "Fatigue can have various causes, including lack of sleep, stress, or underlying health conditions. If fatigue persists, it's advisable to discuss your symptoms with a healthcare professional for a proper evaluation.";
    }

    if (userMessage.toLowerCase().includes('better sleep tips') || userMessage.toLowerCase().includes('improve sleep')) {
        return "To improve sleep, maintain a consistent sleep schedule, create a relaxing bedtime routine, limit screen time before bed, and ensure your sleep environment is comfortable and dark.";
    }

    if (userMessage.toLowerCase().includes('vaccines for adults') || userMessage.toLowerCase().includes('adult vaccination')) {
        return "Recommended vaccines for adults may include influenza, tetanus, hepatitis, and others depending on your age, health status, and any specific risk factors. Consult with your healthcare provider for personalized recommendations.";
    }

    if (userMessage.toLowerCase().includes('stress management') || userMessage.toLowerCase().includes('reduce stress')) {
        return "Managing stress is important for overall well-being. Techniques such as deep breathing, meditation, exercise, and maintaining a healthy work-life balance can be helpful. If stress becomes overwhelming, seek support from friends, family, or a mental health professional.";
    }

    // Additional queries for different medical issues
    if (userMessage.toLowerCase().includes('cancer symptoms') || userMessage.toLowerCase().includes('signs of cancer')) {
        return "Cancer symptoms vary depending on the type. Common signs may include unexplained weight loss, persistent fatigue, changes in the skin, and unusual bleeding. If you notice any concerning symptoms, consult with a healthcare professional.";
    }

    if (userMessage.toLowerCase().includes('blood pressure') || userMessage.toLowerCase().includes('high blood pressure')) {
        return "High blood pressure (hypertension) can lead to serious health issues. Lifestyle changes such as a healthy diet, regular exercise, and stress management can help. However, it's crucial to monitor your blood pressure regularly and consult with a healthcare provider for personalized advice.";
    }

    if (userMessage.toLowerCase().includes('diabetes') || userMessage.toLowerCase().includes('manage diabetes')) {
        return "Diabetes requires careful management, including monitoring blood sugar levels, following a healthy diet, engaging in regular physical activity, and taking medications as prescribed. Consult with a healthcare team to create a personalized diabetes management plan.";
    }

    // Additional queries for different medical issues
    if (userMessage.toLowerCase().includes('asthma') || userMessage.toLowerCase().includes('manage asthma')) {
        return "Asthma is a chronic condition that affects the airways. It's important to have an asthma action plan, use prescribed inhalers as directed, and identify and avoid triggers. Regular check-ups with a healthcare provider are essential for proper asthma management.";
    }

    if (userMessage.toLowerCase().includes('heart disease') || userMessage.toLowerCase().includes('preventing heart disease')) {
        return "Preventing heart disease involves adopting a heart-healthy lifestyle. This includes a balanced diet, regular exercise, avoiding tobacco smoke, and managing stress. Regular check-ups with a healthcare provider can assess and manage cardiovascular risk.";
    }

    if (userMessage.toLowerCase().includes('arthritis') || userMessage.toLowerCase().includes('arthritis management')) {
        return "Arthritis is a condition that affects the joints. Management strategies include maintaining a healthy weight, staying physically active, and taking prescribed medications. Consult with a rheumatologist for personalized arthritis management.";
    }

    if (userMessage.toLowerCase().includes('mental health') || userMessage.toLowerCase().includes('support for mental health')) {
        return "Mental health is important for overall well-being. If you're struggling with mental health, reach out to a mental health professional for support. There are various treatment options, including therapy and medication, that can be tailored to your needs.";
    }

    // Additional queries for different medical issues
    if (userMessage.toLowerCase().includes('allergies') || userMessage.toLowerCase().includes('manage allergies')) {
        return "Managing allergies involves identifying triggers, avoiding exposure when possible, and using antihistamines or other prescribed medications. Consult with an allergist for personalized advice on managing your allergies.";
    }

    if (userMessage.toLowerCase().includes('thyroid') || userMessage.toLowerCase().includes('thyroid disorders')) {
        return "Thyroid disorders can affect hormone levels and metabolism. Treatment may include medications or other interventions. Consult with an endocrinologist for proper diagnosis and management of thyroid conditions.";
    }

    if (userMessage.toLowerCase().includes('gastrointestinal issues') || userMessage.toLowerCase().includes('digestive problems')) {
        return "Digestive problems can have various causes. It's important to maintain a healthy diet, stay hydrated, and seek medical advice if symptoms persist. A gastroenterologist can provide specialized care for gastrointestinal issues.";
    }
    if (userMessage.toLowerCase().includes('cardiologist problem') || userMessage.toLowerCase().includes('cardiologist issue')||userMessage.toLowerCase().includes('Cardiology ')) {
        return "Cardiology is a branch of medicine that concerns diseases and disorders of the heart, which may range from congenital defects through to acquired heart diseases such as coronary artery disease.";
    }
    if (
        userMessage.toLowerCase().includes('fever') ||
        userMessage.toUpperCase().includes('Fever symptoms') ||
        userMessage.toLowerCase().includes('I have fever ')
    ) {
        return "Fever is a common symptom of various illnesses and infections. It is typically a sign that the body is responding to an infection, inflammation, or another medical condition. Here are common symptoms associated with fever. It's important to note that fever is a symptom, not a disease itself. It can be caused by various underlying conditions, such as infections (viral or bacterial), inflammatory disorders, or other medical conditions. If you or someone else is experiencing persistent or severe symptoms of fever, it's advisable to seek medical attention for a proper diagnosis and treatment.";
    }

    if (userMessage.toLowerCase().includes('cough') || userMessage.toLowerCase().includes('coughing')) {
        return "Coughing is a common symptom that can be caused by various factors, including respiratory infections, allergies, or irritants. If you have a persistent or severe cough, it's recommended to consult with a healthcare professional for an evaluation.";
    }

    if (
        userMessage.toLowerCase().includes('viral symptoms') ||
        userMessage.toLowerCase().includes('common viral diseases') ||
        userMessage.toLowerCase().includes('viral infection')
    ) {
        return "Common viral disease symptoms may include fever, cough, sore throat, fatigue, body aches, and respiratory symptoms. If you suspect a viral infection, it's important to rest, stay hydrated, and seek medical advice if symptoms worsen or persist.";
    }
    if (
        userMessage.toLowerCase().includes('Jai Shree Ram') ||
        userMessage.toLowerCase().includes('jai shree ram') ||
        userMessage.toLowerCase().includes('ram ram')
    ) {
        return "Jai Shree Ram !! How can you assist you today ?";
    }

    // Default response
    return "I'm a healthcare chatbot. I'm here to assist you with health-related questions.";
}
