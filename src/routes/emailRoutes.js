const express = require('express');
const EmailController = require('../controllers/emailController');

const router = express.Router();
const emailController = new EmailController();

// Generate new temporary email address
router.get('/generate-email', emailController.generateEmail.bind(emailController));

module.exports = router;
