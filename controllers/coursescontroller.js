const course = require("../models/courses");
const User = require("../models/user");
const jsonWebToken = require("jsonwebtoken");
const httpStatus = require("http-status-codes");
exports.getAllcourses = (req, res, next) => {
    course.find({}, (error, courses) => {
        if (error) next(error);
        req.data = courses;
        next();
    });
};
exports.getcoursePage = (req, res) => {
    if (req.query.format === "json") {
        res.json(res.locals.courses);
    } else {
        res.render("contact");
    }
};
exports.savecourse = (req, res) => {
    let newcourse = new course({
        title: req.body.title,
        description: req.body.description,
        zipCode: req.body.zipCode
    });
    newcourse.save((error, result) => {
        if (error) res.send(error);
        res.render("contact");
    });
}

respondJSON: (req, res) => {
    res.json({
        status: httpStatus.OK,
        data: res.locals
    });
}
errorJSON: (error, req, res, next) => {
    let errorObject;
    if (error) {
        errorObject = {
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: error.message
        };
    } else {
        errorObject = {
            status: httpStatus.INTERNAL_SERVER_ERROR,
            message: "Unknown Error."
        };
    }
    res.json(errorObject);
}
filterUserCourses: (req, res, next) => {
    let currentUser = res.locals.currentUser;
    if (currentUser) {
        let mappedCourses = res.locals.courses.map((course) => {
            let userJoined = currentUser.courses.some((userCourse) => {
                return userCourse.equals(course._id);
            });
            return Object.assign(course.toObject(), { joined: userJoined });
        });
        res.locals.courses = mappedCourses;
        next();
    } else {
        next();
    }
}
join: (req, res, next) => {
    let courseId = req.params.id,
        currentUser = req.user;
    if (currentUser) {
        User.findByIdAndUpdate(currentUser, {
            $addToSet: {
            }
        })
            .then(() => {
                res.locals.success = true;
                next();
            })
            .catch(error => {
                next(error);
            });
    } else {
        next(new Error("User must log in."));
    }
}