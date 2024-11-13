const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    // description: Joi.string().required(),
    location: Joi.string().required(),
    pricePerDay: Joi.number().required().min(0),
    image: Joi.object({
      filename: Joi.string().optional(),
      url: Joi.string().optional(),
    }).optional(),
    carType: Joi.string()
      .valid('SUV', 'Sedan', 'Truck', 'Hatchback', 'Convertible', 'Coupe')
      .required(),
    year: Joi.number().required(),
    categories: Joi.array()
      .items(Joi.string().valid('Luxury', 'Economy', 'Sport', 'Electric', 'Family', 'Offroad'))
      .optional(),
    reviews: Joi.array().items(Joi.string().optional()), // Array of review IDs as strings
    owner: Joi.string().optional(), // Owner's ID as a string (assuming it's an ObjectId)
    availability: Joi.boolean().optional(),
    passengerCapacity: Joi.number().required(), // Matches passengerCapacity in Mongoose schema
    fuelType: Joi.string()
      .valid('Petrol', 'Diesel', 'Hybrid', 'Electric')
      .required(),
    transmissionType: Joi.string()
      .valid('Automatic', 'Manual')
      .required(),
  }).required(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(0).max(5),
    comment: Joi.string().required()
  }).required()
});
