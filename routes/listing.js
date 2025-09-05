const express = require("express");
const router = express.Router();
//const mongoose = require("mongoose");
const wrapAsync = require("../utils/wrapAsync.js");
//const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../Schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateObjectId, validateListing} = require("../middleware.js");
const listingsController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage });


// Index + Create
router
 .route("/")
 .get(wrapAsync(listingsController.index))
 .post(
      isLoggedIn,
      upload.single('listing[image]'),
      validateListing,
      wrapAsync(listingsController.createListing)
 );

// Search route
router.get("/search", wrapAsync(listingsController.searchListings));

// Filter route
router.get("/filter/:category", wrapAsync(listingsController.filterByCategory));



//new route
router.get("/new", isLoggedIn, listingsController.renderNewForm);





router.route("/:id")
.get(validateObjectId, wrapAsync(listingsController.showListing))
.put(isLoggedIn,
     validateObjectId, isOwner,
      validateListing,
     wrapAsync(listingsController.updateListing))
.delete(isLoggedIn, isOwner
     , validateObjectId, 
     wrapAsync(listingsController.destroyListing));

//edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm) );


module.exports = router;