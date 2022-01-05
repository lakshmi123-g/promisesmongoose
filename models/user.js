const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");

const randToken = require("rand-token");
const mongoose = require("mongoose"),
    { Schema } = require("mongoose"),
    Subscriber = require("./subscriber");

userSchema = new Schema(
    {
        name: {
            first: {
                type: String,
                trim: true
            },
            last: {
                type: String,
                trim: true
            }
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        zipCode: {
            type: Number,
            min: [10000, "Zip code too short"],
            max: 99999
        },
        password: {
            type: String,
            required: true
        },
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
        subscribedAccount: {
            type: Schema.Types.ObjectId,
            ref: "Subscriber"
        }
    },
    {
        timestamps: true

    });

userSchema.virtual("fullName").get(function () {
    return `${this.name.first} ${this.name.last}`;
});
userSchema.pre("save", function (next) {
    let user = this;
    if (user.subscribedAccount === undefined) {
        Subscriber.findOne({
            email: user.email
        })
            .then(subscriber => {
                user.subscribedAccount = subscriber;
                next();
            })
            .catch(error => {
                console.log(`Error in connecting subscriber: 
            ${error.message}`);
                next(error);
            });
    } else {
        next();
    }
    userSchema.pre("save", function (next) {
        let user = this;
        bcrypt.hash(user.password, 10).then(hash => {
            user.password = hash;
            next();
        })
            .catch(error => {
                console.log(`Error in hashing password: ${error.message}`);
                next(error);
            });
    });
    userSchema.plugin(passportLocalMongoose, {
        usernameField: "email"
    });
    userSchema.methods.passwordComparison = function (inputPassword) {
        let user = this;
        return bcrypt.compare(inputPassword, user.password);
    };

    /* passport.serializeUser(function(user, done) {
       done(null, user.id);
     });
   
     passport.deserializeUser(function(id, done) {
       User.findById(id, function(err, user) {
         done(err, user);
       });*/
    module.exports = function (passport) {
        passport.use(
            new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {

                User.findOne({
                    email: email
                }).then(user => {
                    if (!user) {
                        return done(null, false, { message: 'That email is not registered' });
                    }


                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password incorrect' });
                        }
                    });
                });
            })
        );

        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function (id, done) {
            User.findById(id, function (err, user) {
                done(err, user);
            });
        });
    }
})

userSchema.pre("save", function (next) {
    let user = this;
    if (!user.apiToken) user.apiToken =
        randToken.generate(16);
    next();
});

module.exports = mongoose.model("User", userSchema);
