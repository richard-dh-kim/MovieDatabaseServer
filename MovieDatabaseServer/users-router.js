//requirements
const express = require("express");
const mongoose = require('mongoose');
//use routers
let router = express.Router();
//model
const User = require("./UserModel");
const Movie = require("./MovieModel");
const Person = require("./PersonModel");
const Notification = require("./NotificationModel");

//users
//get request -> show individual user requested
router.get("/:id", loadUser);
router.get("/:id", respondUser);
//post request -> save new user using data provided
router.post("/", saveUser);
//put requst on /changeUserType -> change user's type
router.put("/changeUserType", changeType);
//put requst on /addToWatchedList -> add the movie to user's watched list
router.put("/addToWatchedList", addMovieToWatchedList);
//delete request on /removeFromWatchedList -> remove movie from the user's watched list
router.delete("/deleteFromWatchedList", deleteMovieFromWatchedList);
//put requst on /followPerson -> add the person to user's peopleFollowing
router.put("/followPerson", followPersonSelected);
//delete request on /unfollowPerson -> remove person from user's peopleFollowing
router.delete("/unfollowPerson", unfollowPersonSelected);
//put requst on /followUser -> add the user to user's usersFollowing
router.put("/followUser", followUserSelected);
//delete request on /unfollowUser -> remove user from user's usersFollowing
router.delete("/unfollowUser", unfollowUserSelected);

