// import http from 'http';          //Latest way of importing
// import name from './feature.js';
// import { name2, name3 } from './feature.js';

// // const http=require("http");    //Traditional way of importing

// console.log(name);
// console.log(name2);
// console.log(name3);

// // console.log(http);
// const server=http.createServer((req,res)=>
// {
//     // console.log(req.url);
//     // res.end("Noice Work");

//     if(req.url=== "/about")
//     {
//         res.end("About Page");
//     }
//     else if(req.url==='/contact')
//     {
//         res.end("Contact Page");
//     }
//     else if(req.url=== "/")
//     {
//         res.end("Home Page");
//     }
//     else{
//         res.end("Page not Found");
//     }
// });

// server.listen(5000,()=>
// {
//     console.log("server started");
// })





import express from "express";
import path from 'path';
import mongoose from "mongoose";
// import { name } from "ejs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
// import { decode } from "punycode";



mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName : "backend"
}).then(()=>
{
    console.log("Database Connected");
}).catch((e)=>

    console.log(e)
);

//Defining Schema for Mongodb
const userSchema = mongoose.Schema({
    name : String,
    email: String,
    password : String
});

//Creating Model
const User = mongoose.model("User",userSchema);

const app=express();

// const users=[];

//Middlewares
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


//Setting of view engine
app.set("view engine", "ejs");



const isAuth = async (req, res, next) => {
    const { token } = req.cookies;

    if (token) {
        try {
            const decoded = jwt.verify(token, "mysecretcode");
            req.user = await User.findById(decoded._id); // Corrected: use decoded._id
            next();
        } catch (error) {
            console.error(error);
            res.render("login");
        }
    } else {
        res.render("login");
    }
}


app.get("/", isAuth, (req,res)=>
{
    console.log(req.user);
    res.render("logout");
})


app.get("/register", (req,res)=>
{ 
    res.render("register");
})


app.get("/", async(req, res) => {

    const usertoken =await User.create({
         email, password
    });


    const { token } = req.cookies;
    
    if (token) {
        res.redirect("/"); // Redirect authenticated user to the root with "/login" route
    } else {
        res.render("login");
    }
});



//Setting an API to fetch the data from the users array.
// app.get("/users",(req,res)=>
// {
//     res.json({users});
// });


// app.get("/add",async (req,res)=>
// {
//     await message.create({name : "Piyush", email : "abc@gmail.com"});
//     res.send("Data sent");   
// });


app.post("/register",async(req,res)=>
{
    const {name, email, password} =req.body;


    let check=await User.findOne({email});
    if(check)
    {
        return res.redirect("/login");
    }

    const usertoken =await User.create({
        name, email, password
    });

    const token = jwt.sign({_id : usertoken._id}, "mysecretcode");
    // console.log(token);


    res.cookie("token", token, {
        httpOnly : 'true', 
        expires : new Date(Date.now() + 10*1000),
    });
    res.redirect("/login");
});



app.post("/login",async(req,res)=>
{
    const {email, password}=req.body;

    let user = await User.findOne({email});

    if(!user)
    {
        res.redirect("/register");
    }

    const isMatch = await User.findOne({password});
    if(isMatch)
    {
        return res.render("login", {message : 'Incorrect Credentials'});
    }

    const token = jwt.sign({_id : usertoken._id}, "mysecretcode");
    // console.log(token);


    res.cookie("token", token, {
        httpOnly : 'true', 
        expires : new Date(Date.now() + 10*1000),
    });
    res.redirect("/login");

});




app.get("/login",(req,res)=>
{
    res.render("login");
});


app.get("/logout",(req,res)=>
{
    res.cookie("token",null, {
        httpOnly : 'true', 
        expires : new Date(Date.now()),
    });
    res.redirect("/");
});

app.listen(5000,()=>
{
    console.log("Server started");
})