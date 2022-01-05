const passport = require('passport');

const User = require("../models/user");
const token = process.env.TOKEN || "recipeT0k3n";
const jsonWebToken = require("jsonwebtoken");
module.exports = {
    index: (req, res) => {
        User.find({})
            .then(users => {
                res.render("new", {
                    users: users
                })
            })
            .catch(error => {
                console.log(`Error fetching users: ${error.message}`)
                res.redirect("/");
            });
    },
    indexView: (req, res) => {
        if (req.query.format === "json") {
            res.json(res.locals.courses);

        } else {
            res.render("courses");
        }
    },

    new: (req, res) => {
        res.render("new");
    },
    create: (req, res, next) => {
        let userParams = {
            name: {
                first: req.body.first,
                last: req.body.last
            },
            email: req.body.email,
            password: req.body.password,
            zipCode: req.body.zipCode
        };
        User.create(userParams)
            .then(user => {
                res.locals.redirect = "/users";
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error saving user: ${error.message}`);
                next(error);
            });
    },
    redirectView: (req, res, next) => {
        let redirectPath = res.locals.redirect;
        if (redirectPath) res.redirect(redirectPath);
        else next();
    },
    show: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .then(user => {
                res.locals.user = user;
                next();
            })

    },
    showView: (req, res) => {
        res.render("show");
    },
    edit: (req, res, next) => {
        let userId = req.params.id;
        User.findById(userId)
            .exec(user => {
                res.render("edit", {
                    user: user
                });
            })
            .catch(error => {
                console.log(`Error fetching user by ID: ${error.message}`);
                next(error);
            });
    },
    update: (req, res, next) => {
        let userId = req.params.id,
            userParams = {
                name: {
                    first: req.body.first,
                    last: req.body.last
                },
                email: req.body.email,
                password: req.body.password,
                zipCode: req.body.zipCode
            };
        User.findByIdAndUpdate(userId, {
            $set: userParams
        })
            .then(user => {
                res.locals.redirect = `/users/${userId}`;
                res.locals.user = user;
                next();
            })
            .catch(error => {
                console.log(`Error updating user by ID: ${error.message}`);
                next(error);
            });
    },
    delete: (req, res, next) => {
        let userId = req.params.id;
        User.findByIdAndRemove(userId)
            .then(() => {
                res.locals.redirect = "users";
                next();
            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
                next();
            });
    },
    login: (req, res) => {
        res.render("users/login");
    },
    authenticate: (req, res, next) => {
        User.findOne({
            email: req.body.email
        })
            .then(user => {
                if (user && user.password === req.body.password) {
                    res.locals.redirect = `/users/${user._id}`;
                    req.flash("success", `${user.fullName}'s logged in successfully!`);
                    res.locals.user = user;
                    next();
                } else {
                    req.flash("error", "Your account or password is incorrect. Please try again or contact your system administrator!");
                    res.locals.redirect = "/users/login";
                    next();
                }
            })
            .catch(error => {
                console.log(`Error logging in user: ${error.message}`);
                next(error);
            });
    },
    authenticate: (req, res, next) => {
        User.findOne({ email: req.body.email })
            .then(user => {
                if (user) {
                    user.passwordComparison(req.body.password)
                        .then(passwordsMatch => {
                            if (passwordsMatch) {
                                res.locals.redirect = `${user._id}`;
                                req.flash("success", `${user.fullName}'s logged in successfully!`);
                                res.locals.user = user;
                            } else {
                                req.flash("error", "Failed to log in user account: Incorrect Password.");
                                res.locals.redirect = "login";
                            }
                            next();
                        });
                } else {
                    req.flash("error", "Failed to log in user account: Useraccount not found.");
                    res.locals.redirect = "login";
                    next();
                }
            })
            .catch(error => {
                console.log(`Error logging in user: ${error.message}`);
                next(error);
            });
    },
    authenticate: passport.authenticate("local", {
        failureRedirect: "/users/login",
        failureFlash: "Failed to login.",
        successRedirect: "/",
        successFlash: "Logged in!"
    }),

    validate: (req, res, next) => {
        req.sanitizeBody("email").normalizeEmail({
            all_lowercase: true
        }).trim();
        req.check("email", "Email is invalid").isEmail();
        req.check("zipCode", "Zip code is invalid")
            .notEmpty().isInt().isLength({
                min: 5,
                max: 5
            }).equals(req.body.zipCode);
        req.check("password", "Password cannot be empty").notEmpty();
        req.getValidationResult().then((error) => {
            if (!error.isEmpty()) {
                let messages = error.array().map(e => e.msg);
                req.skip = true;
                req.flash("error", messages.join(" and "));
                res.locals.redirect = "/users/new";
                next();
            } else {
                next();
            }
        });
    },
    logout: (req, res, next) => {
        req.logout();
        req.flash("success", "You have been logged out!");
        res.locals.redirect = "/";
        next();
    }

}
verifyToken: (req, res, next) => {
    let token = req.query.apiToken;
    if (token) {
        User.findOne({ apiToken: token })
            .then(user => {
                if (user) next();
                else next(new Error("Invalid API token."));
            })
            .catch(error => {
                next(new Error(error.message));
            });
    } else {
        next(new Error("Invalid API token."));
    }
}
apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", (errors, user) => {
        if (user) {
            let signedToken = jsonWebToken.sign(
                {
                    data: user._id,
                    exp: new Date().setDate(new Date().getDate() + 1)
                },
                "secret_encoding_passphrase"
            );
            res.json({
                success: true,
                token: signedToken
            });
        } else
            res.json({
                success: false,
                message: "Could not authenticate user."
            });
    })(req, res, next);
}
    verifyJWT: (req, res, next) => {
        let token = req.headers.token;
        if (token) {
            jsonWebToken.verify(
                token,
                "secret_encoding_passphrase",
                (errors, payload) => {
                    if (payload) {
                        User.findById(payload.data).then(user => {
                            if (user) {
                                next();
                            } else {
                                res.status(httpStatus.FORBIDDEN).json({
                                    error: true,
                                    message: "No User account found."
                                });
                            }
                        });
                    } else {
                        res.status(httpStatus.UNAUTHORIZED).json({
                            error: true,
                            message: "Cannot verify API token."
                        });
                        next();
                    }
                }
            );
        } else {
            res.status(httpStatus.UNAUTHORIZED).json({
                error: true,
                message: "Provide Token"
            });
        }
    }


