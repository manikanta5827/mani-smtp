const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs').promises;

const config = require('../config/config');

class SMTPServerService {
  constructor(tempMailService) {
    this.tempMailService = tempMailService;
    this.server = null;
  }

  // Function to validate email domain (disabled for temp mail service)
  validateEmailDomain(email) {
    // For temp mail service, accept emails from any domain
    return true;
  }

  // Function to append email data to file asynchronously
  async saveEmailToFile(emailData) {
    try {
      const timestamp = new Date().toISOString();
      const emailEntry = `
=== New Email Received at ${timestamp} ===
From: ${emailData.from}
To: ${emailData.to}
Subject: ${emailData.subject}
Body: ${emailData.body}
==========================================
`;
      
      await fs.appendFile(config.emailLogFile, emailEntry);
      console.log(`Email saved to ${config.emailLogFile}`);
    } catch (error) {
      console.error('Error saving email to file:', error);
    }
  }

  createServer() {
    this.server = new SMTPServer({
      // Enable authentication for production
      authOptional: !config.productionMode,
      
      // Authentication handler
      onAuth: (auth, session, callback) => {
        if (!config.productionMode) {
          return callback(null, { user: 'test' });
        }
        
        // Simple username/password authentication
        const validUsers = {
          'admin': config.smtpPassword,
        };
        
        if (validUsers[auth.username] === auth.password) {
          callback(null, { user: auth.username });
        } else {
          callback(new Error('Invalid credentials'));
        }
      },

      // Validate sender
      onMailFrom: (address, session, callback) => {
        if (config.productionMode && !this.validateEmailDomain(address.address)) {
          return callback(new Error('Unauthorized sender domain'));
        }
        callback();
      },

      // Validate recipient
      onRcptTo: (address, session, callback) => {
        if (config.productionMode && !this.validateEmailDomain(address.address)) {
          return callback(new Error('Unauthorized recipient domain'));
        }
        callback();
      },

      // Connection handler
      onConnect: (session, callback) => {
        callback();
      },

      // Called when a new email is received
      onData: async (stream, session, callback) => {
        try {
          const parsed = await simpleParser(stream);
          
          console.log("=== New Email Received ===");
          console.log("From:", parsed.from.text);
          console.log("To:", parsed.to.text);
          console.log("Subject:", parsed.subject);
          console.log("Body:", parsed.text);
          console.log("Client IP:", session.remoteAddress);
          console.log("==========================");
          
          // Store in temp mail service
          try {
            await this.tempMailService.storeEmail(
              parsed.to.text,
              parsed.from.text,
              parsed.subject,
              parsed.text,
              parsed.html
            );
          } catch (error) {
            console.error('Failed to store email in temp mail service:', error);
          }
          
          // Also save to legacy file format
          const emailData = {
            from: parsed.from.text,
            to: parsed.to.text,
            subject: parsed.subject,
            body: parsed.text
          };
          
          try {
            await this.saveEmailToFile(emailData);
          } catch (error) {
            console.error('Failed to save email to legacy file:', error);
          }
          
          callback();
        } catch (err) {
          console.error('Error parsing email:', err);
          callback(err);
        }
      },

      // Error handling
      onError: (err) => {
        console.error('SMTP Server Error:', err);
      }
    });

    return this.server;
  }

  start() {
    if (!this.server) {
      this.createServer();
    }

    this.server.listen(config.smtpPort, "0.0.0.0", () => {
      console.log(`SMTP server running on port ${config.smtpPort}`);
      console.log(`Production mode: ${config.productionMode}`);
      console.log(`Authentication required: ${config.productionMode}`);
    });
  }

  stop() {
    if (this.server) {
      this.server.close(() => {
        console.log('SMTP server closed');
      });
    }
  }
}

module.exports = SMTPServerService;
