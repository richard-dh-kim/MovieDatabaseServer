//requirements (express and pug)
const express = require("express");
const mongoose = require('mongoose'); //mainly used
//use routers
let router = express.Router();
//models
const Movie = require("./MovieModel");
const Person = require("./PersonModel");
const Review = require("./ReviewModel");
const User = require("./UserModel");
const Notification = require("./NotificationModel");

//requests
//get request on /movies/-> show search page
router.get("/", queryParse);
router.get("/", loadMovies);
router.get("/", respondMovies);
//get request on /movies/:id-> show individual movies
router.get("/:id", loadMovie);
router.get("/:id", respondMovie);
//post request on /movies/new -> add a new movie using data in the request.body
router.post("/", saveMovie);
//post request on /movies/reviews -> add a new review using data in the request.body
router.post("/reviews", saveReview);
//get request on /movies/:movieid/reviews/:reviewid-> show individual review
router.get("/:movieid/reviews/:reviewid", loadReview);
router.get("/:movieid/reviews/:reviewid", respondReview);

//function to load the data required in showing single movie
function loadReview(request, response, next) {
    //log request
    console.log(`GET /movies/${request.params.movieid}/reviews/${request.params.reviewid}`);
    // Check if a review with the specified objectId exists
    const targetId = request.params.reviewid;
    //check if a movie with the specified title exists
    Review.
        findById(targetId).
        populate('movie').
        populate('user').
        exec(function (err, result) {
            //database error
            if (err) {
                console.log(err);
                response.status(500).send("Error reading movie");
                return;
            }
            //if movie with the targetID does not exist
            if (!result) {
                response.status(404).send("Review with specified ID does not exist");
                return;
            }
            //set responses
            response.review = result;
            next();
        });
}

//respond the single movie
//can send JSON, HTML
function respondReview(_, res, next) {
    res.format({
        "text/html": () => {res.render("pages/review.pug", {review: res.review})},
        "application/json": () => {res.status(200).json(res.review)}
    });
    next();
}

