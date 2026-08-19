// src/middleware/errorHandler.js
import ApiError from '../utils/ApiError.js';

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      error: err.statusCode === 409 ? 'Conflict' : err.statusCode === 401 ? 'Unauthorized' : 'Bad Request',
      statusCode: err.statusCode,
    });
  }
  console.error(err);
  return res.status(500).json({ message: 'Internal server error', error: 'Internal Server Error', statusCode: 500 });
}

export default errorHandler;