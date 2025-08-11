// Temp Mail Service - Email Management
const fs = require('fs').promises;
const crypto = require('crypto');
const config = require('../config/config');

class TempMailService {
  constructor() {
    this.emails = new Map(); // Store emails in memory for faster access
    this.loadEmails();
  }

  // Generate a random email address
  generateTempEmail() {
    const randomString = crypto.randomBytes(8).toString('hex');
    const domain = config.tempMailDomain;
    return `${randomString}@${domain}`;
  }

  // Store email with timestamp
  async storeEmail(to, from, subject, body, html = '') {
    const emailId = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    
    const email = {
      id: emailId,
      to,
      from,
      subject,
      body,
      html,
      timestamp
    };

    // Store in memory
    if (!this.emails.has(to)) {
      this.emails.set(to, []);
    }
    this.emails.get(to).push(email);

    // Also save to file for persistence
    await this.saveEmailToFile(email);

    return emailId;
  }

  // Get emails for a specific address
  getEmailsForAddress(emailAddress) {
    const emails = this.emails.get(emailAddress) || [];
    return emails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Delete specific email
  async deleteEmail(emailAddress, emailId) {
    if (this.emails.has(emailAddress)) {
      const emails = this.emails.get(emailAddress);
      const filteredEmails = emails.filter(email => email.id !== emailId);
      this.emails.set(emailAddress, filteredEmails);
    }
    
    // Also remove from file
    await this.removeEmailFromFile(emailId);
  }

  // Delete all emails for an address
  async deleteAllEmails(emailAddress) {
    this.emails.delete(emailAddress);
    await this.removeAllEmailsFromFile(emailAddress);
  }



  // Load emails from file on startup
  async loadEmails() {
    try {
      const data = await fs.readFile(config.tempEmailsFile, 'utf8');
      const emailData = JSON.parse(data);
      
      // Convert back to Map
      for (const [emailAddress, emails] of Object.entries(emailData)) {
        this.emails.set(emailAddress, emails);
      }
      
      console.log(`📧 Loaded ${this.emails.size} email addresses with emails`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading emails:', error);
      }
    }
    }

  // Save email to file
  async saveEmailToFile(email) {
    try {
      let emailData = {};
      try {
        const data = await fs.readFile(config.tempEmailsFile, 'utf8');
        emailData = JSON.parse(data);
      } catch (error) {
        // File doesn't exist, start with empty object
      }

      if (!emailData[email.to]) {
        emailData[email.to] = [];
      }
      emailData[email.to].push(email);

      await fs.writeFile(config.tempEmailsFile, JSON.stringify(emailData, null, 2));
    } catch (error) {
      console.error('Error saving email to file:', error);
    }
  }

  // Remove email from file
  async removeEmailFromFile(emailId) {
    try {
      const data = await fs.readFile(config.tempEmailsFile, 'utf8');
      const emailData = JSON.parse(data);
      
      for (const emailAddress in emailData) {
        emailData[emailAddress] = emailData[emailAddress].filter(email => email.id !== emailId);
      }

      await fs.writeFile(config.tempEmailsFile, JSON.stringify(emailData, null, 2));
    } catch (error) {
      console.error('Error removing email from file:', error);
    }
  }

  // Remove all emails for an address from file
  async removeAllEmailsFromFile(emailAddress) {
    try {
      const data = await fs.readFile(config.tempEmailsFile, 'utf8');
      const emailData = JSON.parse(data);
      
      delete emailData[emailAddress];

      await fs.writeFile(config.tempEmailsFile, JSON.stringify(emailData, null, 2));
    } catch (error) {
      console.error('Error removing emails from file:', error);
    }
  }



  // Get stats
  getStats() {
    let totalEmails = 0;
    for (const emails of this.emails.values()) {
      totalEmails += emails.length;
    }

    return {
      totalAddresses: this.emails.size,
      totalEmails
    };
  }
}

module.exports = TempMailService;
