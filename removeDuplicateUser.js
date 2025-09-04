const mongoose = require('mongoose');
const User = require('./models/user.js');
const Listing = require('./models/listing.js');

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
}

async function removeDuplicateUser() {
    try {
        // First, let's find the admin user (Sanjana Devi)
        const adminUser = await User.findOne({ email: "sanjanash464@gmail.com" });
        console.log("Admin user found:", adminUser);

        // Find the Sanjana1 user
        const sanjana1User = await User.findOne({ username: "Sanjana1" });
        console.log("Sanjana1 user found:", sanjana1User);

        if (sanjana1User && adminUser) {
            // Transfer any listings owned by Sanjana1 to the admin user
            const listingsToTransfer = await Listing.find({ owner: sanjana1User._id });
            console.log(`Found ${listingsToTransfer.length} listings owned by Sanjana1`);

            if (listingsToTransfer.length > 0) {
                await Listing.updateMany(
                    { owner: sanjana1User._id },
                    { owner: adminUser._id }
                );
                console.log("Transferred all listings from Sanjana1 to Sanjana Devi");
            }

            // Delete the Sanjana1 user
            await User.findByIdAndDelete(sanjana1User._id);
            console.log("Successfully deleted Sanjana1 user");
            console.log("Now only 'Sanjana Devi' remains as the admin user");
        } else {
            console.log("Could not find one or both users");
        }

    } catch (error) {
        console.error("Error removing duplicate user:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

main()
    .then(() => removeDuplicateUser())
    .catch(err => {
        console.error("Connection error:", err);
        mongoose.connection.close();
    });
