const mongoose = require('mongoose');
const Listing = require('./models/listing');

// Connect to MongoDB
const MONGO_URL = "mongodb://localhost:27017/wanderlust";

// Approximate coordinates for common locations
const locationCoordinates = {
    "Malibu": [-118.7798, 34.0259],
    "New York City": [-74.0060, 40.7128],
    "London": [-0.1276, 51.5074],
    "Paris": [2.3522, 48.8566],
    "Tokyo": [139.6503, 35.6762],
    "Sydney": [151.2093, -33.8688],
    "Rome": [12.4964, 41.9028],
    "Barcelona": [2.1734, 41.3851],
    "Amsterdam": [4.9041, 52.3676],
    "Berlin": [13.4050, 52.5200],
    "Mumbai": [72.8777, 19.0760],
    "Goa": [74.1240, 15.2993],
    "Shimla": [77.1025, 31.1048],
    "Manali": [77.1892, 32.2432],
    "Jaipur": [75.7873, 26.9124],
    "Udaipur": [73.7125, 24.5854],
    "Kerala": [76.2711, 10.8505],
    "Rishikesh": [78.2676, 30.0869],
    "Darjeeling": [88.2636, 27.0410],
    "Agra": [78.0081, 27.1767],
    "Varanasi": [82.9739, 25.3176],
    "Kolkata": [88.3639, 22.5726],
    "Chennai": [80.2707, 13.0827],
    "Bangalore": [77.5946, 12.9716],
    "Hyderabad": [78.4867, 17.3850],
    "Pune": [73.8567, 18.5204],
    "Mysore": [76.6394, 12.2958],
    "Ooty": [76.6950, 11.4064],
    "Coorg": [75.9064, 12.3375],
    "Hampi": [76.4740, 15.3350],
    "Bali": [115.0920, -8.3405],
    "Santorini": [25.4615, 36.3932],
    "Swiss Alps": [8.2275, 46.8182],
    "Scottish Highlands": [-4.2026, 57.2783],
    "Aspen": [-106.8175, 39.1911],
    "Bora Bora": [-151.7415, -16.5004],
    "Tulum": [-87.4653, 20.2114],
    "Dubai": [55.2708, 25.2048],
    "Banff": [-115.5708, 51.4968],
    "Tuscany": [11.2558, 43.7696]
};

async function updateExistingListings() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to MongoDB");
        
        // Find listings without geometry
        const listingsWithoutGeometry = await Listing.find({ 
            $or: [
                { geometry: { $exists: false } },
                { "geometry.coordinates": [0, 0] }
            ]
        });
        
        console.log(`Found ${listingsWithoutGeometry.length} listings without proper coordinates`);
        
        let updatedCount = 0;
        
        for (let listing of listingsWithoutGeometry) {
            const location = listing.location;
            let coordinates = locationCoordinates[location];
            
            // If exact match not found, try partial matches
            if (!coordinates) {
                for (let knownLocation in locationCoordinates) {
                    if (location.includes(knownLocation) || knownLocation.includes(location)) {
                        coordinates = locationCoordinates[knownLocation];
                        break;
                    }
                }
            }
            
            // Use default coordinates if no match found
            if (!coordinates) {
                coordinates = [-74.0060, 40.7128]; // Default to New York City
            }
            
            // Update the listing
            await Listing.findByIdAndUpdate(listing._id, {
                $set: {
                    geometry: {
                        type: "Point",
                        coordinates: coordinates
                    }
                }
            });
            
            console.log(`Updated ${listing.title} in ${listing.location} with coordinates ${coordinates}`);
            updatedCount++;
        }
        
        console.log(`Successfully updated ${updatedCount} listings with coordinates`);
        
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        
    } catch (error) {
        console.error("Error updating listings:", error);
        process.exit(1);
    }
}

// Run the update
updateExistingListings();
