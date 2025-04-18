const express = require('express');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
const cors = require('cors');
const i18next = require('./utils/i18n');
const i18nextMiddleware = require('i18next-http-middleware');

const userRouter = require('./routs/userRoutes');
const auctionRouter = require('./routs/auctionRoutes');

// Middellwares
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const corsOptions ={
    origin:'http://localhost:3000', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials:true,           
    optionSuccessStatus:200
}

app.use(i18nextMiddleware.handle(i18next));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

// app.use((req, res, next) => {
//   console.log('welcome');
//   next();
// });
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

//app.use('/api/v1/users',userRouter)

//app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auctions', auctionRouter);

app.use('/',(req,res)=>{
  const token = 'sddsdsdsss'
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: true,
  };
  //if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Remove password from output
  res.cookie('jwt', token, cookieOptions).status(statusCode).json({
    status: 'success',
    token,
  });
})
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
