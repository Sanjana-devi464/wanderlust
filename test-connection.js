// Test MongoDB Atlas Connection
require("dotenv").config();
const mongoose = require("mongoose");

const dbUrl = process.env.ATLASDB_URL;

console.log("Testing MongoDB Atlas Connection...");
console.log("Database URL:", dbUrl ? dbUrl.replace(/<[^>]*>/g, "<PASSWORD_HIDDEN>") : "URL not found");

async function testConnection() {
    try {
        console.log("Attempting to connect to MongoDB Atlas...");
        
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 10000, // 10 second timeout
            socketTimeoutMS: 45000,
        });
        
        console.log("✅ Successfully connected to MongoDB Atlas!");
        
        // Test a simple database operation
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("📋 Available collections:", collections.map(c => c.name));
        
        // Check connection state
        console.log("🔗 Connection state:", mongoose.connection.readyState);
        console.log("🏠 Database name:", mongoose.connection.name);
        console.log("🖥️  Host:", mongoose.connection.host);
        
    } catch (error) {
        console.error("❌ Error connecting to MongoDB Atlas:");
        console.error("Error message:", error.message);
        
        if (error.message.includes("authentication failed")) {
            console.error("🔐 Authentication failed - check your username and password");
        } else if (error.message.includes("ENOTFOUND")) {
            console.error("🌐 Network issue - check your internet connection");
        } else if (error.message.includes("IP address")) {
            console.error("🚫 IP address not whitelisted - add your IP to MongoDB Atlas");
        }
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log("🔌 Connection closed");
    }
}

// Add connection event listeners for more detailed debugging
mongoose.connection.on('connected', () => {
    console.log('📡 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('🚨 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('📵 Mongoose disconnected from MongoDB Atlas');
});

testConnection();
