const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
require('dotenv').config();
const mongoose = require('mongoose');
const routes = require("./routes");
const PORT = process.env.PORT || 3001;
const app = express();
const db = require("./models");
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const whitelist = [];
if (process.env.api_url) {
  whitelist.push(process.env.api_url);
  console.log("api url added to whitelist\n");
} else {
  whitelist.push("http://localhost:3000");
  console.log("api url not found\n");
}
app.use(cors({
  origin: whitelist,
  credentials: true
}));
app.use(session(
  {
    secret: process.env.sessionSecret,
    store: new SequelizeStore({
      db: db.sequelize
    }),
    resave: true,
    saveUninitialized: true,
    sameSite: "none",
    cookie: {
      maxAge: 14000000
    }
  }
));

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

db.sequelize.sync({ force: false }).then(function () {
  app.listen(PORT, () => {
    console.log(`API server is on port ${PORT}`);
  });
});
