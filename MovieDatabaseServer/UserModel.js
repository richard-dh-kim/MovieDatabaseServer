const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    ifContributor: {type: Boolean, required: true}, // true: yes, false: no. default: false
    peopleFollowing: [{type: Schema.Types.ObjectId, ref: 'Person'}],//People this user is following. Array of person objects, saved by their _ids
    usersFollowing: [{type: Schema.Types.ObjectId, ref: 'User'}],//Users this user is following. Array of user objects, saved by their _ids
    followers: [{type: Schema.Types.ObjectId, ref: 'User'}],//Users that are FOLLOWING THIS USER. Array of user objects, saved by their _ids
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],//Reviews written by this user. Array of review objects, saved by their _ids
    moviesWatched: [{type: Schema.Types.ObjectId, ref: 'Movie'}],//array of movie objects, saved by their _ids
    _id: Schema.Types.ObjectId //unique _id
});

const User = mongoose.model("User", userSchema);
module.exports = User;