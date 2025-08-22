const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

require('dotenv').config({ path: '../.env' });
const MONGO_URL = process.env.MONGO_URL;

main()
  .then(() => {
    console.log("Connected to MongoDB");
    initDB();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

async function initDB() {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "673111a86512ab29681ab2aa",
  }));
  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
}
