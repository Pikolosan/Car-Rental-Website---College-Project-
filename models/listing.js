const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const ListingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  image: {
    filename: {
      type: String,
      default: "defaultcarimage",
    },
    url: {
      type: String,
      default: "public/images/Daco_520651.png", // Default car image URL
      set: (v) =>
        v === ""
          ? "public/images/Daco_520651.png" // Default car image URL
          : v,
    },
  },
  pricePerDay: {
    type: Number,
    min: 0, // Ensure price is not negative
  },
  location: String,
  carType: {
    type: String, 
    enum: ['SUV', 'Sedan', 'Truck', 'Hatchback', 'Convertible', 'Coupe'], // Specify types of cars
    required: true,
  },
  year: {
    type: Number, // Year of manufacture
    required: true,
  },
  categories: {
    type: [String], // List of categories like Luxury, Electric, Sport, etc.
    enum: ['Luxury', 'Economy', 'Sport', 'Electric','Family','Offroad'], // Define possible categories
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  availability: {
    type: Boolean,
    default: true, // Indicating whether the car is available for rent
  },
  passengerCapacity: {
    type: Number, // Number of passengers the car can hold
    required: true,
  },
  fuelType: {
    type: String, // Fuel type of the car
    enum: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
    required: true,
  },
  transmissionType: {
    type: String, // Transmission type of the car
    enum: ['Automatic', 'Manual'],
    required: true,
  },
});

ListingSchema.post("findOneAndDelete", async (carListing) => {
  if (carListing) {
    await Review.deleteMany({ _id: { $in: carListing.reviews } });
  }
});

const Listing = mongoose.model("Listing", ListingSchema);
module.exports = Listing;
