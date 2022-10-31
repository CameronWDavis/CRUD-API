
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
/* THIS IS COMMENTED OUT BECAUSE I NEED TO WORK ON THIS AND PROJECT 3 did not require this. 
app.get("/",(req,res,next) => {
    res.sendFile('index.html'); 
});
*/ 
app.get('/Posts', (req,res,next) => {
    res.status(200).send(postInfomration); 
}); 

//show all users @TODO need to make sure password is hidden in some way
app.get('/Users', (req,res,next) =>{
    try{
    if(req.headers['authorization']){
        let cloneArray:any = userArray; 
        for(let i = 0; i < userArray.length; i++){
            delete cloneArray[i].password; 
        }
        let verified:any =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        let found = userArray.find((User) => User.userId == verified.data.userId);

        if(verified &&  found != null ){
            res.status(200).send(cloneArray); 
            
        }else{res.status(401).send({message:"not authorized"});  }
    
    
}else{res.status(401).send({message:"not authorized"}); }
}catch{
    res.status(401).send({message:"not authorized"}); 
    }
});

app.get('/Posts/:postId', (req,res,next) =>{
    const {postId}  = req.params;
    let postToInt:number = parseInt(postId); 
    let found = null; 
    
    if(postToInt != null)
    {
         found = postInfomration.find((postObj) => postObj.postId == postToInt);
    }
    
   
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
        let userIdentity = req.params.userId
        if(req.headers['authorization']){
        let verified:any =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        let userInformation = verified.data.userId; 
        let found = userArray.find((User) => User.userId == userIdentity);
        if(verified && userIdentity === userInformation && found != null){
        let index = userArray.findIndex(User => User.userId === req.params.userId);
        for(let i = 0; i < postInfomration.length; i++)
        {
            if(postInfomration[i].userId === userIdentity){
                postInfomration.splice(i,1); 
                continue; 
                
            }
        }
        
        if(index >= 0 ){
            userArray.splice(index,1); 
            res.status(204).send();
        }
        
        }else{res.status(401).send({message:"not authorized", status:"401"});}
     }else{res.status(401).send({message:"not authorized", status:"401"});}
}catch{res.status(401).send({message:"not authorized", status:"401"});}
    
}); 



//updates the users want to change that if code to a switch statement 
app.patch('/Users/:userId',(req,res,next) => {
    try{
        if(req.headers['authorization']){
            let id = req.params.userId; 
            let verified:any =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
            let userInformation = verified.data.userId; 
            let found = userArray.find((User) => User.userId == id);
        if(verified && id == userInformation && found != null){
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
                    const test: boolean = expression.test(updateUser.emailAddress);
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
        }else{res.status(401).send({message:"not authorized", status:"401"});}
    }else{res.status(401).send({message:"not authorized", status:"401"});}

}catch{res.status(401).send({message:"not authorized", status:"401"});}
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
//token generator
app.get('/Users/:userId/:password', (req,res,next) => {
    let id = req.params.userId; 
    let secretPaswd = req.params.password; 
    //get a user object for us to use in the file
    let found = userArray.find((User) => User.userId == id);
    try{
    if (found!.password == secretPaswd)
    {
        if(found!.userId == id){
        //create the token
        let token = jwt.sign({
            exp: Math.floor((Date.now() / 1000) + (60 * 60)),
            data: {
                userId: found?.userId,
                name:found?.firstName
            }
        },'jrRice879')// create the token
            

        res.send({token:token})
    }else{
        res.status(401).send({message: "invalid username"});
    }
    }
    else{
        res.status(401).send({message: "invalid password"});
    }
}catch{res.status(401).send({message:"not authorized"});}
}); 
//update a post for a user
app.patch('/Posts/:postId',(req,res,next) =>{
    try{
        let postID:string = req.params.postId;
        let postToInt:number = parseInt(postID); 
        if(req.headers['authorization']){
            let verified:any =jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
            let userInformation = verified.data.userId; 
            let foundPost = postInfomration.find((postObj) => postObj.postId == postToInt);
            
        if(verified && foundPost?.userId == userInformation){
                
             let index = postInfomration.findIndex((postObj) => postObj.postId === postToInt);
             if(postInfomration[index].userId == userInformation){
            if(index >= 0 ){
        
                let updatePost = req.body; 
               
                //if statements for updating post
                
                 if(updatePost.content){ 
                        postInfomration[index].content = updatePost.content;
                        postInfomration[index].lastUpdated = new Date; 
                    }
                if(updatePost.headerImage){
                    postInfomration[index].headerImage = updatePost.headerImage;
                    postInfomration[index].lastUpdated = new Date; 
                }
                
                
                res.status(200).send(postInfomration[index]);
            }
            else{
                res.status(404).send(
                    {
                        "message":"User was not found",
                        "status":"404"
                    }
                )}}else{//statement for making sure UserID matches the one in the token
                    res.status(401).send({message:"not authorized"}); 
                }
        }else{res.status(401).send({message:"not authorized"});}

    }else{res.status(401).send({message:"not authorized"});}

}catch{res.status(401).send({message:"not authorized"});}
});


app.post('/Posts', (req,res,next) =>{
    try{
    if(req.headers['authorization']){
        let verified:any = jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        let date:Date = new Date; 
        let found = userArray.find((User) => User.userId == verified.data.userId);
        if(verified && verified.data.userId == found?.userId ){
        let uID = verified.data.userId; 
        let newPost = req.body;
        let postID:number= postInfomration.length;
        let postDate:Date = date;
        let updateDate:Date = date;  
        if(newPost.title == null || newPost.content == null || newPost.headerImage == null)
        {
            res.status(406).send(
                {
                    "message": "Unacceptable format must have title content and headerImage",
                    "status": 406
                }
            )
            return; 
        }
        
        let newPoster = new postObj(postID, postDate ,newPost.title, newPost.content, uID, newPost.headerImage, updateDate);
        postInfomration.push(newPoster);
        res.status(201).send(newPoster); 


    }else{res.status(401).send({message:"not authorized"});}
}else{res.status(401).send({message:"not authorized"});}
}catch{res.status(401).send({message:"not authorized"});}
});

//return all posts for a user based on userID
app.get('/Posts/User/:userID',(req,res,next) => {
    let finder = req.params.userID; 
    let allValues = []; 
    for(let i = 0; i < postInfomration.length; i++){
        if(finder == postInfomration[i].userId)
        {
            allValues.push(postInfomration[i]); 
        }
    }
    res.send(allValues);
}); 

//method to delete a post 
app.delete('/Posts/:postId', (req,res,next) => {
try{
    let idPost = req.params.postId;
    let postToInt:number = parseInt(idPost); 
    if(req.headers['authorization']){
        let verified:any = jwt.verify(req.headers['authorization'].replace('Bearer ',''),'jrRice879');
        let userInformation = verified.data.userId; 
        if(verified){
        let index = postInfomration.findIndex(postObj => postObj.postId === postToInt);
        if(postInfomration[index].userId == userInformation){
        if(index >= 0 )
        {
            postInfomration.splice(index,1);
            res.status(204).send();
        }else{
            res.status(404).send(
                {
                    "message":"post was not found",
                    "status":"404"
                }
            )
        }}else{res.status(401).send({message:"not authorized"});}//check if user ID matches post ID
    }
    }else{res.status(401).send({message:"not authorized"});}
}catch{res.status(401).send({message:"not authorized"});}//end try catch
}); 


app.listen(PORT);


