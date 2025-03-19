var express=require('express');
var app=express();
app.use(express.static("socialNet/frontend"));
console.log(__dirname);
const multer = require('multer');
const session = require("express-session");
app.use("/css",express.static(__dirname+"/frontend/css"));
app.use("/js",express.static(__dirname+"/frontend/js"));
app.use(express.static("frontend/html"));
app.use(express.static("frontend/uploads"));
app.use(session({
    secret: "12345",
    saveUninitialized: true,
    resave: true
}));
app.use(function (req, res, next) {
    res.locals.uname = req.session.uname;
    res.locals.uemail = req.session.uemail;
    res.locals.uimage= req.session.uimage;
    
  
    next();
  });




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

app.get("/profile",function(req,res)
{

        res.render("profile");
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
   
    var q="insert into users values('"+a+"','"+b+"','"+c+"','"+d+"')";
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
        

app.listen(8000,()=>
{
    console.log("Project run on port no 8000");
});







