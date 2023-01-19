const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let movieSchema = Schema({
    Title: {type: String, required: true},
    Year: {type: String, required: true}, 
    Rated: {type: String},
    Released: {type: String},
    Runtime: {type: String, required: true},
    Genre: {type: [String], required: true},
    DirectorID: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}], //Directors of this movie. Array of director objects, saved by their _ids.
    WriterID: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}], //Writers of this movie. Array of writer objects, saved by their _ids.
    ActorsID: [{type: Schema.Types.ObjectId, ref: 'Person', required: true}], //Actors of this movie. Array of actor objects, saved by their _ids.
    Plot: {type: String, required: true},
    Awards: {type: String},
    Review: [{type: Schema.Types.ObjectId, ref: 'Review'}], //Reviews of this movie. Array of review objects, saved by their _ids.
    Director: {type: [String], required: true}, //string array of directors' name of this movie, used in query search
    Actors: {type: [String], required: true}, //string array of actors' name of this movie, used in query search
    Writer: {type: [String], required: true}, //string array of writers' name of this movie, used in query search
    _id: Schema.Types.ObjectId //unique _id
});

module.exports = mongoose.model("Movie", movieSchema);