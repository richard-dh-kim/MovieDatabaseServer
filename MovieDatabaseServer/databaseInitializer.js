//define constants/variables
const mongoose = require('mongoose');
//different objects in the database
const Movie = require("./MovieModel");
const Person = require("./PersonModel");
const User = require('./UserModel');
//read in data from JSON file
const fileName = "./movie-data-2500.json";
let data = require(fileName);
//arrays of data, no duplicates
let allMovies = [];
let allPeople =[];
let people = {};
let allUsers = [];

//connects movie to people by their ObjectIds
//take in name of the person, movie to connect, and their role
//makes sure people are added to their right roles
function addPersonToMovie(personName, movie, role){
    //If people object does not have a person with this name
    //its a new person
    if(!people.hasOwnProperty(personName)){
        //Create a new person
        let newPerson = new Person();
        //set objectId synchronously
        newPerson._id = mongoose.Types.ObjectId();
        newPerson.name = personName;
        newPerson.Director = [];
        newPerson.Actors = [];
        newPerson.Writer = [];
        //Add new Person document to our array of all people
        allPeople.push(newPerson);
        //Update the people object (name -> person document)
        people[newPerson.name] = newPerson;
    }
    //At this point, we know the movie and person are defined documents
    //Retrieve the current person using their name, update the movie and person
    let curPerson = people[personName];
    if (role === "Director") {
        curPerson.Director.push(movie._id);
        movie.DirectorID.push(curPerson._id);
    }
    else if (role === "Actors") {
        curPerson.Actors.push(movie._id);
        movie.ActorsID.push(curPerson._id);
    }
    //writer
    else{
        curPerson.Writer.push(movie._id);
        movie.WriterID.push(curPerson._id);
    }
}

//loop all movies found from data file
data.forEach(movie => {
    //create new Movie using the Schema defined
    let newMovie = new Movie();
    newMovie.Title = movie.Title;
    newMovie.Year = movie.Year;
    newMovie.Rated = movie.Rated;
    newMovie.Released = movie.Released;
    newMovie.Runtime = movie.Runtime;
    newMovie.Genre = movie.Genre;
    newMovie.Plot = movie.Plot;
    newMovie.Awards = movie.Awards;
    newMovie._id = mongoose.Types.ObjectId();
    newMovie.Director = movie.Director;
    newMovie.Actors = movie.Actors;
    newMovie.Writer = movie.Writer;

    //use the addPerson function to add all people specified
    movie.Actors.forEach(actorName => {
        addPersonToMovie(actorName, newMovie, "Actors");
    })
    movie.Director.forEach(directorName => {
        addPersonToMovie(directorName, newMovie, "Director");
    })
    movie.Writer.forEach(writerName => {
        addPersonToMovie(writerName, newMovie, "Writer");
    })
    //push new movie to array
    allMovies.push(newMovie);
});

//add 2 users for testing convenience
let newUserOne = new User();
newUserOne.username = "one";
newUserOne.password = "onee";
newUserOne.ifContributor = true;
newUserOne._id = mongoose.Types.ObjectId();
allUsers.push(newUserOne);

let newUserTwo = new User();
newUserTwo.username = "two";
newUserTwo.password = "twoo";
newUserTwo.ifContributor = false;
newUserTwo._id = mongoose.Types.ObjectId();
allUsers.push(newUserTwo);

//connect to database by mongoose
mongoose.connect('mongodb://localhost/finalProject', {useNewUrlParser: true});
let db = mongoose.connection;
//if there was an error opening the data base
db.on("error", console.error.bind(console, "connection error:"));
//open the database
db.once("open", function() {
    //drop previous database
    mongoose.connection.db.dropDatabase(function(err, _) {
        if (err) {
            console.log("Error: could not drop database.");
            throw err;
        }
        console.log("Dropped database. Starting re-creation.");

        //add movies
        Movie.insertMany(allMovies, function(movieErr, _) {
            if (movieErr) {
                console.log("Error: error in adding movies");
                throw movieErr;
            }
            //add people
            Person.insertMany(allPeople, function(personErr, _) {
                if (personErr) {
                    console.log("Error: error in adding people");
                    throw personErr;
                }
                //add users for testing convenience 
                User.insertMany(allUsers, function(userErr, _) {
                    if (userErr) {
                        console.log("Error: error in adding users");
                        throw userErr;
                    }
                    console.log("Finished");
                    mongoose.connection.close();
                    process.exit();
                });
            });
        });
    });
});
