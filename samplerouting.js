router.post('/', async (req, res) => {
    const { ListingId, startDate, endDate, pickupLocation, carType } = req.body;

    // Convert dates from string to Date objects for calculation
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate that the dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        req.flash("error", "Invalid dates provided.");
        return res.redirect(`/bookings/booking/${ListingId}`);
    }

    // Validate date range
    if (start >= end) {
        req.flash("error", "Start date must be before end date.");
        return res.redirect(`/bookings/booking/${ListingId}`);
    }

    try {
        const listing = await Listing.findById(ListingId);
        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect(`/bookings/booking/${ListingId}`);
        }

        // Ensure listing.price is a valid number and greater than 0
        if (typeof listing.price !== 'number' || listing.price <= 0) {
            req.flash("error", "Invalid price for the listing.");
            return res.redirect(`/bookings/booking/${ListingId}`);
        }

        // Calculate the number of days between start and end
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const numDays = Math.ceil((end - start) / millisecondsPerDay); // Use ceil to round up to full days

        // Calculate the total cost
        const totalCost = numDays * listing.price;

        // Validate that totalCost is a positive number
        if (isNaN(totalCost) || totalCost <= 0) {
            req.flash("error", "Invalid total cost calculation.");
            return res.redirect(`/bookings/booking/${ListingId}`);
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
            success_url: `${process.env.BASE_URL}/bookings/complete?booking_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.BASE_URL}/listings/${ListingId}`,
        });

        // Save the booking to the database
        const booking = new Booking({
            ListingId,
            userId: req.user._id,
            startDate: start,
            endDate: end,
            pickupLocation,
            carType,
            totalCost,
            stripeSessionId: session.id,
        });

        await booking.save();

        req.flash("success", "Booking confirmed! Please proceed with the payment.");
        res.redirect(session.url);

    } catch (error) {
        console.error(error);
        req.flash("error", "There was an issue with the booking process.");
        res.redirect(`/bookings/booking/${ListingId}`);
    }
});
