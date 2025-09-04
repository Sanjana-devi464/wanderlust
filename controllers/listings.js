const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
   try {
       const allListings = await Listing.find({}).populate('reviews');
       
       // Calculate average rating for each listing
       const listingsWithRatings = allListings.map(listing => {
           if (listing.reviews && listing.reviews.length > 0) {
               const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
               listing.averageRating = (totalRating / listing.reviews.length).toFixed(1);
               listing.reviewCount = listing.reviews.length;
           } else {
               listing.averageRating = 0;
               listing.reviewCount = 0;
           }
           return listing;
       });
       
       res.render("listings/index.ejs", { allListings: listingsWithRatings });
   } catch (error) {
       console.error("Error fetching listings:", error.message);
       
       // Check if it's a MongoDB connection error
       if (error.name === 'MongooseServerSelectionError' || error.name === 'MongooseTimeoutError') {
           req.flash("error", "Database connection error. Please check your internet connection and try again later.");
       } else {
           req.flash("error", "Unable to load listings. Please try again later.");
       }
       
       res.render("listings/index.ejs", { allListings: [] });
   }
};

module.exports.searchListings = async (req, res) => {
    try {
        const { destination } = req.query;
        
        if (!destination || destination.trim() === "") {
            req.flash("error", "Please enter a search destination!");
            return res.redirect("/listings");
        }

        // First, search for exact location matches (highest priority)
        const locationMatches = await Listing.find({
            location: { $regex: destination, $options: "i" }
        }).populate('reviews');

        // Then, search for other matches (title, country, description) excluding already found location matches
        const locationMatchIds = locationMatches.map(listing => listing._id);
        const otherMatches = await Listing.find({
            _id: { $nin: locationMatchIds }, // Exclude location matches to avoid duplicates
            $or: [
                { title: { $regex: destination, $options: "i" } },
                { country: { $regex: destination, $options: "i" } },
                { description: { $regex: destination, $options: "i" } }
            ]
        }).populate('reviews');

        // Combine results with location matches first (prioritized)
        const searchResults = [...locationMatches, ...otherMatches];
        
        // Calculate average rating for each listing
        const listingsWithRatings = searchResults.map(listing => {
            if (listing.reviews && listing.reviews.length > 0) {
                const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
                listing.averageRating = (totalRating / listing.reviews.length).toFixed(1);
                listing.reviewCount = listing.reviews.length;
            } else {
                listing.averageRating = 0;
                listing.reviewCount = 0;
            }
            return listing;
        });
        
        if (listingsWithRatings.length === 0) {
            req.flash("error", `No listings found for "${destination}". Try searching with different keywords.`);
            return res.redirect("/listings");
        }

        // Create informative success message
        let successMessage = `Found ${listingsWithRatings.length} listing(s) for "${destination}"`;
        if (locationMatches.length > 0) {
            successMessage += ` (${locationMatches.length} location match${locationMatches.length > 1 ? 'es' : ''} shown first)`;
        }
        
        req.flash("success", successMessage);
        res.render("listings/index.ejs", { 
            allListings: listingsWithRatings,
            searchQuery: destination,
            locationMatches: locationMatches.length,
            totalResults: listingsWithRatings.length
        });
        
    } catch (error) {
        console.error("Search error:", error);
        req.flash("error", "Something went wrong while searching. Please try again.");
        res.redirect("/listings");
    }
};

module.exports.filterByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        // Validate category
        const validCategories = ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Camping", "Farms", "Arctic", "Amazing Pools", "Nature", "Domes", "Boats"];
        
        if (!validCategories.includes(category)) {
            req.flash("error", "Invalid category selected!");
            return res.redirect("/listings");
        }

        const filteredListings = await Listing.find({ category: category }).populate('reviews');
        
        // Calculate average rating for each listing
        const listingsWithRatings = filteredListings.map(listing => {
            if (listing.reviews && listing.reviews.length > 0) {
                const totalRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
                listing.averageRating = (totalRating / listing.reviews.length).toFixed(1);
                listing.reviewCount = listing.reviews.length;
            } else {
                listing.averageRating = 0;
                listing.reviewCount = 0;
            }
            return listing;
        });
        
        if (listingsWithRatings.length === 0) {
            req.flash("error", `No listings found in "${category}" category. Showing all listings instead.`);
            return res.redirect("/listings");
        }

        req.flash("success", `Found ${listingsWithRatings.length} listing(s) in "${category}" category`);
        res.render("listings/index.ejs", { 
            allListings: listingsWithRatings,
            selectedCategory: category
        });
        
    } catch (error) {
        console.error("Filter error:", error);
        req.flash("error", "Something went wrong while filtering. Please try again.");
        res.redirect("/listings");
    }
};


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let{ id } = req.params;
    const listing = await Listing.findById(id)
    .populate(
        {
         path: "reviews",
    populate:{
        path:"author",
    },
    })
    .populate("owner");

    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    
    // Create a clean object for JSON stringification to avoid circular references
    const cleanListing = {
        _id: listing._id,
        title: listing.title,
        description: listing.description,
        image: listing.image,
        price: listing.price,
        location: listing.location,
        country: listing.country,
        geometry: listing.geometry,
        category: listing.category,
        owner: listing.owner ? {
            _id: listing.owner._id,
            username: listing.owner.username
        } : null,
        reviews: listing.reviews ? listing.reviews.map(review => ({
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            author: review.author ? {
                _id: review.author._id,
                username: review.author.username
            } : null,
            createdAt: review.createdAt
        })) : []
    };
    
    console.log("Listing:", listing);
    console.log("Clean listing for map:", cleanListing);
    res.render("listings/show.ejs", { listing, cleanListing });
};

module.exports.createListing =  async (req, res) => {
    let response = await geocodingClient
       .forwardGeocode({
        query: req.body.listing.location,
        limit:1,
    }) 
    .send();

    console.log("req.user:", req.user);
    console.log("res.locals.currentUser:", res.locals.currentUser);
    console.log("req.isAuthenticated():", req.isAuthenticated());
    
    const currentUser = req.user || res.locals.currentUser;
    if (!currentUser || !currentUser._id) {
        req.flash("error", "Authentication error. Please log in again.");
        return res.redirect("/login");
    }
    
    const newListing = new Listing(req.body.listing);
    newListing.owner = currentUser._id;
    console.log("newListing.owner set to:", newListing.owner);
    console.log("newListing before save:", newListing);

    newListing.geometry = response.body.features[0].geometry;

    try {
      let savedListing = await newListing.save();
      console.log("Saved listing:", savedListing);
        req.flash("success", "Successfully created a new listing!");
        res.redirect("/listings");
    } catch (error) {
        console.error("Error saving listing:", error);
        req.flash("error", "Error creating listing: " + error.message);
        res.redirect("/listings/new");
    }
};


module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};



module.exports.updateListing =  async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    await Listing.findByIdAndUpdate(id, req.body.listing);
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing =  async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    console.log("Deleted listing ");
    req.flash("success", "Successfully deleted the listing!");
    res.redirect("/listings");
};
