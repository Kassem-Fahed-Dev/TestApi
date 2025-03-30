const AppError = require('./../utils/appError');


const handleError = err =>{
  const message = err.message ;
  return new AppError(message, 401);
}

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field '${field}' with value '${value}'. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);


const translateErrorMessage = (message, req) => {
  const translationMap = [
    {
      pattern: /Invalid (\w+): (.*?)\./,
      key: 'errors.invalidCast',
      params: (match) => ({ path: req.t(`fields:${match[1]}`) || match[1], value: match[2] })
    },
    {
      pattern: /Duplicate field '(\w+)' with value '(.*?)'\. Please use another value!/,
      key: 'errors.duplicateField',
      params: (match) => ({ field: req.t(`fields:${match[1]}`) || match[1], value: match[2] })
    },
    {
      pattern: /Validation failed: (.*)/,
      key: 'errors.validationFailed',
      params: (match) => ({ errors: match[1] })
    },
    {
      pattern: /Incorrect email or password/,
      key: 'errors.login'
    },
    {
      pattern: /Invalid token\. Please log in again!/,
      key: 'errors.invalidToken'
    },
    {
      pattern: /Your token has expired! Please log in again\./,
      key: 'errors.expiredToken'
    }
  ];

  for (const { pattern, key, params } of translationMap) {
    const match = message.match(pattern);
    if (match) {
      return req.t(key, params ? params(match) : {});
    }
  }

  return req.t('errors.genericError');
};

const sendErrorDev = (err,res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, req , res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const translatedMessage = translateErrorMessage(err.message, req);
    res.status(err.statusCode).json({
      status: err.status,
      message: translatedMessage
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: 'error',
      message: req.t('errors.genericError')
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if(err.name == 'Error') error = handleError(err);
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req , res);
  }
};
