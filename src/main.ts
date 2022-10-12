import express from 'express'; 
import bodyparser from 'body-parser'; 



const app = express();
const PORT = 3000; 
app.use(bodyparser.json());
//my arrays since no database setup yet
const userArray: User [] = []
const publcInformation: showUser [] = []

//register homepage @TODO update homepage with CSS 
app.get("/",(req,res,next) => {
    res.sendFile(__dirname +"/index.html"); 
});

//show all users
app.get('/User', (req,res,next) =>{
    res.status(200).send(publcInformation); 
});

//find user by ID
app.get('/User/:userId', (req,res,next) =>{
    const {userId} = req.params;

    const found = publcInformation.find((showUser) => showUser.userId == userId);
    if(found){
    res.status(200).send(found);
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
app.delete('/User/:userId',(req,res,next) => {
    let index = userArray.findIndex(User => User.userId === req.params.userId);
    if(index >= 0)
    {
        userArray.splice(index,1);
        publcInformation.splice(index,1); 
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
app.patch('/User/:userId',(req,res,next) => {
    let index = userArray.findIndex(User => User.userId === req.params.userId);
    if(index >= 0){

        let updateUser = req.body; 
       
        //if statements for updating user
        if(updateUser.firstName){ 
            userArray[index].firstName = updateUser.firstName;
             publcInformation[index].firstName = updateUser.firstName; 
            }
        if(updateUser.lastName){
            userArray[index].lastName = updateUser.lastName;
             publcInformation[index].lastName = updateUser.lastName;
        }
        if(updateUser.emailAddress){
            userArray[index].emailAddress = updateUser.emailAddress;
            publcInformation[index].emailAddress= updateUser.emailAddress;
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
app.post('/User', (req,res,next) =>{
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
 let newPublic = new showUser(tester.userId, tester.firstName, tester.lastName,tester.emailAddress);
 userArray.push(newUser);
 publcInformation.push(newPublic);
 res.status(201).send(newPublic); 
}); 


//2 objects one that is public the other private 
class User {
    constructor(public userId: string,public firstName:string, public lastName: string, public emailAddress:string,  public password: string){
    this.userId = userId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.emailAddress = emailAddress;
    this.password = password;
    }
}

class showUser {
    constructor(public userId: string,public firstName:string, public lastName: string, public emailAddress:string){
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailAddress = emailAddress;
        
        }
}



app.listen(PORT); 