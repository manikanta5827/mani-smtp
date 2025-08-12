const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;

const config = require('../config/config');

class SMTPServerService {
  constructor() {
    this.server = null;
  }

  // Function to validate email domain - only accept chilaka.online domain
  validateEmailDomain(email) {
    return email.toLowerCase().endsWith('@chilaka.online');
  }

  createServer() {
    this.server = new SMTPServer({
      // No authentication required - this server only receives emails
      authOptional: true,
      
      // Validate sender - accept emails from any domain
      onMailFrom: (address, session, callback) => {
        console.log(`Email from: ${address.address}`);
        callback(); // Accept emails from any sender
      },

      // Validate recipient - only accept emails to chilaka.online domain
      onRcptTo: (address, session, callback) => {
        if (!this.validateEmailDomain(address.address)) {
          console.log(`Rejected email to: ${address.address} - not a chilaka.online address`);
          return callback(new Error('Only chilaka.online addresses are accepted'));
        }
        console.log(`Accepted email to: ${address.address}`);
        callback();
      },

      // Connection handler
      onConnect: (session, callback) => {
        console.log(`New SMTP connection from: ${session.remoteAddress}`);
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
      console.log(`📧 SMTP server running on port ${config.smtpPort}`);
      console.log(`🎯 Only accepting emails for: *.chilaka.online`);
      console.log(`🔓 No authentication required (receive-only server)`);
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
