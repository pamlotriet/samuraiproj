const express = require('express');
const User = require('./userSchema');
const path = require('path');
var bodyParser = require('body-parser');
app.use(express.static(__dirname));

const app = express();
const router = express.Router();

//register new user
router.post('/register.html', (req,res,next)=> {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if(user.length){
            return res.status(409).json({
                message: 'Email already exists' 
            });
        }
        else{
           
                    const user = new User({
                        name: req.body.name,
                        surname: req.body.surname,
                        email: req.body.email,
                        password: req.body.password,
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
                }
            });
});


  
module.exports = router; 
