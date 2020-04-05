const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require('dotenv').config();
const mongoose = require('mongoose');
const routes = require("./routes");
const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({
  origin: ["https://g-list-cb.herokuapp.com"],
  credentials: true
}));
app.use(session({ secret: process.env.sessionSecret, resave: true, saveUninitialized: true, cookie: { maxAge: 7200000 } }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routes);

// mongo connection
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(err => {
    console.log(`mongo connect error: ${err}`);
    console.log(err);
  });
mongoose.set('useFindAndModify', false);

app.listen(PORT, () => {
  console.log(`API server is on port ${PORT}`);
});
