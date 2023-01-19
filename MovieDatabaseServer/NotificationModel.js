const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let notificationSchema = Schema({
    to: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    fromUser: {type: String},
    fromPerson: {type: String},
    movie: {type: Schema.Types.ObjectId, ref: 'Movie', required: true},
    _id: Schema.Types.ObjectId, //unique _id
    type: {type: Boolean, required: true} // true=notification is from person, false = notification is from user
});

module.exports = mongoose.model("Notification", notificationSchema);