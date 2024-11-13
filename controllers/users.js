const User = require("../models/user");
const Listing = require('../models/listing');

// Controller function to render the home page
exports.getHomePage = async (req, res) => {
  try {
    // Fetch a car listing from the database (can fetch multiple as well)
    const listing = await Listing.findOne(); // Adjust the query to fetch specific listings

    // Render the Home.ejs page and pass the listing to it
    res.render('listings/Home', { listing });
  } catch (error) {
    console.log('Error fetching listing:', error);
    res.status(500).send('Server Error');
  }
};

module.exports.renderSignupForm = (req, res) => {
  res.render("../views/users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to StayEase!!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("../views/users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back to StayEase");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next(err);
    }
    req.flash("success", "You have logged out");
    res.redirect("/listings");
  });
};
