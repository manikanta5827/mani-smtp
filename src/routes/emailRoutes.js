const express = require('express');
const EmailController = require('../controllers/emailController');

const router = express.Router();
const emailController = new EmailController();

// Generate new temporary email address
router.get('/generate-email', emailController.generateEmail.bind(emailController));

// Get emails for a specific address
router.get('/emails', emailController.getEmails.bind(emailController));

// Delete a specific email
router.delete('/email', emailController.deleteEmail.bind(emailController));

// Delete all emails for an address
router.delete('/emails', emailController.deleteAllEmails.bind(emailController));

// Get service statistics
router.get('/stats', emailController.getStats.bind(emailController));

// Legacy endpoint for backward compatibility
router.get('/legacy-emails', emailController.getLegacyEmails.bind(emailController));

module.exports = router;
