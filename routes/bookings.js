const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Listing = require('../models/listing');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Display the booking page
router.get('/booking/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect('/listings');
        }
        // Pass listing._id as listingId to the template
        res.render('listings/booking', { listingId: listing._id, listing });
    } catch (error) {
        console.error(error);
        req.flash("error", "There was an issue loading the booking page.");
        res.redirect('/listings');
    }
});


router.post('/', async (req, res) => {
    // Ensure that variable names align with the schema fields
    const { carListingId, startDate, endDate, pickupLocation, carType } = req.body;

    // Convert dates from string to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that the start and end dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        req.flash("error", "Invalid dates provided.");
        return res.redirect(`/bookings/booking/${carListingId}`);
    }

    // Validate date range
    if (start >= end) {
        req.flash("error", "Start date must be before end date.");
        return res.redirect(`/bookings/booking/${carListingId}`);
    }

    try {
        // Fetch listing by `carListingId`
        const listing = await Listing.findById(carListingId);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect(`/bookings/booking/${carListingId}`);
        }

        // Calculate the total cost based on the number of days and listing price
        const totalCost = (end - start) / (1000 * 3600 * 24) * listing.pricePerDay;

        // Ensure totalCost is a valid number and positive
        if (isNaN(totalCost) || totalCost <= 0) {
            req.flash("error", "Invalid total cost calculation.");
            return res.redirect(`/bookings/booking/${carListingId}`);
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${listing.title} Booking`,
                        },
                        unit_amount: Math.round(totalCost * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.BASE_URL}/bookings/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/listings/${carListingId}`,
        });

        // Save the booking to the database with the necessary fields
        const booking = new Booking({
            carListingId,          // Use carListingId to match the schema
            userId: req.user._id,   // Ensure the user is logged in
            startDate: start,
            endDate: end,
            pickupLocation,
            carType,
            totalCost,              // Store the cost for reference
            stripeSessionId: session.id,
        });

        await booking.save(); // Save the booking to the database

        req.flash("success", "Booking confirmed! Please proceed with the payment.");
        res.redirect(session.url); // Redirect user to Stripe checkout

    } catch (error) {
        console.error(error);
        req.flash("error", "There was an issue with the booking process.");
        res.redirect(`/bookings/booking/${carListingId}`);
    }
});

// Handle successful payment and view bookings
router.get('/my-bookings', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    try {
        const bookings = await Booking.find({ userId: req.user._id }).populate('carListingId');
        console.log(bookings);
        res.render('listings/myBookings', { bookings });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Could not retrieve bookings.');
        res.redirect('/listings');
    }
});

// Handle Stripe payment completion
router.get('/complete', async (req, res) => {
    const { booking_id } = req.query;
    if (!booking_id) {
        req.flash("error", "Booking ID missing.");
        return res.redirect('/bookings/my-bookings');
    }

    try {
        // Retrieve the booking and mark it as confirmed
        const booking = await Booking.findById(booking_id);
        if (!booking) {
            req.flash("error", "Booking not found.");
            return res.redirect('/bookings/my-bookings');
        }

        // Confirm the booking
        booking.status = 'confirmed'; // Example status update
        await booking.save();

        req.flash("success", "Booking confirmed and payment successful!");
        res.redirect('/bookings/my-bookings');
    } catch (error) {
        console.error(error);
        req.flash("error", "There was an issue confirming your booking.");
        res.redirect('/bookings/my-bookings');
    }
});

// Cancel the booking
router.delete('/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        await Booking.findByIdAndDelete(bookingId);
        req.flash("success", "Booking canceled successfully.");
        res.redirect('/bookings/my-bookings');
    } catch (error) {
        console.error(error);
        req.flash("error", "There was a problem canceling your booking.");
        res.redirect('/bookings/my-bookings');
    }
});

module.exports = router;
