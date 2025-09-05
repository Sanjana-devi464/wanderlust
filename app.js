if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
    /*console.log(process.env.SECRET);*/
}

// Node.js v22 compatibility fixes
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
// Add additional OpenSSL legacy provider support
if (process.env.NODE_ENV !== "production") {
    process.env['NODE_OPTIONS'] = '--openssl-legacy-provider';
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const adminRouter = require("./routes/admin.js");
const footerRouter = require("./routes/footer.js");

//const MONGO_URL = "mongodb://localhost:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    console.error("The server will continue running, but database operations will fail.");
    console.error("Please check your MongoDB Atlas IP whitelist and connection string.");
});

async function main(){
    // MongoDB connection with comprehensive compatibility settings
    const connectionOptions = {
        // Timeout settings
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        
        // Pool settings
        maxPoolSize: 10,
        minPoolSize: 2,
        
        // Write concern
        retryWrites: true,
        w: 'majority',
        
        // Network settings for compatibility
        family: 4, // Force IPv4
        
        // For production deployment compatibility
        ...(process.env.NODE_ENV === "production" ? {
            ssl: true,
            authSource: 'admin'
        } : {
            // Development settings - more permissive for Node.js v22
            ssl: false
        })
    };

    try {
        console.log("Attempting MongoDB connection...");
        await mongoose.connect(dbUrl, connectionOptions);
        console.log("MongoDB connection successful!");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.log("Application will continue without database...");
        
        // Graceful degradation - app continues without DB for deployment testing
        process.on('uncaughtException', (err) => {
            if (err.message.includes('MongoDB') || err.message.includes('mongoose')) {
                console.log('MongoDB error caught, continuing...');
                return;
            }
            throw err;
        });
    }
}

// Add connection event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
    touchAfter: 24 * 3600 // Time period in seconds
  }
});

store.on("error", function(e) {
  console.error("Session store error:", e);
});

const sessionOptions = {
  store: store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24, // 1 day
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true, // Helps prevent XSS attacks
    secure: false // Set to true if using HTTPS
  }
};

//app.get("/", (req, res) => {
 // res.send("Hi, I am root!");
//});


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => { 
  res.locals.success = req.flash("success");
  console.log(res.locals.success);
  res.locals.error = req.flash("error");
  console.log(res.locals.error);
  res.locals.currentUser = req.user;
  res.locals.isAdmin = req.user && req.user.isAdmin;
  console.log(res.locals.currentUser);
  next();
});

app.get("/demouser",  async(req, res) => {
  try {
    let fakeUser = new User({
      email: "sanjana@gmail.com",
      username:"Sanjana Devi"
    });

    let registeredUser = await User.register(fakeUser,"HelloSanjana!");
    res.send(registeredUser);
  } catch (err) {
    if (err.name === 'UserExistsError') {
      res.send("User with this username already exists!");
    } else {
      res.send("Error occurred: " + err.message);
    }
  }
})

// Test route for map debugging
app.get("/test-map", (req, res) => {
    res.render("test-map.ejs");
});

// About page route
app.get("/about", (req, res) => {
    res.render("about.ejs");
});

// Root route - redirect to listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/", footerRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    // Check if response has already been sent
    if (res.headersSent) {
        return next(err);
    }
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong!";

    // Normalize common Mongoose errors
    if (err.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid ID format.';
    }
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }

    console.error("[Error Handler]", {
      name: err.name,
      statusCode,
      message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      user: req.user ? { id: req.user._id, username: req.user.username } : null
    });
    res.status(statusCode).render("error.ejs", { statusCode, message });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});