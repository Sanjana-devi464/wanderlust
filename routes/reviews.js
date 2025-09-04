const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
//const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js"); 
const Listing = require("../models/listing.js");
const mongoose = require("mongoose"); 
const {validateReview, isLoggedIn, isReviewAuthor, validateObjectId}=require("../middleware.js");

const reviewsController = require("../controllers/reviews.js");

//reviews --> POST route

router.post("/", isLoggedIn, validateObjectId, validateReview,
     wrapAsync(reviewsController.createReview));


//reviews --> DELETE route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,
    validateObjectId, wrapAsync(reviewsController.deleteReview));

module.exports = router;
// End of reviews routes