//delete user from usersfollowing of currented logged in user
function unfollowUserSelected(request, response) {
    //log request
    console.log("DELETE /users/unfollowUser");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find user using _id given from request body
                User
                    .findById(request.body.userId)
                    .exec(function (userErr, userResult) {
                        //database error
                        if (userErr) {
                            console.log(userErr);
                            return response.status(500).send("Error reading user");
                        }
                        //user does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!userResult) {
                            console.log(`User with ID ${request.body.personId} does not exist.`);
                            return response.status(404).send(`User with ID ${request.body.personId} does not exist.`);
                        }
                        //if this user is not in user's usersFollowed
                        if (!result.usersFollowing.includes(userResult._id)) {
                            console.log("Bad request: User does not exists in user's usersFollowing")
                            //request is a success, but nothing will be done/returned because nothing to change
                            return response.sendStatus(400);
                        }
                        //delete user (follower) from user's followers
                        let followerIndex = userResult.followers.indexOf(result._id);
                        //if user (follower) exists in followers, remove
                        if (followerIndex > -1) {
                            userResult.followers.splice(followerIndex, 1);
                            //save user (follower)
                            userResult.save(function(saveFollowedErr) {
                                //database error
                                if (saveFollowedErr) {
                                    console.log(saveErr);
                                    return response.status(500).send("Error reading user");
                                }
                                //delete user from user's usersFollowed
                                let userIndex = result.usersFollowing.indexOf(userResult._id);
                                //if user exists in usersFollowed, remove
                                if (userIndex > -1) {
                                    result.usersFollowing.splice(userIndex, 1);
                                    //save
                                    result.save(function(saveErr) {
                                        //database error
                                        if (saveErr) {
                                            console.log(saveErr);
                                            return response.status(500).send("Error reading user");
                                        }
                                        response.sendStatus(200);
                                    });
                                }
                            });
                        }
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//add user to usersfollowing of currently logged in user
function followUserSelected(request, response) {
    //log request
    console.log("PUT /users/followUser");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find user using userid given from request body
                User
                    .findById(request.body.userId)
                    .exec(function (userErr, userResult) {
                        //database error
                        if (userErr) {
                            console.log(userErr);
                            return response.status(500).send("Error reading user");
                        }
                        //user does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!userResult) {
                            console.log(`User with ID ${request.body.UserId} does not exist.`);
                            return response.status(404).send(`User with ID ${request.body.UserId} does not exist.`);
                        }
                        //if user is already following this user
                        if (result.usersFollowing.includes(userResult._id)) {
                            console.log("Bad request: User already following this user.")
                            //request is a success, but nothing will be done/returned because its already there
                            return response.sendStatus(400);
                        }
                        //add user (follower) to user's followers
                        userResult.followers.push(result._id);
                        //save user (followed)
                        userResult.save(function(saveFollowedErr) {
                            //database error
                            if (saveFollowedErr) {
                                console.log(saveFollowedErr);
                                return response.status(500).send("Error reading user");
                            }
                            //add user to user's userFollowing
                            result.usersFollowing.push(userResult._id);
                            //save
                            result.save(function(saveErr) {
                                //database error
                                if (saveErr) {
                                    console.log(saveErr);
                                    return response.status(500).send("Error reading user");
                                }
                                response.sendStatus(200);
                            });
                        });
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//delete person from peoplefollowing of currented logged in user
function unfollowPersonSelected(request, response) {
    //log request
    console.log("DELETE /users/unfollowPerson");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find person using _id given from request body
                Person
                    .findById(request.body.personId)
                    .exec(function (personErr, personResult) {
                        //database error
                        if (personErr) {
                            console.log(personErr);
                            return response.status(500).send("Error reading person");
                        }
                        //person does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!personResult) {
                            console.log(`Person with ID ${request.body.personId} does not exist.`);
                            return response.status(404).send(`Person with ID ${request.body.personId} does not exist.`);
                        }
                        //if this person is not in user's peopleFollowed
                        if (!result.peopleFollowing.includes(personResult._id)) {
                            console.log("Bad request: Person does not exists in user's peopleFollowing")
                            //request is a success, but nothing will be done/returned because nothing to change
                            return response.sendStatus(400);
                        }
                        //delete user from person's followers
                        let userIndex = personResult.followers.indexof(result._id);
                        //if person exists in the peopleFollowing, remove
                        if (userIndex > -1) {
                            personResult.followers.splice(userIndex, 1);
                            //save person
                            personResult.save(function(savePersonErr) {
                                //database error
                                if (savePersonErr) {
                                    console.log(savePersonErr);
                                    return response.status(500).send("Error reading person");
                                }
                                //delete person from user's peopleFollowing
                                let personIndex = result.peopleFollowing.indexOf(personResult._id);
                                //if person exists in the peopleFollowing, remove
                                if (personIndex > -1) {
                                    result.peopleFollowing.splice(personIndex, 1);
                                    //save user
                                    result.save(function(saveErr) {
                                        //database error
                                        if (saveErr) {
                                            console.log(saveErr);
                                            return response.status(500).send("Error reading user");
                                        }
                                        response.sendStatus(200);
                                    });
                                }
                            });
                        }
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//add person to peopleFollowing of currently logged in user
function followPersonSelected(request, response) {
    //log request
    console.log("PUT /users/followPerson");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find person using personid given from request body
                Person
                    .findById(request.body.personId)
                    .exec(function (personErr, personResult) {
                        //database error
                        if (personErr) {
                            console.log(personErr);
                            return response.status(500).send("Error reading person");
                        }
                        //person does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!personResult) {
                            console.log(`Person with ID ${request.body.personId} does not exist.`);
                            return response.status(404).send(`Person with ID ${request.body.personId} does not exist.`);
                        }
                        //if user is already following this person
                        if (result.peopleFollowing.includes(personResult._id)) {
                            console.log("Bad request: User already following this person.")
                            //request is a success, but nothing will be done/returned because its already there
                            return response.sendStatus(400);
                        }
                        //add user to person's followers
                        personResult.followers.push(result._id);
                        //save person
                        personResult.save(function (savePersonErr) {
                            //database error
                            if (savePersonErr) {
                                console.log(savePersonErr);
                                return response.status(500).send("Error reading person");
                            }
                            //add person to user's peopleFollowing
                            result.peopleFollowing.push(personResult._id);
                            //save user
                            result.save(function(saveErr) {
                                //database error
                                if (saveErr) {
                                    console.log(saveErr);
                                    return response.status(500).send("Error reading user");
                                }
                                response.sendStatus(200);
                            });
                        });
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//delete movie from watched list of currented logged in user
function deleteMovieFromWatchedList(request, response) {
    //log request
    console.log("DELETE /users/deleteFromWatchedList");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find movie using _id given from request body
                Movie
                    .findById(request.body.movieId)
                    .exec(function (movieErr, movieResult) {
                        //database error
                        if (movieErr) {
                            console.log(movieErr);
                            return response.status(500).send("Error reading movie");
                        }
                        //movie does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!movieResult) {
                            console.log(`Movie with ID ${request.body.movieId} does not exist.`);
                            return response.status(404).send(`Movie with ID ${request.body.movieId} does not exist.`);
                        }
                        //if this movie is not in user's watched list
                        if (!result.moviesWatched.includes(movieResult._id)) {
                            console.log("Bad request: Movie does not exists in user's watched list")
                            //request is a success, but nothing will be done/returned because nothing to change
                            return response.sendStatus(400);
                        }
                        //delete movie from user's watched list
                        let movieIndex = result.moviesWatched.indexOf(movieResult._id);
                        //if movie exists in the watched list, remove
                        if (movieIndex > -1) {
                            result.moviesWatched.splice(movieIndex, 1);
                            //save
                            result.save(function(saveErr) {
                                //database error
                                if (saveErr) {
                                    console.log(saveErr);
                                    return response.status(500).send("Error reading user");
                                }
                                response.sendStatus(200);
                            });
                        }
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//add movie to watched list of currently logged in user
function addMovieToWatchedList(request, response) {
    //log request
    console.log("PUT /users/addToWatchedList");
    //check if user is logged in
    if (request.session.loggedin) {
        //find user currently logged in
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //find movie using _id given from request body
                Movie
                    .findById(request.body.movieId)
                    .exec(function (movieErr, movieResult) {
                        //database error
                        if (movieErr) {
                            console.log(movieErr);
                            return response.status(500).send("Error reading movie");
                        }
                        //movie does not exist
                        //this should not happen since _id was saved in session but just incase user does something funny
                        if (!movieResult) {
                            console.log(`Movie with ID ${request.body.movieId} does not exist.`);
                            return response.status(404).send(`Movie with ID ${request.body.movieId} does not exist.`);
                        }
                        //if this movie is already in user's watched list
                        if (result.moviesWatched.includes(movieResult._id)) {
                            console.log("Bad request: Movie is already added to user's watched list")
                            //request is a success, but nothing will be done/returned because its already there
                            return response.sendStatus(400);
                        }
                        //add movie to user's watched list
                        result.moviesWatched.push(movieResult._id);
                        //save
                        result.save(function(saveErr) {
                            //database error
                            if (saveErr) {
                                console.log(saveErr);
                                return response.status(500).send("Error reading user");
                            }
                            response.sendStatus(200);
                        });
                    });
            });
    }
    //if user is not loggedin
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//change type of user currently logged in
function changeType(request, response) {
    //log request
    console.log("PUT /users/changeUserType");
    //if user is logged in
    if (request.session.loggedin) {
        //find user by _id in session
        User
            .findById(request.session._id)
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${request.session._id} does not exist.`);
                    return response.status(404).send(`User with ID ${request.session._id} does not exist.`);
                }
                //change type
                if (result.ifContributor) {
                    result.ifContributor = false;
                }
                else {
                    result.ifContributor = true;
                }
                //save changes
                result.save(function(saveErr) {
                    //database error
                    if (saveErr) {
                        console.log(saveErr);
                        return response.status(500).send("Error reading user");
                    }
                    response.sendStatus(200);
                });
            });
    }
    //if user is not loggedin
    //this should not happen but just incase user does something funny
    else {
        console.log("User is not loggedin");
        response.sendStatus(403);
    }
}

//load the specified person and load information to respond with
function loadUser(request, response, next) {
    //log request
    console.log(`GET /users/${request.params.id}`);
    // get targetid
    const targetId = request.params.id;

    //if user is viewing his own page (redirected from /ownprofile)
    if (request.session._id === targetId) {
        //find all notifications belong to the user with targetID, to be passed on
        Notification.find({to: targetId}).populate('movie').exec(function (notifErr, notifResult) {
            //database error
            if (notifErr) {
                console.log(notifErr);
                return response.status(500).send("Error reading user");
            }
            User
            .findById(targetId)
            .populate({
                path: 'peopleFollowing',
                populate: [{
                    path: 'Director',
                    model: 'Movie'
                },
                {
                    path: 'Writer',
                    model: 'Movie'
                },
                {
                    path: 'Actors',
                    model: 'Movie'
                }]
            })
            .populate('usersFollowing')
            .populate('moviesWatched')
            .populate({
                path: 'reviews',
                populate: [{
                    path: 'movie',
                    model: 'Movie'
                },
                {
                    path: 'user',
                    model: 'User'
                }]
            })
            .exec(function (err, result) {
                //database error
                if (err) {
                    console.log(err);
                    return response.status(500).send("Error reading user");
                }
                //user does not exist
                //this should not happen since _id was saved in session but just incase user does something funny
                if (!result) {
                    console.log(`User with ID ${targetId} does not exist.`);
                    return response.status(404).send(`User with ID ${targetId} does not exist.`);
                }
                //get recommended movies for this user
                //5 movies with people the user follows, randomly
                //array to save all the works from the people this user follows
                let allWorks = [];
                //for all the people this user follows
                for (let i=0;i <result.peopleFollowing.length; i++) {
                    //save all movies this person has directed
                    for(let j=0; j< result.peopleFollowing[i].Director.length; j++) {
                        //if the movie is not in allWorks yet, push
                        if (allWorks.indexOf(result.peopleFollowing[i].Director[j]) < 0) {
                            allWorks.push(result.peopleFollowing[i].Director[j]);
                        }
                    }
                    //save all movies this person has acted
                    for(let j=0; j< result.peopleFollowing[i].Actors.length; j++) {
                        //if the movie is not in allWorks yet, push
                        if (allWorks.indexOf(result.peopleFollowing[i].Actors[j]) < 0) {
                            allWorks.push(result.peopleFollowing[i].Actors[j]);
                        }
                    }
                    //save all movies this person has wrote
                    for(let j=0; j< result.peopleFollowing[i].Writer.length; j++) {
                        //if the movie is not in allWorks yet, push
                        if (allWorks.indexOf(result.peopleFollowing[i].Writer[j]) < 0) {
                            allWorks.push(result.peopleFollowing[i].Writer[j]);
                        }
                    }
                }
                //pick 5 random movies from allWorks and save to recommendedMovies
                //shuffle allWorks randomly
                let shuffled = allWorks.sort(() => 0.5 - Math.random());
                //get lenth of all works, if allworks has more than 5 movies, get only 5 randomly
                //if less than 5, just get all
                let recommendedLength = allWorks.length;
                if (recommendedLength > 5) {
                    recommendedLength = 5;
                }
                let recommendedMovies = shuffled.slice(0,recommendedLength);
                //found the user with the targetId, should be the user currently logged in
                //set responses
                response.user = result;
                response.notifications = notifResult;
                response.recommendedMovies = recommendedMovies;
                //flag to tell next function what to view
                //true = profile, false = other user
                response.flag = true;
                next();
            });
        });
    }
    //if user is viewing another user
    else {
        User.
        findById(targetId).
        populate('peopleFollowing').
        populate({
            path: 'reviews',
            populate: [{
                path: 'movie',
                model: 'Movie'
            },
            {
                path: 'user',
                model: 'User'
            }]
        }).
        populate('moviesWatched').
        exec(function (err, result) {
            //database error
            if (err) {
                console.log(err);
                return response.status(500).send("Error reading user");
            }
            //user does not exist
            if (!result) {
                console.log(`User with ID ${targetId} does not exist.`);
                return response.status(404).send(`User with ID ${targetId} does not exist.`);
            }
            //found the user with the targetId
            //set responses
            response.user = result;
            //flag to tell next function what to view
            //true = profile, false = other user
            response.flag = false;
            next();
        });
    }
}

//respond the single person
//can send JSON, HTML
function respondUser(_, res, next) {
    //if flag is true, view profile
    if (res.flag) {
        res.format({
            "text/html": () => {res.render("pages/profile.pug", {user: res.user, notifications: res.notifications, recommendedMovies: res.recommendedMovies})},
            "application/json": () => {res.status(200).json(res.user)}
        });
    }
    //else view other user page
    else {
        res.format({
            "text/html": () => {res.render("pages/user.pug", {user: res.user})},
            "application/json": () => {res.status(200).json(res.user)}
        });
    }
    next();
}

//function to save the user using the data entered by the client
function saveUser(request, response) {
    //log
    console.log("POST /users")
    //validation from database
    //check if a user with a given username already exists
    User.findOne({username: request.body.username}).exec(function(err, result) {
        //database error
        if (err) {
            console.log(err);
            return res.status(500).send("Database Error.");
        }
        //user with given username already exists
        if (result) {
            console.log(`User with username: ${request.body.username} already exists.`);
            response.status(400).send(`User with username: ${request.body.username} already exists, use different username.`)
        }
        //if user with given username is not found
        else {
            //create new user
            let newUser = new User();
            newUser.username = request.body.username;
            newUser.password = request.body.password;
            newUser.ifContributor = false;
            newUser._id = mongoose.Types.ObjectId();

            //save to database
            newUser.save((userErr, userResult) => {
                //database error
                if (userErr) {
                    console.log(userErr);
                    return response.status(500).send("Database Error.");
                }
                //log
                console.log("Inserted New User");
                console.log(userResult);
                //Code 201 Created is best used when a new resource is added to the server
                response.status(201).send("Sign up successful!");
            });
        }
    });
}

module.exports = router;