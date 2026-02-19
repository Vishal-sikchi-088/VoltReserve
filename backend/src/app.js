const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const managerRouter = require("./routes/manager");
const operatorRouter = require("./routes/operator");
const notFound = require("./middleware/not-found");
const errorHandler = require("./middleware/error-handler");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-this-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true
    }
  })
);
app.use(
  morgan("dev", {
    skip: () => process.env.NODE_ENV === "test"
  })
);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/manager", managerRouter);
app.use("/api/operator", operatorRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
