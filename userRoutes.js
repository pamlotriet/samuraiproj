const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('./userSchema');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const multer = require('multer');
const uuid = require('uuid').v4;
const fs = require('fs');
const { response } = require('express');
const checkAuth = require('./checkAuth');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const mammoth = require('mammoth');
const pdfparse = require('pdf-parse')
const excel = require('read-excel-file/node');
const lineReader = require('line-reader');
const lowerCase = require('lower-case');
const upperCase = require('upper-case');
const Data = require('./dataSchema');
const deleteF = require('delete');

const namesPath = __dirname+'/uploads/namesfound.txt';
const surnamesPath = __dirname+'/uploads/surnamesfound.txt';
const emailsPath = __dirname+'/uploads/emailsFound.txt';
const userNumberPath = __dirname+'/uploads/UserID.txt';
var text = '';
var fileNAME = '';
var fileExtension = '';
var newFile = '';
const commonNames = __dirname + "/name.txt";
const commonSurnames = __dirname + "/surnames.txt";
var namesArr = [];
var surnameArr = [];
var userNumber = '';

app.use(express.static(__dirname));


//reading the common names
lineReader.eachLine(commonNames, function(line){
    //console.log(line);
    namesArr.push(line); 
});

//reading the common surnames
lineReader.eachLine(commonSurnames, function(line){
    //console.log(line);
    surnameArr.push(line); 
});

app.use(express.static(__dirname));

/*router.get('/file.html', function(req,res){
    res.json(namesJSONString);
})*/

