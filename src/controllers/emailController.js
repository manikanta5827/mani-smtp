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
}

module.exports = EmailController;
