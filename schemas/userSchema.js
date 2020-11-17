const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    name:{type: String},
    surname: {type: String},
    email: {type: String, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
    password:{type: String},
});

module.exports = mongoose.model('User',userSchema);