//register

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
                bcrypt.hash( req.body.password,10,(err,hash) => {
                    if(err)
                    {
                        return res.status(500).json({
                            error:err
                        });
                    }
                    else
                    {
                        const user = new User({
                            name: req.body.name,
                            surname: req.body.surname,
                            email: req.body.email,
                            password: hash,
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
            }
        });
    });

    //get user array
    //length <1 no user exists
    //login
    router.post('/login.html', (req,res,next )=> {
        User.findOne({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1)
            {
                return res.status(401).json({
                    message: 'Auth Failed'
                });
            }
            else{
                
                bcrypt.compare(req.body.password, user.password, (err, result)=> {
                    if(err)
                    {
                        return res.status(401).json({
                            message: 'Auth Failed'
                        });
                    }
                    if(result)
                    {
                        const token = jwt.sign(
                            {
                                email: user.email,
                                userId: user._id
                            },
                            process.env.SEC_KEY,
                            {
                                expiresIn: "1h"
                            }

                        );
                        fs.appendFile(__dirname +'/uploads/userID.txt', user._id , function (err) {
                            if (err) throw err;
                            
                        });
                        return res.status(200).json({
                            message: 'Auth successful',
                            token: token,
                            
                        });
                    }

                  
                    return res.status(401).json({
                        message: 'Auth Failed'
                    });
                });

            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error:err
            });
        });
    });

    //uploading file to uploads
    const storage = multer.diskStorage({
        destination: (req ,file ,cb) =>{
            cb(null,'uploads')
        },
        filename: (req, file, cb) =>{
            const {originalname} = file;
            fileNAME =`${uuid()}-${originalname}` ;
            fileExtension = path.extname(file.originalname);
            cb(null,fileNAME);
        }
    });

    const fileFilter = (req,file,cb)=>{
        if(file.mimetype ==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'|| file.mimetype==='text/plain'||file.mimetype ==='application/pdf')
        {
            cb(null,true);
            console.log('File Supported');
        }
        else
        {
            cb(null,false);
            console.log('File not Supported');
        }
    };

    const upload = multer({
    storage:storage,
    fileFilter:fileFilter,
    limits:{fileSize:1024*1024*10}});

    //getting data from files
    router.post('/file.html',  upload.any('file'),(req,res)=> {
        console.log(fileExtension);
        newFile = __dirname +'/uploads/'+fileNAME + '.txt';
        

        if(fileExtension === '.docx')
        {
            //extracting data
            console.log(__dirname + "/uploads/" + fileNAME)
            mammoth.extractRawText({path: __dirname + "/uploads/" + fileNAME})
            .then(function(result){
                text += result.value; // The raw text
            });
        }

        if(fileExtension === '.pdf')
        {
            const pdfFile = fs.readFileSync(__dirname + "/uploads/" + fileNAME)

                //get information about the pdf
                //parsing the pdf so we can read the text
                pdfparse(pdfFile)
                .then(function (data){
                    console.log(data.text)
                    text = data.text;
                });
        }

        if(fileExtension === '.txt')
        {
           // __dirname means relative to script. Use "./data.txt" if you want it relative to execution path.
            fs.readFile( __dirname + "/uploads/" + fileNAME, (error, data) => {
                if(error) {
                    throw error;
                }
                console.log(data.toString());
                text = data.toString();
            });
        }

        fs.writeFile(newFile, text, function (err) {
            if (err) throw err;
            console.log(text);

            fs.readFile(newFile,function(err,data){
                if (err) throw err;
                //console.log(data.text);
                for(i = 0; i<namesArr.length;i++)
                {
                    if(text.includes(namesArr[i]) || text.includes(upperCase.upperCase(namesArr[i])) || text.includes(lowerCase.lowerCase(namesArr[i] )))
                    {
                        console.log('Found a name');
                        console.log(namesArr[i]);
                        fs.appendFile(__dirname +'/uploads/namesfound.txt',namesArr[i] +"\n", function (err) {
                            if (err) throw err;
                            
                        });
                    }
                }

                for(i = 0; i<surnameArr.length;i++)
                {
                    if(text.includes(surnameArr[i]) || text.includes(upperCase.upperCase(surnameArr[i])) || text.includes(lowerCase.lowerCase(surnameArr[i] )))
                    {
                        console.log('Found a Surname');
                        console.log(surnameArr[i]);
                        fs.appendFile(__dirname +'/uploads/surnamesfound.txt',surnameArr[i] +"\n", function (err) {
                            if (err) throw err;
                            
                        });
                    }
                }

                if(text.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
                {
                    console.log('Found an email')
                    var email = text.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).toString();
                    fs.appendFile(__dirname +'/uploads/emailsFound.txt',email +"\n", function (err) {
                        if (err) throw err;
                        
                    });
                }
                res.sendFile(__dirname+'/file.html')
                //return res.sendFile(__dirname+'/uploads/namesfound.txt')
                });
        });//end of write file
        
        
        
          
    });//end of POST
    

    //saving data found

    router.post('/datafound.html', (req,res,next)=> {
      
        const data = new Data({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            userNumber: req.body.userNumber
        });
        fs.readFile(userNumberPath,function(err,data){
            if(err) throw err;

            userNumber = data.toString();
            console.log(userNumber);
        });
        data.save()
        .then(result => {
            console.log(result);
            res.status(201).json({
            message: 'Data saved' });
            //delete names found
            fs.unlink(namesPath,function(err){
                if(err) throw err;
            });

             //delete surnames found
             fs.unlink(surnamesPath,function(err){
                if(err) throw err;
            });

             //delete emails found
             fs.unlink(emailsPath,function(err){
                if(err) throw err;
            });

             //delete other files
           /* fs.unlink(userNumberPath,function(err){
                if(err) throw err;
            });*/

            /*fs.unlink(newFile,function(err){
                if(err) throw err;
            });*/

          

           Data.find(({userNumber: userNumber}))
           .exec()
           .then(data => {
                if(data.length < 1)
                {
                    return res.status(401).json({
                        message: 'No data Found'
                    });
                }
                else
                {
                    //console.log(data);
                    fs.appendFile(__dirname +'/uploads/allData.txt',data + "\n", function (err) {
                        if (err) throw err;
                        
                    });
                }
            })
           .catch();
         
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err })
        });  
    });
    
  
 module.exports = router; 
