// server.js
const { SMTPServer } = require('smtp-server');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs').promises;
const http = require('http');

const EMAIL_LOG_FILE = 'emails.txt';
const SMTP_PORT = 2525;
const HTTP_PORT = 3001;
// Function to append email data to file asynchronously
async function saveEmailToFile(emailData) {
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
    
    await fs.appendFile(EMAIL_LOG_FILE, emailEntry);
    console.log(`Email saved to ${EMAIL_LOG_FILE}`);
  } catch (error) {
    console.error('Error saving email to file:', error);
  }
}

// Create SMTP server
const server = new SMTPServer({
  // No auth for local testing
  authOptional: true,

  // Called when a new email is received
  onData(stream, session, callback) {
    simpleParser(stream) // Parse incoming mail
      .then(parsed => {
        console.log("=== New Email Received ===");
        console.log("From:", parsed.from.text);
        console.log("To:", parsed.to.text);
        console.log("Subject:", parsed.subject);
        console.log("Body:", parsed.text);
        console.log("==========================");
        
        // Save email data to file asynchronously
        const emailData = {
          from: parsed.from.text,
          to: parsed.to.text,
          subject: parsed.subject,
          body: parsed.text
        };
        
        saveEmailToFile(emailData);
      })
      .catch(err => console.error(err))
      .finally(() => callback()); // Required to finish processing
  }
});

// Create HTTP server to serve the email log file
const httpServer = http.createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/emails') {
    try {
      const content = await fs.readFile(EMAIL_LOG_FILE, 'utf8');
      res.writeHead(200, { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(200, { 
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('No emails received yet.');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading email log file');
      }
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start SMTP server on port 2525
server.listen(SMTP_PORT, "0.0.0.0", () => {
  console.log(`SMTP server running on port ${SMTP_PORT}`);
});

// Start HTTP server on port 3000
httpServer.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
  console.log(`Email log accessible at: http://localhost:${HTTP_PORT}/emails`);
});