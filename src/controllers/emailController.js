const TempMailService = require('../services/temp-mail-service');

class EmailController {
  constructor() {
    this.tempMailService = new TempMailService();
  }

  // Generate a new temporary email address
  generateEmail(req, res) {
    try {
      const tempEmail = this.tempMailService.generateTempEmail();
      res.json({ email: tempEmail });
    } catch (error) {
      console.error('Error generating email:', error);
      res.status(500).json({ error: 'Failed to generate email address' });
    }
  }

  // Get emails for a specific address
  getEmails(req, res) {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ error: 'Email address parameter required' });
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        return res.status(400).json({ error: 'Invalid email address format' });
      }
      
      const emails = this.tempMailService.getEmailsForAddress(address);
      res.json({ emails });
    } catch (error) {
      console.error('Error getting emails:', error);
      res.status(500).json({ error: 'Failed to retrieve emails' });
    }
  }

  // Delete a specific email
  async deleteEmail(req, res) {
    try {
      const { id, address } = req.query;
      
      if (!id || !address) {
        return res.status(400).json({ error: 'Email ID and address parameters required' });
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        return res.status(400).json({ error: 'Invalid email address format' });
      }
      
      await this.tempMailService.deleteEmail(address, id);
      res.json({ message: 'Email deleted successfully' });
    } catch (error) {
      console.error('Error deleting email:', error);
      res.status(500).json({ error: 'Failed to delete email' });
    }
  }

  // Delete all emails for an address
  async deleteAllEmails(req, res) {
    try {
      const { address } = req.query;
      
      if (!address) {
        return res.status(400).json({ error: 'Email address parameter required' });
      }
      
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
        return res.status(400).json({ error: 'Invalid email address format' });
      }
      
      await this.tempMailService.deleteAllEmails(address);
      res.json({ message: 'All emails deleted successfully' });
    } catch (error) {
      console.error('Error deleting all emails:', error);
      res.status(500).json({ error: 'Failed to delete emails' });
    }
  }

  // Get service statistics
  getStats(req, res) {
    try {
      const stats = this.tempMailService.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting stats:', error);
      res.status(500).json({ error: 'Failed to retrieve statistics' });
    }
  }

  // Get legacy email log (for backward compatibility)
  async getLegacyEmails(req, res) {
    try {
      const fs = require('fs').promises;
      const config = require('../config/config');
      
      const content = await fs.readFile(config.emailLogFile, 'utf8');
      res.set('Content-Type', 'text/plain; charset=utf-8');
      res.send(content);
    } catch (error) {
      if (error.code === 'ENOENT') {
        res.set('Content-Type', 'text/plain; charset=utf-8');
        res.send('No emails received yet.');
      } else {
        console.error('Error reading legacy email log:', error);
        res.status(500).send('Error reading email log file');
      }
    }
  }
}

module.exports = EmailController;
