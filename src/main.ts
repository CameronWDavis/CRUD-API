import express from 'express'; 
import bodyparser from 'body-parser'; 
import jwt from 'jsonwebtoken';
import { User } from './model/userModel';
import { postObj } from './model/postModel';


const app = express();
const PORT = 3000; 
const path = require("path");

app.use(bodyparser.json());
app.use(express.static(path.join(__dirname,'views')))
//my arrays since no database setup yet
const userArray: User [] = [];
const postInfomration: postObj [] = []; 

//register homepage @TODO update homepage with CSS 
/* Instructor Feedback:
    I would recommend using the Public Folder approach for this instead of reading a file
*/
app.get("/",(req,res,next) => {
    res.sendFile('index.html'); 
});

//show all users
app.get('/Users', (req,res,next) =>{
    
    for(let i = 0; i < userArray.length; i++)
    {
        res.status(200).send(
            {
                "userId":userArray[i].firstName,
                "firstName":userArray[i].firstName,
                "lastName":userArray[i].lastName,
                "emailAddress":userArray[i].emailAddress
            }
        )
    }
});

//find user by ID
app.get('/Users/:userId', (req,res,next) =>{
    const {userId} = req.params;

    const found = userArray.find((User) => User.userId == userId);
    if(found){
        let cloneUser = new User('','','','',''); 
        Object.assign(cloneUser,found);
        delete (<any>cloneUser).password; 
    res.status(200).send(cloneUser);
    }
    else{
        res.status(404).send(
            {
                "message": "User was not found",
                "status": 404
            }
        )
    }
});






//app delete method get index and delete user
app.delete('/Users/:userId',(req,res,next) => {
    let index = userArray.findIndex(User => User.userId === req.params.userId);
    if(index >= 0)
    {
        userArray.splice(index,1);
        res.status(204).send();
    }else{
        res.status(404).send(
            {
                "message":"User was not found",
                "status":"404"
            }
        )
    }
    
}); 



//updates the users want to change that if code to a switch statement 
app.patch('/Users/:userId',(req,res,next) => {
    let index = userArray.findIndex(User => User.userId === req.params.userId);
    if(index >= 0){

        let updateUser = req.body; 
       
        //if statements for updating user
        if(updateUser.firstName){ 
            userArray[index].firstName = updateUser.firstName;
             
            }
        if(updateUser.lastName){
            userArray[index].lastName = updateUser.lastName;
           
        }
        if(updateUser.emailAddress){
            userArray[index].emailAddress = updateUser.emailAddress;
           
        }
        if(updateUser.password){
            userArray[index].password = updateUser.password;
        }
        
        res.status(200).send(userArray[index]);
    }
    else{
        res.status(404).send(
            {
                "message":"User was not found",
                "status":"404"
            }
        )
    }

});


//add a user to data base need to modulate code into function
app.post('/Users', (req,res,next) =>{
    let tester = req.body; 
    if(tester.userId == null || tester.firstName == null || tester.lastName == null  || tester.emailAddress == null || tester.password == null)
    {
        res.status(406).send(
            {
                "message": "Unacceptable fields must not equal null and fields must be of correct name",
                "status": 406
            }
        )
        return;
    }
    if(!isNaN(tester.firstName) || !isNaN(tester.lastName))
    {
        res.status(406).send(
            {
                "message": "Unacceptable firstName and lastName can't be numbers",
                "status": 406
            }
        )
        return;
    }
    

 for(let i = 0; i < userArray.length; i++)
 {
    if(tester.userId == userArray[i].userId)
    {
        res.status(409).send(
            {
           "message":"userId is taken", 
            "status": 409
            }
        )
        return;
    }
 }
    
 let newUser = new User(tester.userId, tester.firstName, tester.lastName,tester.emailAddress, tester.password);
 
 userArray.push(newUser);

 res.status(201).send({
    "userId": newUser.userId,
    "firstName":newUser.firstName,
    "lastName":newUser.lastName,
    "emailAddress":newUser.emailAddress
 }); 
});




app.listen(PORT);

