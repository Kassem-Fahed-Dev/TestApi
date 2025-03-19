const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: `./config.env` });
const app = require('./app');
const db = process.env.DATABASE.replace('<PASSWORD>',process.env.password)
mongoose
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log('done'))
  .catch((err) => console.log("not done"));
const port = process.env.port || 3000;
app.listen(port, () => {
  console.log('the server is running');
});
