var express=require('express');
const http = require('http');
var app=express();
app.use(express.static("socialNet/frontend"));
console.log(__dirname);
const multer = require('multer');
const session = require("express-session");
app.use("/css",express.static(__dirname+"/frontend/css"));
app.use("/js",express.static(__dirname+"/frontend/js"));
app.use(express.static("frontend/html"));
app.use(express.static("frontend/uploads"));
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'socialnet'
});

app.use(session({
    secret: "12345",
    saveUninitialized: true,
    resave: true,
    store: sessionStore
}));
app.use(function (req, res, next) {
    res.locals.uname = req.session.uname;
    res.locals.uemail = req.session.uemail;
    res.locals.uimage= req.session.uimage;
    
  
    next();
  });

  app.use('/uploads', express.static(__dirname + '/frontend/uploads'));



/*----------------------multer code---------------------*/
const st = multer.diskStorage({
    destination: function (req, file, cb) {
  
      cb(null, 'frontend/uploads/');
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage: st });

app.set('view engine','ejs');

 

app.use(express.json())
app.use(express.urlencoded({extended:false}) )

/* create database for stablish connection*/
var my=require("mysql");
const { log } = require('console');
var con= my.createConnection({
    host:'127.0.0.1',
    user:'root',
    password:'',
    database:'socialnet'
});
con.connect(function(err){
    if(err)
        throw err;
    console.log("connect to mysql")
});


 
  
/*----------------------------------------------------*/



app.get("/login",function(req,res)
{
res.sendFile("./frontend/html/login.html",{root:__dirname});
});

app.get("/register",function(req,res)
{
res.sendFile("./frontend/html/register.html",{root:__dirname});
});


app.get("/profile", function (req, res) {
    const currentUserId = req.session.userId;
    const currentUsername = req.session.uname;

    console.log( currentUserId ," this is the current  user  ID");
    
  
    if (!currentUserId) {
      return res.redirect("/login"); // or wherever your login route is
    }

    const getUsersQuery = "SELECT * FROM users";
  
    // Query to get list of users the current user is following
    const getFollowedQuery = "SELECT following_id FROM followers WHERE follower_id = ?";
  
    con.query(getUsersQuery, function (err, allUsers) {
      if (err) throw err;
  
      con.query(getFollowedQuery, [currentUserId], function (err, followedRows) {
        if (err) throw err;
  
        const followedIds = followedRows.map(row => row.following_id);
    
            res.render("profile", {
            data: allUsers,           // List of all users
            uname: currentUsername,   // Current username
            followedIds: followedIds  // List of user IDs the current user follows
            });
      });
    });
  });
  app.post("/follow", function (req, res) {
    console.log(req.session);
    
    const followerId = req.session.userId;
    const followingId = req.body.userId;
    console.log(followerId);
    
    console.log("Follow request:", { followerId, followingId }); // log the input
  
    if (!followerId || !followingId) {
      console.error("Missing user IDs in follow request");
      return res.status(400).send("Missing user ID");
    }
  
    const insertQuery = "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)";
  
    con.query(insertQuery, [followerId, followingId], function (err, result) {
      if (err) {
        console.error("Database error on follow:", err); // log full error
        return res.status(500).send("Database error");
      }
  
      console.log("Followed successfully:", result);
      res.status(200).send("Followed successfully");
    });
  });
  


  app.post("/unfollow", function (req, res) {
    const followerId = req.session.userId;
    const followingId = req.body.userId;
  
    if (!followerId) return res.status(401).send("Not logged in");
  
    const deleteQuery = "DELETE FROM followers WHERE follower_id = ? AND following_id = ?";
  
    con.query(deleteQuery, [followerId, followingId], function (err) {
      if (err) return res.status(500).send("Error removing follower");
      res.status(200).send("Unfollowed successfully");
    });
  });
  
  app.get("/editProfile", function (req, res) {
    const currentUserId = req.session.userId;
    const currentUsername = req.session.uname;
  
    if (!currentUserId) {
      return res.redirect("/login"); // or wherever your login route is
    }

    var entry="select * from users where id='"+currentUserId+"'";

    
    res.render("editProfile", { entry     });
  });

app.get("/",function(req,res)
{
res.sendFile("./frontend/html/register.html",{root:__dirname});
});






/*-----------------------register------------------*/
app.post("/regprocess",upload.single("UserImage"),function(req,res)
{
    var a=req.body.N;
    var b=req.body.E;
    var c=req.body.P;
    var d=req.file.filename;
   
    var q="insert into users(name,email,pwd,UserImage) values('"+a+"','"+b+"','"+c+"','"+d+"')";
   con.query(q,function(err,result){
    if(err)
        throw err;
    res.send("you are successfully registered")
   }) ;

});

/*-----------------------------login-------------*/
app.post("/loginprocess",function(req,res){
var a=req.body.E;
var b=req.body.P;
console.log(a);
console.log(b);
var q="select * from users where email='"+a+"'";
con.query(q,function(err,result){
    if(err)
        throw err;
    console.log(result);
    var L=result.length;
    if(L>0){
        var p=result[0].pwd;
        if(p==b)
            {
                req.session.uname=result[0].name;
                req.session.userId=result[0].id;
                req.session.uimage=result[0].UserImage;
                req.session.uemail=result[0].email;
                
                res.redirect('vtweet'); 
                }   
        else
        res.send("Password is invalid");
    }
    else
    res.send("Email is invalid");
});    
});

app.get("/home",(req,res)=>{
    res.render("home");
})

app.post("/Tweet",function(req,res){
    var name=req.session.uname;
    var email=req.session.uemail;
    var msg=req.body.T1;

    var q="insert into tweet(name,email,Msg)values('"+name+"','"+email+"','"+msg+"')";
    con.query(q,function(err,result){
    if(err)
        throw err;
    res.send("vtweet");
    
    })
    
    });

    app.get("/vtweet",function(req,res){
        var email=req.session.uemail;
        var q="select * from tweet"; 

        con.query(q,function(err,result){
        if(err)
            throw err;
        
        res.render("home",{data:result});
        
        })
        
        });
        
    
        app.get("/message", (req, res) => {
            res.render("./frontend/html/message.html", { root: __dirname });
        });
        
       
        
        
       

app.listen(8000,()=>
{
    console.log("Project run on port no 8000");
});









