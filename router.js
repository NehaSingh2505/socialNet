var express=require('express');
var app=express();
app.use(express.static("socialNet/frontend"));
app.use(express.static("socialNet/frontend/css"));
app.use(express.static("socialNet/frontend/html"));

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




app.get("/login",function(req,res)
{
res.sendFile("./frontend/html/login.html",{root:__dirname});
});

app.get("/register",function(req,res)
{
res.sendFile("./frontend/html/register.html",{root:__dirname});
});
app.get("/",function(req,res)
{
res.sendFile("./frontend/html/register.html",{root:__dirname});
});


/*-----------------------register------------------*/
app.post("/regprocess",function(req,res)
{
    var a=req.body.N;
    var b=req.body.E;
    var c=req.body.P;
    var q="insert into users values('"+a+"','"+b+"','"+c+"')";
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
            res.render('frontp',{na:result[0].name});
        else
        res.send("Password is invalid");
    }
    else
    res.send("Email is invalid");
});    
});

app.listen(8000,()=>
{
    console.log("Project run on port no 8000");
});







