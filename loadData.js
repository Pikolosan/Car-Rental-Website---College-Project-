// This file is used to reload the entire data of the Database
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const {data:listings} = require('./init/data');

const MONGO_URL = 'mongodb://127.0.0.1:27017/car_rental';

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');

  // Clear existing data (optional)
  await Listing.deleteMany({});

  // Insert new data
  await Listing.insertMany(listings);
  console.log('Data loaded');

  // Close the connection
  mongoose.connection.close();
}

main().catch(err => console.log(err));