const express = require('express');
const mongoose = require('mongoose');
const app = express();

const PORT = process.env.PORT ;
app.use(express.static(__dirname));

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});



app.listen(PORT);
