const Listing = require("../models/listing.js");
const axios = require('axios');

// Index route to list all car rentals, filtered by carType if specified
module.exports.index = async (req, res, next) => {
  const { carType, categories } = req.query;

  // Build query based on carType and categories if provided
  const query = {
    ...(carType && carType !== 'All' && { carType }),
    ...(categories && categories !== 'All' && { categories })
  };

  const allListings = await Listing.find(query); // Query the listings based on filters

  // Render the view with the filtered listings
  res.render("listings/index.ejs", { allListings });
};

// Route to render the new car rental form
module.exports.newroute = (req, res) => {
  res.render("listings/new.ejs");
};

// Show route for individual car rental listing
module.exports.showroute = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");
  
  if (!listing) {
    req.flash("error", "The requested listing does not exist!");
    return res.redirect("/listings");
  }

  const cuUser = res.locals.currUser;
  res.render("listings/show.ejs", { listing, cuUser: req.user });
};

// Create route to add a new car rental listing
module.exports.createroute = async (req, res) => {
  const { listing } = req.body;
  const { path: url, filename } = req.file || { path: 'default_image_path', filename: 'default_filename' };
  
  const newListing = new Listing({
    ...listing,
    carType: listing.carType, // Set carType
    categories: listing.categories, // Set categories
    owner: req.user._id,
    image: { url, filename },
  });

  await newListing.save();
  req.flash("success", "New Car Rental Created!");
  res.redirect("/listings");
};

// Edit route to render the edit form for a car rental listing
module.exports.editroute = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "The requested listing does not exist!");
    return res.redirect("/listings");
  }

  const orgImgUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, orgImgUrl });
};

// Update route to handle updates to an existing car rental listing
module.exports.updateroute = async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;
  const updatedData = { 
    ...listing, 
    carType: listing.carType, // Update carType
    categories: listing.categories, // Update categories
  };

  let listingDoc = await Listing.findByIdAndUpdate(id, updatedData);

  // Handle file upload if a new image is provided
  if (req.file) {
    listingDoc.image = { url: req.file.path, filename: req.file.filename };
    await listingDoc.save();
  }

  req.flash("success", "Car Rental Updated!");
  res.redirect(`/listings/${id}`);
};

// Destroy route to delete a car rental listing
module.exports.destroyroute = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (deletedListing) console.log("Deleted Listing:", deletedListing);
  req.flash("success", "Car Rental Deleted!");
  res.redirect("/listings");
};

// Search route to filter listings based on title, country, or carType
module.exports.searchListings = async (req, res) => {
  const { query = '', carType = '', categories = '' } = req.query;
  const regex = new RegExp(query, 'i');

  // Build search query with carType and categories if provided
  const searchQuery = {
    $or: [
      { title: regex },
      { location: regex },
      { country: regex }
    ],
    ...(carType && { carType }),
    ...(categories && { categories })
  };

  const listings = await Listing.find(searchQuery);
  res.render('listings/index', { allListings: listings });
};
