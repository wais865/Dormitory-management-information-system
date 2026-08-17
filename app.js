const path = require("path");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const fileUpload = require("express-fileupload");
const passport = require("passport");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./configs/db");

dotenv.config({ path: "./configs/config.env" });
connectDB();
require("./configs/passport");

const app = express();
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("layout", "./layouts/mainLayout");
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: "destroy",
  cookie: { httpOnly: true },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    autoRemove: "native"
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(flash());
app.use((req, res, next) => {
  res.locals.message = req.flash();
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/indexRouts"));
app.use("/feed-management", require("./routes/feedManagementRouts"));
app.use("/office-management", require("./routes/officeManagementRouts"));
app.use("/goods-management", require("./routes/goodsManagementRouts"));
app.use(require("./controllers/index/errorController").get404);
app.use(require("./controllers/index/errorController").get500);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
