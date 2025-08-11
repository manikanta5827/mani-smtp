let currentEmail = '';
let checkInterval = null;

async function generateEmail() {
    try {
        const response = await fetch('/api/generate-email');
        const data = await response.json();
        
        currentEmail = data.email;
        document.getElementById('emailDisplay').textContent = currentEmail;
        document.getElementById('emailDisplay').style.display = 'block';
        document.getElementById('emailActions').style.display = 'block';
        
        showMessage('Email address generated successfully!', 'success');
        
        // Start checking for emails
        checkEmails();
        startEmailCheck();
        
    } catch (error) {
        showMessage('Error generating email: ' + error.message, 'error');
    }
}

async function checkEmails() {
    if (!currentEmail) return;
    
    try {
        const response = await fetch(`/api/emails?address=${encodeURIComponent(currentEmail)}`);
        const data = await response.json();
        
        displayEmails(data.emails);
        
    } catch (error) {
        showMessage('Error checking emails: ' + error.message, 'error');
    }
}

function displayEmails(emails) {
    const container = document.getElementById('emailsContainer');
    const list = document.getElementById('emailsList');
    
    if (emails.length === 0) {
        list.innerHTML = '<div class="loading">No emails received yet...</div>';
    } else {
        list.innerHTML = emails.map(email => `
            <div class="email-item">
                <div class="email-header">
                    <span class="email-from">${email.from}</span>
                    <span class="email-time">${new Date(email.timestamp).toLocaleString()}</span>
                </div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-body">${email.body}</div>
                <button class="btn btn-danger" style="margin-top: 10px;" onclick="deleteEmail('${email.id}')">Delete</button>
            </div>
        `).join('');
    }
    
    container.style.display = 'block';
}

async function deleteEmail(emailId) {
    if (!currentEmail) return;
    
    try {
        await fetch(`/api/email?id=${emailId}&address=${encodeURIComponent(currentEmail)}`, {
            method: 'DELETE'
        });
        
        showMessage('Email deleted successfully!', 'success');
        checkEmails();
        
    } catch (error) {
        showMessage('Error deleting email: ' + error.message, 'error');
    }
}

async function deleteAllEmails() {
    if (!currentEmail) return;
    
    if (!confirm('Are you sure you want to delete all emails for this address?')) return;
    
    try {
        await fetch(`/api/emails?address=${encodeURIComponent(currentEmail)}`, {
            method: 'DELETE'
        });
        
        showMessage('All emails deleted successfully!', 'success');
        checkEmails();
        
    } catch (error) {
        showMessage('Error deleting emails: ' + error.message, 'error');
    }
}

function startEmailCheck() {
    // Check for new emails every 10 seconds
    checkInterval = setInterval(checkEmails, 10000);
}

function stopEmailCheck() {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
    }
}

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();
        
        document.getElementById('totalAddresses').textContent = stats.totalAddresses;
        document.getElementById('totalEmails').textContent = stats.totalEmails;
        
    } catch (error) {
        console.error('Error loading stats:', error);
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

// Load stats on page load
loadStats();
setInterval(loadStats, 30000); // Refresh stats every 30 seconds
