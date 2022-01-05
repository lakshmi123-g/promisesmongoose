const router = require("express").Router(),
coursescontroller =require("../controllers/coursescontroller");
router.get("/courses", coursescontroller.getAllcourses, (req, res, next) => {
    console.log(req.data);
    res.send(req.data);
});
/*router.get("/courses", coursescontroller.getcoursePage);

//app.post("/subscribe", subscribecontroller.saveSubscriber);//
router.get("/subscribers", subscribecontroller.getAllSubscribers, (req, res, next) => {
    console.log(req.data);
    res.send(req.data);

});
router.get("/subscribers", subscribecontroller.getSubscriptionPage);
//app.post("/subscribe", subscribecontroller.saveSubscriber);//
//router.get("/courses/:id/join", coursescontroller.join);//
//router.get("/courses",coursescontroller.filterUserCourses);//

//router.get("/courses",coursescontroller.respondJSON);//
//router.use("/courses",coursescontroller.errorJSON);*/
module.exports = router;