const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the booking schema for car rental
const bookingSchema = new Schema({
    carListingId: {  // Change listingId to carListingId to match car listings
        type: Schema.Types.ObjectId,
        ref: 'Listing',  // Reference to the CarListing model
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    pickupLocation: {  // Added pickupLocation field for car rentals
        type: String,
        required: true,
    },
    carType: {  // Added carType to specify the vehicle being booked (optional)
        type: String,
        enum: ['SUV', 'Sedan', 'Truck', 'Hatchback', 'Convertible', 'Coupe'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Use mongoose.models.Booking to prevent model overwriting
const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

module.exports = Booking;
