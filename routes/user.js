const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
//const ExpressError = require("../utils/ExpressError.js");
//const { userSchema } = require("../Schema.js");

const usersController = require("../controllers/users.js");
const user = require("../models/user.js");

router.route("/signup")
  .get( usersController.renderSignupForm)
  .post( wrapAsync(usersController.signup));

router.route("/login")
.get( usersController.renderLoginForm)
.post( 
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }), usersController.login
);



router.get("/logout", usersController.logout);

//router.get("/profile", wrapAsync(usersController.renderProfile));

module.exports = router;