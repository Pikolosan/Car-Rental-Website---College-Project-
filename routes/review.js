const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { validateReview, isLoggedIn, isauthor } = require("../middleware.js");

const ReviewController = require("../controllers/review.js");

//Reviews:
//Post Route
// router.post("/", async (req, res) => {
//   console.log("Minimal POST /reviews route reached");
//   res.send("Minimal route test");
// });

router.post(
  "/",
  isLoggedIn("You must be logged in to leave a review"), // Ensure message is provided
  validateReview,
  wrapAsync(ReviewController.createReview)
);

//Delete Rote
router.delete("/:reviewId", isLoggedIn("You must be logged in!!"), isauthor, wrapAsync(ReviewController.destroyreview));


module.exports = router;
