const mongoose = require('mongoose');
const User = require('./models/user.js');

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
}

async function updateUsername() {
    try {
        // Find and update the user with username "Sanjana1" to "Sanjana Devi"
        const result = await User.findOneAndUpdate(
            { username: "Sanjana1" },
            { username: "Sanjana Devi" },
            { new: true }
        );

        if (result) {
            console.log("Successfully updated username from 'Sanjana1' to 'Sanjana Devi'");
            console.log("Updated user:", result);
        } else {
            console.log("No user found with username 'Sanjana1'");
            
            // Let's also try to find the user with "sanjana" username
            const sanjanaUser = await User.findOneAndUpdate(
                { username: "sanjana" },
                { username: "Sanjana Devi" },
                { new: true }
            );

            if (sanjanaUser) {
                console.log("Successfully updated username from 'sanjana' to 'Sanjana Devi'");
                console.log("Updated user:", sanjanaUser);
            } else {
                console.log("No user found with username 'sanjana' either");
                console.log("Let's check all users:");
                const allUsers = await User.find({});
                console.log("All users in database:", allUsers);
            }
        }
    } catch (error) {
        console.error("Error updating username:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

main()
    .then(() => updateUsername())
    .catch(err => {
        console.error("Connection error:", err);
        mongoose.connection.close();
    });
