const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let { id } = req.params; // Get listing ID from URL params
    
    // Check if user is authenticated
    if (!req.user) {
        req.flash("error", "You must be logged in to leave a review!");
        return res.redirect("/login");
    }
    
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    
    let newReview = new Review({
        listingId: id,
        author: req.user._id, // Use user's ObjectId for proper referencing
        rating: req.body.review.rating,
        comment: req.body.review.comment
    });
    
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    
    req.flash("success", "Successfully added a new review!");
    console.log("New review added:", newReview);
    console.log("Listing updated:", listing);
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview =  async (req, res) => {
    const { id, reviewId } = req.params; // Get both listing ID and review ID
    await Review.findByIdAndDelete(reviewId);
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    listing.reviews.pull(reviewId);
    
    await listing.save();
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
};
