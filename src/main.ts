import express from 'express'; 
import bodyparser from 'body-parser'; 
import jwt from 'jsonwebtoken';
import { User } from './model/userModel';
import { postObj } from './model/postModel';

//constants my functions use 
const app = express();
const PORT = 3000; 
const path = require("path");
const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

app.use(bodyparser.json());
app.use(express.static(path.join(__dirname,'views')))
//my arrays since no database setup yet
const userArray: User [] = [];
const postInfomration: postObj [] = []; 

//register homepage @TODO update homepage with CSS 
/* Instructor Feedback:
    I would recommend using the Public Folder approach for this instead of reading a file
    I dont think this is needed might switch to swagger.io for this 
*/
app.get("/",(req,res,next) => {
    res.sendFile('index.html'); 
});

app.get('/Posts', (req,res,next) => {
    res.status(200).send(postInfomration); 
}); 

//show all users @TODO need to make sure password is hidden in some way
app.get('/Users', (req,res,next) =>{
    try{
    if(req.headers['authorization']){
        let verified =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        if(verified){
            res.status(200).send(userArray);
        }else{
        res.status(401).send({message:"not authorized"}); 
    }
    
    
}
}catch{
    res.status(401).send({message:"not authorized"}); 
    }
}
);
app.get('/Posts/:postId', (req,res,next) =>{
    const postId = req.params;
    let newId:number = +postId;

    const found = postInfomration.find((postObj) => postObj.postId == newId);
    if(found){
    res.status(200).send(found);
    }
    else{
        res.status(404).send(
            {
                "message": "Poster was not found",
                "status": 404
            }
        )
    }
});


//find user by ID
app.get('/Users/:userId', (req,res,next) =>{
    const {userId} = req.params;
    try{
        if(req.headers['authorization']){ 
        let verified =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        if(verified){
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
}else{res.status(401).send({message:"not authorized"})}
     
}//end verify
}//end try
catch{res.status(401).send({message:"not authorized"});}
});






//app delete method get index and delete user
app.delete('/Users/:userId',(req,res,next) => {
    try{
        if(req.headers['authorization']){
        let verified =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        if(verified){
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
}else{res.status(401).send({message:"not authorized"});}
} 
}catch{res.status(401).send({message:"not authorized"});}
    
}); 



//updates the users want to change that if code to a switch statement 
app.patch('/Users/:userId',(req,res,next) => {
    try{
        if(req.headers['authorization']){
            let verified =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        if(verified){
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
                )}
        }//end if

    }else{res.status(401).send({message:"not authorized"});}

}catch{res.status(401).send({message:"not authorized"});}
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
    const test: boolean = expression.test(tester.emailAddress);
    if(test == false)
    {
        res.status(406).send(
            {
                "message": "Unacceptable email",
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

app.get('/Users/:userId/:password', (req,res,next) => {
    let id = req.params.userId; 
    let secretPaswd = req.params.password; 

    let found = userArray.find((User) => User.userId == id);
    if (found?.password == secretPaswd && found != null)
    {
        let token = jwt.sign({
            exp: Math.floor((Date.now() / 1000) + (60 * 60)),
            User
        }, 'jrRice879');

        res.send({token:token})
    }
    else{
        res.status(401).send({message: "invalid username and password"});
    }
}); 



app.listen(PORT);



