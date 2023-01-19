//requirements (express and pug)
const express = require("express");
const mongoose = require('mongoose');
//use routers
let router = express.Router();
//model
const Person = require("./PersonModel");

//people
//get request -> show individual person requested
router.get("/:id", loadPerson);
router.get("/:id", respondPerson);
//post request on /movies/new -> add a new movie using data in the request.body
router.post("/", savePerson);

//function to save the movie using the data entered by the client
function savePerson(request, response, _) {
    //log
    console.log("POST /people")
    //validation from database
    //check if a person with given name exists
    Person.findOne({name: request.body.name}).exec(function(err, result) {
        //database error
        if (err) {
            console.log(err);
            return response.sendStatus(500);
        }
        //if person already exists, send 400
        if (result) {
            console.log("Error: Person with the same name already exists");
            return response.sendStatus(400);
        }
        //only run when result is null
        if (!result) {
            //create new person
            let newPerson = new Person();
            newPerson.name = request.body.name;
            newPerson._id = mongoose.Types.ObjectId();

            //save to database
            newPerson.save((error, savedResult) => {
                //database error
                if (error) {
                    console.log(err);
                    return response.sendStatus(500);
                }
                //log
                console.log("Inserted New Person");
                console.log(savedResult);
                // Code 201 Created is best used when a new resource is added to the server
                response.sendStatus(201);
            })
        }
    }); 
}

//helper function to count collaborators
//used to count how many times a person has collaborated with a given person
function countCollaborator(object, key) {
    //if the key already exists
    //(if we alreay have the person added as one of the collaborators)
    if (object.hasOwnProperty(key)) {
        //increment count
        object[key] ++;
    }
    //if not added yet, add and give value of 1
    else {
        object[key] = 1;
    }
}

//load the specified person and load information to respond with
function loadPerson(request, response, next) {
    //log
    console.log(`GET /people/${request.params.id}`);
    // Check if a movie with the specified objectId exists
    const targetId = request.params.id;
    //check if a person with the specified id exists
    //load the person if they exist
    Person.
        findById(targetId).
        populate('Director').
        populate('Actors').
        populate('Writer').
        exec(function (err, result) {
            //if there was an error
            if (err) {
                console.log(err);
                response.status(500).send("Error reading person");
                return;
            }
            //person with the specified id does not exist
            if (!result) {
                response.status(404).send(`Person with ID ${targetId} does not exist.`);
                return;
            }
            //find top 5 frequent collaborators
            //array to save all movies this person has worked on
            let allWorks = [];
            //save all movies this person has directed
            for(let i=0; i< result.Director.length; i++) {
                //if the movie is not in allWorks yet, push
                if (allWorks.indexOf(result.Director[i]) < 0) {
                    allWorks.push(result.Director[i]);
                }
            }
            //save all movies this person has acted
            for(let i=0; i< result.Actors.length; i++) {
                //if the movie is not in allWorks yet, push
                if (allWorks.indexOf(result.Actors[i]) < 0) {
                    allWorks.push(result.Actors[i]);
                }
            }
            //save all movies this person has wrote
            for(let i=0; i< result.Writer.length; i++) {
                //if the movie is not in allWorks yet, push
                if (allWorks.indexOf(result.Writer[i]) < 0) {
                    allWorks.push(result.Writer[i]);
                }
            }
            //at this point allWorks contains all the movies the given person has worked on
            //object to save all collaborators ids with their counts
            let allCollaboratorsIds = {};
            //loop all the movies the person has worked on
            for (let i=0; i<allWorks.length; i++) {
                //save all directors the person has worked with
                for(let j=0; j< allWorks[i].DirectorID.length; j++) {
                    countCollaborator(allCollaboratorsIds, allWorks[i].DirectorID[j]);
                }
                //save all actors the person has worked with
                for(let j=0; j< allWorks[i].ActorsID.length; j++) {
                    countCollaborator(allCollaboratorsIds, allWorks[i].ActorsID[j]);
                }
                //save all writers the person has worked with
                for(let j=0; j< allWorks[i].WriterID.length; j++) {
                    countCollaborator(allCollaboratorsIds, allWorks[i].WriterID[j]);
                }
            }
            //at this point, allCollaborators contains all the collabortators the given person has worked with
            //sort by the keys and convert to array
            let sortedByCountIds = Object.keys(allCollaboratorsIds).sort(function(personOne, personTwo) {return allCollaboratorsIds[personTwo]-allCollaboratorsIds[personOne]});
            //remove the current person's id
            let index = sortedByCountIds.indexOf(targetId);
            sortedByCountIds.splice(index, 1);
            //need top 5
            let topCollaboratorsIds = sortedByCountIds.slice(0,5);
            //need to get names of the people matching to the id
            let topCollaborators = [];
            //find person by the ids
            //performing multiple findByIds to maintain the order given by the array: topCollaboratorsIds
            //not the most efficient way, but most solid way to find the persons and keey the order
            Person.findById(topCollaboratorsIds[0]).exec(function(error1, frequentCollaboratorOne){
                if (error1) {
                    console.log(error1);
                    response.status(500).send("Error reading person");
                    return;
                }
                Person.findById(topCollaboratorsIds[1]).exec(function(error2, frequentCollaboratorTwo){
                    if (error2) {
                        console.log(error2);
                        response.status(500).send("Error reading person");
                        return;
                    }
                    Person.findById(topCollaboratorsIds[2]).exec(function(error3, frequentCollaboratorThree){
                        if (error3) {
                            console.log(error3);
                            response.status(500).send("Error reading person");
                            return;
                        }
                        Person.findById(topCollaboratorsIds[3]).exec(function(error4, frequentCollaboratorFour){
                            if (error4) {
                                console.log(error4);
                                response.status(500).send("Error reading person");
                                return;
                            }
                            Person.findById(topCollaboratorsIds[4]).exec(function(error5, frequentCollaboratorFive){
                                if (error5) {
                                    console.log(error5);
                                    response.status(500).send("Error reading person");
                                    return;
                                }
                                //push the persons into array
                                topCollaborators.push(frequentCollaboratorOne);
                                topCollaborators.push(frequentCollaboratorTwo);
                                topCollaborators.push(frequentCollaboratorThree);
                                topCollaborators.push(frequentCollaboratorFour);
                                topCollaborators.push(frequentCollaboratorFive);
                                //set responses
                                response.person = result;
                                response.collaborators = topCollaborators;
                                next();
                            });
                        });
                    });
                });
            });
        });
}

//respond the single person
//can send JSON, HTML
function respondPerson(_, res, next) {
    res.format({
        "text/html": () => {res.render("pages/person.pug", {person: res.person, collaborators: res.collaborators})},
        "application/json": () => {res.status(200).json(res.person, res.collaborators)}
    });
    next();
}

module.exports = router;