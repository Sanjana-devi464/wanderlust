const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportlocalmongoose = require("passport-local-mongoose");   

const userSchema = new Schema({
        email:{
                type: String,
                required: true,
                unique: true
        },
        isAdmin: {
                type: Boolean,
                default: false
        }
});

// Auto-flag admin based on configured email
userSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.isAdmin = this.email === 'sanjanash464@gmail.com';
    }
    next();
});

userSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("User", userSchema);