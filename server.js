const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true})); 

app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/index.html');
});

//connect to mongo 
const MONGO_URI ='mongodb+srv://Pamela:'+process.env.ATLAS_PASS+'@samusers.c98z3.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(process.env.MONGO_URI || MONGO_URI, {
    useNewUrlParser:true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose is connected!');
    const userSchema = mongoose.Schema({
    name:{type: String},
    surname: {type: String},
    email: {type: String, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
    password:{type: String},
});

});




//registering new user
router.post('/register.html', (req,res,next)=> {
    
                        const user = new userSchema({
                            name: req.body.name,
                            surname: req.body.surname,
                            email: req.body.email,
                            password: req.body.password
                        });
            
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'User created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    
                });
    });


app.listen(PORT);
