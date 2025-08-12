// Temp Mail Service - Email Generation Only
const crypto = require('crypto');
const config = require('../config/config');

class TempMailService {
  constructor() {
    // No email storage needed for now
  }

  // Generate a random email address
  generateTempEmail() {
    const randomString = crypto.randomBytes(8).toString('hex');
    const domain = config.tempMailDomain;
    return `${randomString}@${domain}`;
  }
}

module.exports = TempMailService;
