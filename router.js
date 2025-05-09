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
const { Server } = require('socket.io');
const io = new Server(server);
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
      return res.redirect("/login"); 
    }

    const getUsersQuery = "SELECT * FROM users";
  
    const getFollowedQuery = "SELECT following_id FROM followers WHERE follower_id = ?";
  //   const getFollowerCountQuery = "SELECT COUNT(*) AS count FROM followers WHERE following_id = ?";
  // const getFollowingCountQuery = "SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?";

  
    con.query(getUsersQuery, function (err, allUsers) {
      if (err) throw err;
  
      con.query(getFollowedQuery, [currentUserId], function (err, followedRows) {
        if (err) throw err;
  
        const followedIds = followedRows.map(row => row.following_id);
        // con.query(getFollowerCountQuery, [currentUserId], function (err, followerResult) {
        //   if (err) throw err;
  
        //   const followersCount = followerResult[0].count;
  
        //   // Fourth query: Count users the current user is following
        //   con.query(getFollowingCountQuery, [currentUserId], function (err, followingResult) {
        //     if (err) throw err;
  
    
        // const followingCount = followingResult[0].count;

            res.render("profile", {
            data: allUsers,          
            uname: currentUsername,   
            followedIds: followedIds , /* List of user ID the current user follow*/
      //       followersCount,
      //       followingCount  
      //     });
      // });
    });
  });
});
});
  app.post("/follow", function (req, res) {
    console.log(req.session);
    
    const followerId = req.session.userId;
    const followingId = req.body.userId;
    console.log(followerId);
    
    console.log("Follow request:", { followerId, followingId }); 
  
    if (!followerId || !followingId) {
      console.error("Missing user IDs in follow request");
      return res.status(400).send("Missing user ID");
    }
  
    const insertQuery = "INSERT INTO followers (follower_id, following_id) VALUES (?, ?)";
  
    con.query(insertQuery, [followerId, followingId], function (err, result) {
      if (err) {
        console.error("Database error on follow:", err); 
        return res.status(500).send("Database error");
      }

      // const notifMsg = `User ${req.session.uname} started following you.`;
      // const insertNotifQuery = "INSERT INTO notifications (user_id, type, message) VALUES (?, 'follow', ?)";

      // // This notifies the user being followed
      // con.query(insertNotifQuery, [followingId, notifMsg], function (err2, result2) {
      //     if (err2) {
      //         console.error("Notification error:", err2);
      //         return res.status(500).send("Followed but failed to notify");
      //     }

      
      console.log("Followed successfully:", result);
      res.status(200).send("Followed successfully");
    });
  });
  // });


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
      return res.redirect("/login"); 
    }

    var entry="select * from users where id='"+currentUserId+"'";

    
    res.render("editProfile", { entry     });
  });

app.get("/",function(req,res)
{
res.sendFile("./frontend/html/register.html",{root:__dirname});
});

/*--------------------Message----------------*/
app.get('/message', (req, res) => {
  const currentUserId = req.session.userId;
  con.query('SELECT id, name FROM users WHERE id != ?', [currentUserId], (err, users) => {
    if (err) throw err;
    res.render('message', { users, currentUser: { id: req.session.userId, name: req.session.uname } });

  });
});
let userSocketMap = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('registerUser', (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  socket.on('privateMessage', (data) => {
    // Save to DB (MySQL)
    const { senderId, receiverId, message } = data;
    const timestamp = new Date();
console.log('private message received',data);
    con.query(
      'INSERT INTO messages (sender_id, receiver_id, message, timestamp) VALUES (?, ?, ?, ?)',
      [senderId, receiverId, message, timestamp]
    );

    // Emit to the receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('privateMessage', data);
    }
  });
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
        
    
       



       /*----------------------notification----------------*/ 
      //   app.get("/notifications", (req, res) => {
      //     const currentUserId = req.session.userId;
      
      //     if (!currentUserId) {
      //         return res.redirect("/login");
      //     }
      
      //     const q = "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
      
      //     con.query(q, [currentUserId], (err, result) => {
      //         if (err) throw err;
      //         res.render("notifications", { notifications: result });
      //     });
      // });

// const notifMsg = `User ${req.session.uname} started following you.`;
// const insertNotifQuery = "INSERT INTO notifications (user_id, type, message) VALUES (?, 'follow', ?)";

// con.query(insertNotifQuery, [followingId, notifMsg], function (err2) {
//     if (err2) {
//         console.error("Notification error:", err2);
//         // continue even if notification fails
//     }
//   });

      
        
        
       

server.listen(8000,()=>
{
    console.log("Project run on port no 8000");
  });









