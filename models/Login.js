const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LoginSchema = new Schema({}, {strict: false});




module.exports = Login = mongoose.model('login', LoginSchema);

