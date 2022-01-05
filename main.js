const port = 5000;
const express = require("express"),
    app = express();
const router = require("./routes/index");


//const router = express.Router();//
app.use("/", router);
app.set("view engine", "ejs");
const mongoose = require("mongoose");
mongoose.connect(
    "mongodb://localhost:27017/subscriber1",
    { useNewUrlParser: true }
);
mongoose.connection
    .once("open", () => {
        console.log("Successfully connected to MongoDB using Mongoose!");
    });
/*const expressSession = require("express-session");
cookieParser = require("cookie-parser");
connectFlash = require("connect-flash");
router.use(cookieParser("secret_passcode"));
router.use(expressSession({
    secret: "secret_passcode",
    cookie: {
        maxAge: 4000000
    },
    resave: false,
    saveUninitialized: false
}));
router.use(connectFlash());
router.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
});*/
const subscribecontroller = require("./controllers/subscribecontroller");
//app.get("/subscribers", subscribecontroller.index);
//router.get("/subscribers", subscribecontroller.index,
// subscribecontroller.indexView);
//router.get("/subscribers/new", subscribecontroller.new);
//router.post("/subscribers/create", subscribecontroller.create, subscribecontroller.redirectView);
//router.get("/subscribers/:id", subscribecontroller.show,
// subscribecontroller.showView);
//router.get("/subscribers/:id/edit", subscribecontroller.edit);
//router.put("/subscribers/:id/update", subscribecontroller.update,
// subscribecontroller.redirectView);
//router.delete("/subscribers/:id/delete", subscribecontroller.delete, subscribecontroller.redirectView);
const Subscriber = require("./models/subscriber");
const user = require("./models/user");
const usercontroller = require("./controllers/usercontroller");

/*router.get("/users/login", usercontroller.login);
router.post("/users/login", usercontroller.authenticate, usercontroller.redirectView);*/
app.get("/users", usercontroller.index);
router.get("/users/new", usercontroller.new);
router.post("/users/create", usercontroller.create, usercontroller.redirectView);
router.get("/users/:id", usercontroller.show, usercontroller.showView);
router.get("/users/:id/edit", usercontroller.edit);
router.put("/users/:id/update", usercontroller.update, usercontroller.redirectView);
router.delete("/users/:id/delete", usercontroller.delete, usercontroller.redirectView);
const course = require("./models/courses");
const coursescontroller = require("./controllers/coursescontroller");
app.get("/courses", coursescontroller.getAllcourses, (req, res, next) => {
    console.log(req.data);
    res.send(req.data);
});
app.get("/contact", coursescontroller.getcoursePage);

const methodOverride = require("method-override");
router.use(methodOverride("_method", {
    methods: ["POST", "GET"]
}));

var subscriber1 = new Subscriber({
    name: "lakshmi durga gangisetty",
    email: "laxmi@123456.com",
    zipcode: "123456779"
});
subscriber1.save((error, savedDocument) => {
    if (error) console.log(error);
    console.log(savedDocument);
});
Subscriber.create(
    {
        name: "lakshmi durga gangisetty",
        email: "laxmi@123456.com",
        zipcode: "123456779"
    },
    function (error, savedDocument) {
        if (error) console.log(error);
        console.log(savedDocument);
    }
);
var course1 = new course({
    title: "nodejs",
    description: "javascript",

});
course1.save((error, savedDocument) => {
    if (error) console.log(error);
    console.log(savedDocument);
});
course.create(
    {
        title: "nodejs",
        description: "javascript"
    },
    function (error, savedDocument) {
        if (error) console.log(error);
        console.log(savedDocument);
    }
);

var user1 = new user({
    name: "lakshmi durga gangisetty",
    email: "laxmi@123456.com",
    password: "durga1234",
    zipcode: "123456779"
});
user1.save((error, savedDocument) => {
    if (error) console.log(error);
    console.log(savedDocument);
});
user.create(
    {
        name: "lakshmi durga gangisetty",
        email: "laxmi@123456.com",
        password: "durga1234",
        zipcode: "123456779"
    },
    function (error, savedDocument) {
        if (error) console.log(error);
        console.log(savedDocument);
    }
);

app.listen(port, () => {
    console.log(`The Express.js server has started and is listening
        on port number: ${port}`);
});