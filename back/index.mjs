import express from "express";
import bodyParser from "body-parser";
import jwt from "express-jwt";
import { getUser } from "./utils.mjs";
import publicRoutuer from "./public/index.mjs";
import privateRouter from "./private/index.mjs";
import dotenv from "dotenv";
if (process.env.NODE_ENV === "develop") {
  dotenv.config();
}

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const ignoredRoutes = (req) => {
  if (req.originalUrl.startsWith("/login")) {
    return true;
  }
  return false;
};

app.use(
  jwt({
    secret: process.env._SECRET,
    algorithms: ["HS512"],
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    },
  }).unless(ignoredRoutes)
);

app.use("/", publicRoutuer, privateRouter);

const handleError = (err, res) => {
  const { statusCode, message } = err;
  res.status(err.name === "UnauthorizedError" ? 401 : statusCode || 500).json({
    error: message,
  });
};
app.use((err, req, res, next) => {
  handleError(err, res);
});

app.listen(8080);
