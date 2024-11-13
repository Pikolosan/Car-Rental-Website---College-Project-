if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Importing route modules
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRoutes = require('./routes/bookings');
// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/car_rental";

// Connect to MongoDB
main()
  .then(() => {
    console.log("Connected to Db");
  })
  .catch((err) => console.log(err));

// Setting up EJS as the view engine with ejsMate for layouts
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to override HTTP methods (e.g., for PUT and DELETE requests)
app.use(methodOverride("_method"));

// Serving static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Main function to connect to MongoDB
async function main() {
  await mongoose.connect(MONGO_URL);
}



const sessionOptions = { 
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Corrected to 1000 milliseconds
    maxAge: 7 * 24 * 60 * 60 * 1000, // Corrected to 1000 milliseconds
    httpOnly: true,
  },
};

// Root route
// app.get("/", (req, res) => {
//   res.send("Hi, I am Root");
// });

app.use(session(sessionOptions));
app.use(flash());
// To apply password and login , we need user tobe in a session  . 
app.use(passport.initialize());  // middleware to initialize passport 
app.use(passport.session());  //allows website to know that same user is travelling btw diff pages.
passport.use(new LocalStrategy(User.authenticate())); // 

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

  next();
})

app.use("/",userRouter);
// Express Router for all listings routes
app.use("/listings", listingRouter);

// Express Router for all reviews routes
app.use("/listings/:id/reviews", reviewRouter);

app.use('/bookings', bookingRoutes);

// Catch-all route for undefined paths
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!!" } = err;
  res.status(statusCode).render("listings/error.ejs", { message });
  // res.status(statusCode).send(message);
});

// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
