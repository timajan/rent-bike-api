const multer = require('multer');
const logger = require('../utils/logger');

function errorMiddleware(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum size is 2 MB';
    }
  }

  logger.error('Server error', {
    message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  });

  res.status(statusCode).json({
    error: message,
    statusCode,
  });
}

module.exports = errorMiddleware;
