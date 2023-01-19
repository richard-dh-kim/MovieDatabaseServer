const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let personSchema = Schema({
    name: {type: String, required: true},
    Director: [{type: Schema.Types.ObjectId, ref: 'Movie'}], //Movies this person has directed. Array of movie objects, saved by their _ids.
    Writer: [{type: Schema.Types.ObjectId, ref: 'Movie'}], //Movies this person has wrote. Array of movie objects, saved by their _ids.
    Actors: [{type: Schema.Types.ObjectId, ref: 'Movie'}], //Movies this person has acted. Array of movie objects, saved by their _ids.
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],//Users that are FOLLOWING THIS USER. Array of user objects, saved by their _ids
    _id: Schema.Types.ObjectId //unique _id
});

module.exports = mongoose.model("Person", personSchema);