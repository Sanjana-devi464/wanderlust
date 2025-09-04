const Listing = require("./models/listing.js");
const Review = require("./models/review");
const mongoose = require("mongoose");
const ExpressError = require("./utils/ExpressError.js");
// NOTE: On Windows file system is case-insensitive, but keep consistent casing
const { listingSchema,reviewSchema } = require("./Schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
       req.session.redirectUrl = req.originalUrl; // Store the original URL
        req.flash("error", "You must be logged in to do that!");
        return res.redirect("/login");
    }   
        next();
}

module.exports.isAdmin = (req, res, next) => {
    // Only allow admin access for the specific email
    if (!req.user || req.user.email !== 'sanjanash464@gmail.com') {
        req.flash('error', 'Admin access denied. Only authorized admin can access this area.');
        return res.redirect('/');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl; // Update the redirect URL
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) return res.redirect("/listings");
    try {
        // Allow admin access for the specific email
        if (req.user && req.user.email === 'sanjanash464@gmail.com') return next();

        if (!req.user) {
            req.flash("error", "You must be logged in first.");
            return res.redirect(`/login`);
        }

        if (!listing.owner) {
            // Legacy listing without owner; if current user is admin, assign ownership automatically
            if (req.user.email === 'sanjanash464@gmail.com') {
                listing.owner = req.user._id;
                await listing.save();
                req.flash("success", "You are now the owner of this legacy listing.");
            } else {
                req.flash("error", "Listing has no owner assigned yet. Please contact an admin to claim it.");
                return res.redirect(`/listings/${id}`);
            }
        }

        if (!listing.owner.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that!");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        // Defensive: if equals throws, forward error
        next(err);
    }
}; 



// Single listing validation helper
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        return next(new ExpressError(msg, 400));
    }
    next();
};

const validateObjectId = (req, res, next) => {
    try {
        const { id, reviewId } = req.params;
        if (id && !mongoose.Types.ObjectId.isValid(id)) {
            const error = new ExpressError("Invalid listing ID!", 400);
            return next(error);
        }
        if (reviewId && !mongoose.Types.ObjectId.isValid(reviewId)) {
            const error = new ExpressError("Invalid review ID!", 400);
            return next(error);
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports.validateObjectId = validateObjectId;



module.exports.validateListing = validateListing;


module.exports.validateReview = (req, res, next) => {
    try {
        const result = reviewSchema.validate(req.body);
        if (result.error) {
            const msg = result.error.details.map(el => el.message).join(",");
            throw new ExpressError(msg, 400);
        }
        next();
    } catch (error) {
        next(error);
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    
    const currentUserId = req.user ? req.user._id : res.locals.currentUser._id;
    if (!review.author.equals(currentUserId)){
        req.flash("error", "You don't have permission to delete this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};