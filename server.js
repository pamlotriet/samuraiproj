const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.static(__dirname));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});

//connect to mongo //
const MONGO_URI ='mongodb+srv://Pamela:'+process.env.ATLAS_PASS+'@samusers.c98z3.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
    useNewUrlParser:true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!');
});

app.listen(PORT);
