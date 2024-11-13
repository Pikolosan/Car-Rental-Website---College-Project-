const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createroute)
  );

// New Route for creating a car rental listing
router.get(
  "/new",
  isLoggedIn("You must be logged in to create a listing!"),
  listingController.newroute
);

router.route("/search").get(wrapAsync(listingController.searchListings));

router
  .route("/:id")
  .get(wrapAsync(listingController.showroute))
  .put(
    isLoggedIn("You must be logged in to update this listing!"),
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateroute)
  )
  .delete(
    isLoggedIn("You must be logged in to delete this listing!"),
    wrapAsync(listingController.destroyroute)
  );

// Edit Route for car rental listing
router.get(
  "/:id/edit",
  isLoggedIn("You must be logged in to edit this listing!"),
  wrapAsync(listingController.editroute)
);

module.exports = router;
