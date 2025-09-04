const mongoose = require("mongoose");
const review = require("./review.js");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    description: String, 
    image: {
        filename: {
            type: String,
            default: "listingimage"
        },
        url: {
            type: String,
            default: "https://unsplash.com/photos/purple-and-orange-clouds-create-a-beautiful-sunset-Mk3AqH8hqGQ",
            set: (v) =>
              v === ""
               ? "https://unsplash.com/photos/purple-and-orange-clouds-create-a-beautiful-sunset-Mk3AqH8hqGQ"
               : v,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
     owner:
     {
        type: Schema.Types.ObjectId,
        ref: "User",
     },
     geometry: {
         type: {
             type: String,
             enum: ["Point"],
             required: true
         },
         coordinates: {
             type: [Number],
             required: true
         },
     },
     category:{
        type: String,
        enum: ["Trending", "Rooms", "Iconic Cities",
            "Mountains", "Castles", "Camping", "Farms",
            "Arctic", "Amazing Pools", "Nature", "Domes", "Boats"],
        default: "Trending"
     }
});

// Middleware to delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async function (listing) {
    if (listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;