const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const userRoutes = require('./userRoutes');
require('dotenv').config();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static(__dirname));


//connect to mongo 
const MONGO_URI ='mongodb+srv://Pamela:'+process.env.ATLAS_PASS+'@samusers.c98z3.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
    useNewUrlParser:true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!');
});


app.use("/",userRoutes);

/*if(process.env.NODE_ENV === 'production')
{

}*/

app.listen(PORT);