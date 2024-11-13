const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//Gets the cloud's acc details
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// tells where to store the data to
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "CarRentalApp_DEV",
    allowedFormats: ["png", "jpeg", "jpg"],
  },
});

module.exports = {
  cloudinary,
  storage,
};
