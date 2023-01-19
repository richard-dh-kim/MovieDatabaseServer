const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let reviewSchema = Schema({
    rating: {type: Number, required: true},
    isFull: {type: Boolean, required: true}, //true: yes, its a full review, false: no its not a full review
    movie: {type: Schema.Types.ObjectId, ref: 'Movie', required: true}, //Movie this review is for. Movie object, saved by its _id.
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true}, //User who wrote this review. User object, saved by its _id.
    summary: String,
    full: String,
    _id: Schema.Types.ObjectId //unique _id
});

module.exports = mongoose.model("Review", reviewSchema);