const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;

const config = require('./config/config');
const emailRoutes = require('./routes/emailRoutes');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS configuration
app.use(cors());

// Logging middleware
if (config.nodeEnv === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', emailRoutes);

// Serve main HTML interface
app.get('/', async (req, res) => {
  try {
    const htmlPath = path.join(__dirname, '../public/index.html');
    const content = await fs.readFile(htmlPath, 'utf8');
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(content);
  } catch (error) {
    res.status(404).send('HTML interface not found');
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
