const express = require('express');
const app = express();
const bodyParser = require('body-parser');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true})); 

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});


app.listen(PORT);
