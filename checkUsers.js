const mongoose = require('mongoose');
const User = require('./models/user.js');

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
}

async function checkUsers() {
    try {
        const allUsers = await User.find({});
        console.log("All users in database:");
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. Username: "${user.username}", Email: "${user.email}", Admin: ${user.isAdmin}`);
        });

        // Look for users that might be the admin
        const adminUsers = allUsers.filter(user => user.isAdmin);
        console.log("\nAdmin users:");
        adminUsers.forEach((user, index) => {
            console.log(`${index + 1}. Username: "${user.username}", Email: "${user.email}"`);
        });

    } catch (error) {
        console.error("Error checking users:", error);
    } finally {
        mongoose.connection.close();
        console.log("Database connection closed");
    }
}

main()
    .then(() => checkUsers())
    .catch(err => {
        console.error("Connection error:", err);
        mongoose.connection.close();
    });
