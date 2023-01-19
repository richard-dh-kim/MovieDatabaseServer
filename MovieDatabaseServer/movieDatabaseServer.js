//requirements
const session = require("express-session");
const express = require("express");
const mongoose = require('mongoose');
const path = require("path");

//port
const port = 3000;
//use express
let app = express();
//set up session
app.use(
    session({
        secret: "some secret key",
        resave: true, //save session after every request
        saveUninitialized: false //do not store all sessions
    })
);
//model
const User = require("./UserModel");
//middlewares:
//parese all JSON
app.use(express.json());
//serve files under public
//includes: login.html, signup.html, index.html, addPerson.html, addMovie.html
app.use(express.static("public"));
//serve files under private if user is a contributor
app.use("/app", auth, express.static(path.join(__dirname, "private")));
//parse forms
app.use(express.urlencoded({extended:true}));
//When 'Content-Type' is 'application/json', parse the JSON
app.use(express.json());

//function to check if the user is authorized to view pages inside private (adding movie/person)
function auth(req, res, next) {
    //if user is not logged in
    if (!req.session || !req.session.loggedin) {
        //send user to login page
        return res.redirect("/login.html");
    }
    //if user is logged in but not a contributor
    User.findById(req.session._id).exec(function (err, result) {
        //database error
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error.");
        }
        //if user with given _id does not exist
        //this path is probably unnecessary, since the req.session._id is set by the server, but just in case user does something funny
        if (!result) {
            console.log("User with given id does not exist");
            //send unauthorized, do not give extra info to user.
            return res.status(401).send("Unauthorized.")
        }
        //if user is not a contributor
        if (!result.ifContributor) {
            console.log("User is not a contributor");
            //send forbidden, do not give extra info to user.
            return res.status(403).send("Forbidden")
        }
        //if the user is a contributor
        next();
    });
}

//routes
//post request /login -> log user in using data provided
app.post("/login", login);
//function to use when loggin user in
function login(req, res, _) {
    //log request
    console.log("POST /login");
    //if a user is already logged in
    if (req.session.loggedin) {
        console.log("User already logged in.")
        //nothing wrong, just no need for re-login
        return res.status(200).send("You are already logged in!");
    }
    //pull data from request body
    let username = req.body.username;
    let password = req.body.password;
    //log it
    console.log("Login Attempt");
    console.log("Username: " + username);
    console.log("Password: " + password);
    //find the user by given username
    User.findOne({username: username}).exec(function(err, result) {
        //database error
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error.");
        }
        //if user with given username does not exist
        if (!result) {
            console.log("User with given username does not exist.");
            //just send unauthorized, we do not want to provide more information on why the client could not login
            return res.status(401).send("Unauthorized.")
        }
        //if user with given username exists, and the password provided matches the one on database
        if (result.password === password) {
            //log
            console.log("Login Success!")
            //user is now logged in
            req.session.loggedin = true;
            //set the _id of the user in the sessesion to be used for authorization (check if the user is a contributor or not)
            req.session._id = result._id;
            //show user redirection url to movies search page
            res.redirect("/movies");
        }
        //if password didnt match
        else {
            console.log("Wrong password.");
            //just send unauthorized, we do not want to provide more information on why the client could not login
            res.status(401).send("Unauthorized.");
        }
    }); 
}

//get request /logout -> log user out
app.get("/logout", logout);
//function to use when loggin in
function logout(req, res, _) {
    //log request
    console.log("GET /logout");
    //if a user is not logged in
    if (!req.session.loggedin || req.session._id === null) {
        console.log("User is not logged in.")
        //user cant log out
        //similar to re-loggin attempts, nothing is really wrong, the user just cant log out
        return res.status(200).send("You are not logged in!");
    }
    //no user is loggedin in this session now
    req.session.loggedin = false;
    //set the _id of the user in the sessesion to null
    req.session._id = null;
    //redirect user to index
    res.redirect("/");
}

//get request /profile -> take user to their profile page
app.get("/profile", redirectCheck);
//load the specified user (using _id saved in session) and load information to respond with
function redirectCheck(req, res) {
    //log request
    console.log("GET /profile");
    //check if a user is logged in
    if (req.session.loggedin) {
        // Check if a user with the specified _id exists
        const targetId = req.session._id;
        User
            .findById(targetId)
            .populate('peopleFollowing')
            .populate('usersFollowing')
            // .populate('notifications')
            .populate('moviesWatched')
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return res.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${targetId} does not exist.`);
                    return res.status(404).send(`User with ID ${targetId} does not exist.`);
                }
                //found the user with the targetId, should be the user currently logged in
                //redirect to users/id (RESTFUL design)
                res.redirect("/users/"+targetId);
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        return res.status(400).send("Bad request, you are not logged in.");
    }
}

//router to handle all requests towards movies
let moviesRouter = require("./movies-router");
app.use("/movies", moviesRouter);
//router to handle all requests towards people
let peopleRouter = require("./people-router");
app.use("/people", peopleRouter);
//router to handle all requests towards users
let usersRouter = require("./users-router");
app.use("/users", usersRouter);

//connect to db and start server
mongoose.connect("mongodb://localhost/finalProject", (err) => {
    if (err) {
        console.log("Error connecting to mongodb.");
        throw err;
    }

    app.listen(port);
    console.log(`Server listening at localhost:${port}`);
});