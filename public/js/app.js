let currentEmail = '';

async function generateEmail() {
    try {
        const response = await fetch('/api/generate-email');
        const data = await response.json();
        
        currentEmail = data.email;
        document.getElementById('emailDisplay').textContent = currentEmail;
        document.getElementById('emailDisplay').style.display = 'block';
        
        showMessage('Email address generated successfully!', 'success');
        
    } catch (error) {
        showMessage('Error generating email: ' + error.message, 'error');
    }
}

function showMessage(message, type) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = type;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