//function to save the review using the data entered by the client
function saveReview(request, response) {
    //log
    console.log("POST /movies/reviews")
    //validation from database
    //user needs to be logged in
    if (request.session.loggedin) {
        //check if a movie with given _id exists
        Movie.findById(request.body.movieId).exec(function(err, result) {
            //database error
            if (err) {
                console.log(err);
                response.sendStatus(500);
                return;
            }
            //if result does not exist, send 404
            if (!result) {
                console.log("Error: Movie with given id does not exist");
                response.sendStatus(404);
                return;
            }
            //create new review
            let newReview = new Review();
            newReview.rating = request.body.rating;
            newReview.movie = request.body.movieId;
            newReview.user = request.session._id;
            newReview._id = mongoose.Types.ObjectId();
            //check if review is a full review
            //first check if both 'summary' and 'full' and filled in
            if (request.body.summary.length>0 && request.body.full.length>0) {
                newReview.isFull = true;
                newReview.summary = request.body.summary;
                newReview.full = request.body.full;
            }
            //else ifthe review could be basic or the user could have only inputted one of the criterias
            else if (request.body.summary.length==0 && request.body.full.length==0) {
                newReview.isFull = false;
            }
            //else the user could have only inputted one of the criterias
            else {
                console.log("Error: User writing a full review, but did not fill in one of the criterias.");
                response.status(400).send("Bad request, if writing a full review, you must input all the criterias.");
                return;
            }
            newReview.save((reviewErr, reviewResult) => {
                //database error
                if (reviewErr) {
                    console.log(reviewErr);
                    return response.status(500).send("Database Error.");
                }
                //add review to movie's review array
                result.Review.push(newReview._id);
                result.save((movieSavingErr) => {
                    //database error
                    if (movieSavingErr) {
                        console.log(movieSavingErr);
                        return response.status(500).send("Database Error.");
                    }
                    //add review to user's review array
                    User.findById(request.session._id).exec(function(userErr, userResult) {
                        //database error
                        if (userErr) {
                            console.log(userErr);
                            return response.status(500).send("Database Error.");
                        }
                        userResult.reviews.push(reviewResult._id);
                        userResult.save((userSavingErr) => {
                            //database error
                            if (userSavingErr) {
                                console.log(userSavingErr);
                                return response.status(500).send("Database Error.");
                            }

                            //array to store all notifications
                            let newNotifications = [];
                            //for every follower
                            for(let i=0; i< userResult.followers.length; i++) {
                                //build notification to be sent to all of this person's followers
                                let newNotification = new Notification();
                                newNotification.type = false; //from a user
                                newNotification.movie = result._id;
                                newNotification.fromUser = userResult.username;
                                newNotification.to = userResult.followers[i];
                                newNotification._id = mongoose.Types.ObjectId();
                                //add to array of new notifications
                                newNotifications.push(newNotification);
                            }
                            //insert notifications to collection
                            //not really necessary
                            Notification.insertMany(newNotifications, function(errInsertNotifs, _) {
                                //if database error
                                if (errInsertNotifs) {
                                    console.log(errInsertNotifs);
                                    response.sendStatus(500);
                                    return;
                                }
                                //log
                                console.log("Inserted New Review");
                                console.log(reviewResult);
                                //Code 201 Created is best used when a new resource is added to the server
                                response.status(201).send("Review Submitted!");
                            });
                        });
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

//helper function
//connects movie to people by their ObjectIds
//take in name of the person, movie to connect, and their role
//makes sure people are added to their right roles
function addPersonToMovie(personName, movie, role, response){
    //find person with given name
    Person.findOne({name: personName}).exec(function(err, result) {
        //database error
        if (err) {
            console.log(err);
            response.sendStatus(500);
            return;
        }
        //if person is not found
        if (!result) {
            console.log("Person not found, can not add movie.");
            response.sendStatus(404);
            return;
        }
        //Update the movie and person
        if (role === "Director") {
            result.Director.push(movie._id);
            movie.DirectorID.push(result._id);
        }
        else if (role === "Actors") {
            result.Actors.push(movie._id);
            movie.ActorsID.push(result._id);
        }
        //writer
        else{
            result.Writer.push(movie._id);
            movie.WriterID.push(result._id);
        }
    });
}

//function to save the movie using the data entered by the client
function saveMovie(request, response) {
    //log
    console.log("POST /movies")
    //validation from database
    //check if a movie with given title already exists
    Movie.findOne({Title: request.body.title}).exec(function(err, result) {
        //database error
        if (err) {
            console.log(err);
            response.sendStatus(500);
            return;
        }
        //if result exists, send 400
        if (result) {
            console.log("Error: Movie with the same title already exists");
            response.sendStatus(400);
            return;
        }
        //get directors names, separate them by comma
        let directorsNames = request.body.Director.split(',');
        //get actors names
        let actorsNames = request.body.Actors.split(',');
        //get writers names
        let writersNames = request.body.Writer.split(',');

        //create new movie
        let newMovie = new Movie();
        newMovie.Title = request.body.title;
        newMovie.Year = request.body.releaseYear;
        newMovie.Runtime = request.body.runtime;
        newMovie.Genre = request.body.genre;
        newMovie.Plot = request.body.plot;
        newMovie._id = mongoose.Types.ObjectId();
        newMovie.Director = directorsNames;
        newMovie.Actors = actorsNames;
        newMovie.Writer = writersNames;

        //use the addPerson function to add all people specified
        newMovie.Actors.forEach(actorName => {
            addPersonToMovie(actorName, newMovie, "Actors", response);
        })
        newMovie.Director.forEach(directorName => {
            addPersonToMovie(directorName, newMovie, "Director", response);
        })
        newMovie.Writer.forEach(writerName => {
            addPersonToMovie(writerName, newMovie, "Writer", response);
        })

        //array of all people
        let allPeople = directorsNames.concat(actorsNames, writersNames);

        //find all people in this movie
        Person.find({"name": {$in: allPeople}}).populate('followers').exec(function(personErr, personResult) {
            //database error
            if (personErr) {
                console.log(personErr);
                response.sendStatus(500);
                return;
            }
            //array to store all notifications
            let newNotifications = [];
            //for every person
            for (let j=0; j< personResult.length; j++) {
                //for every follower
                for(let i=0; i< personResult[j].followers.length; i++) {
                    //build notification to be sent to all of this person's followers
                    let newNotification = new Notification();
                    newNotification.type = true; //from a person
                    newNotification.movie = newMovie._id;
                    newNotification.fromPerson = personResult[j].name;
                    newNotification.to = personResult[j].followers[i];
                    newNotification._id = mongoose.Types.ObjectId();
                    //add to array of new notifications
                    newNotifications.push(newNotification);
                }
            }
            //insert notifications to collection
            //not really necessary
            Notification.insertMany(newNotifications, function(errInsertNotifs, _) {
                //if database error
                if (errInsertNotifs) {
                    console.log(errInsertNotifs);
                    response.sendStatus(500);
                    return;
                }
                //save movie to database
                newMovie.save((newMovieErr, newMovieResult) => {
                    //if database error
                    if (newMovieErr) {
                        console.log(newMovieErr);
                        response.sendStatus(500);
                        return;
                    }
                    //log
                    console.log("Inserted New Movie");
                    console.log(newMovieResult);
                    // Code 201 Created is best used when a new resource is added to the server
                    response.sendStatus(201);
                });
            });
        });
    });
}

//funnction to 1) set page to 1 if page<1 was given, 2) set qstring to be used for pagination
function queryParse(request, response, next) {
    //log request
    console.log(`GET /movies${request.url}`);
    //if get request on /movies was sent without any query in URL, add empty querys and redirect to the url
    if (request.url === "/" || request.url === "") {
        response.redirect("?page=1&Title=&Actors=&Genre=");
        return;
    }
    //build query string for pagination
    let params = [];
    //for all properties in query
    for(let property in request.query) {
        //skip page
        if (property == "page") {
            continue;
        }
        params.push(property + "=" + request.query[property]);
    }
    //qstring - saves the url except for the page
    request.qstring = params.join("&");

    //minimum page accepted is 1
    try{
		request.query.page = request.query.page || 1;
		request.query.page = Number(request.query.page);
		if(request.query.page < 1){
			request.query.page = 1;
		}
	}catch{
		request.query.page = 1;
	}

    next();
}

//find movies with given search parameters
function loadMovies(req, res, next){
    //limit of movies in a page is 10
    let amount = 10
	let startIndex = ((req.query.page-1) * amount);

    //build query object
    let query = {};
    //page specified
    let page = parseInt(req.query.page);
    //if page number was not a number or 0
	if (isNaN(page) || req.query.page < 1) {
		//send error
		res.status(400);
		res.send("Invalid page number");
		return;
	}
    //title, actor name, genre keyword at minimum
    //if Actor names was given exactly
    if (req.query.Actors.length != 0) {
        query.Actors = {$in: req.query.Actors.split(",")};
    }
    //if a part of Title was given
    if (req.query.Title.length != 0) {
        //case insensitive
        query.Title = {$regex: req.query.Title, $options: "i"};
    }
    //if genre names was given exactly
    if (req.query.Genre.length != 0) {
        query.Genre = {$in: req.query.Genre.split(",")};
    }
    //get search results
    Movie
        .find(query)
        .limit(amount)
        .skip(startIndex)
        .exec(function(err, result) {
            //if database error
            if (err) {
                console.log(err);
                res.status(500).send("Error reading movies");
                return;
            }
            //if specified movie does not exist
            if (!result) {
                res.status(404).send("Movies specified does not exist.");
                return;
            }
            //get total number of movies/10
            //so when user is at last page, next button will not appear
            Movie.countDocuments({}, function(error, totalCount) {
                if (error) {
                    console.log(err);
                    res.status(500).send("Error reading movies");
                    return;
                }
                //set responses
                res.movies = result;
                res.count = totalCount/10;
                next();
            });
        });
}

//function to send the array of movies searched
//can send JSON, HTML
function respondMovies(req, res, next) {
    res.format({
        "text/html": () => {res.render("pages/movies.pug", {movies: res.movies, qstring: req.qstring, current: req.query.page, max: res.count})},
        "application/json": () => {res.status(200).json(res.movies, req.qstring, req.query.page)}
    });
    next();
}

//function to load the data required in showing single movie
function loadMovie(request, response, next) {
    //log request
    console.log(`GET /movies/${request.params.id}`);
    // Check if a movie with the specified objectId exists
    const targetId = request.params.id;

    //check if a movie with the specified title exists
    Movie.
        findById(targetId).
        populate('DirectorID').
        populate('ActorsID').
        populate('WriterID').
        populate('Review').
        exec(function (err, result) {
            //database error
            if (err) {
                console.log(err);
                response.status(500).send("Error reading movie");
                return;
            }
            //if movie with the targetID does not exist
            if (!result) {
                response.status(404).send("Movie with specified ID does not exist");
                return;
            }
            
            //build query object
            let query = {};
            //movies with similar genre
            query.Genre = {$in: result.Genre};
            //except the current movie
            query._id = {$nin: [targetId]}
            Movie.find(query).limit(5).exec(function (errSimilar, resultSimilar) {
                if (errSimilar) {
                    console.log(err);
                    response.status(500).send("Error reading movie");
                    return;
                }
                //set responses
                response.movie = result;
                response.similar = resultSimilar;
                next();
            });
        });
}

//respond the single movie
//can send JSON, HTML
function respondMovie(_, res, next) {
    res.format({
        "text/html": () => {res.render("pages/movie.pug", {movie: res.movie, similarMovies: res.similar})},
        "application/json": () => {res.status(200).json(res.movie, res.similar)}
    });
    next();
}

module.exports = router;