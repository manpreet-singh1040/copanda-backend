//external dependencies
require('dotenv/config');
require('dotenv').config();
const express = require('express');
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const Router = require("./src/routes/router")
const cookieParser=require('cookie-parser');
const Redis=require('ioredis');

const app = express();

const cors=require('cors')

// Define your allowed origins
const allowedOrigins = ['https://code.ddks.tech', 'http://localhost:5174','http://localhost:5173','http://98.70.54.166'];

// Configure the CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  credentials:true
}));


//internal dependencies
const runMigrations = require("./src/db/migrations/migrations");
const {GetUserByEmail, CreateUser} = require("./src/services/database")

// express server instance
const port = process.env.PORT || 8080;
const mongoPort=process.env.MONGO_PORT || 27017;
const mongoUrl=process.env.MONGO_URL || "localhost";
//basic configs
/*app.use(cors({
    origin:'https://code.ddks.live',
    credentials:true
}));*/
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: true})
);

//setup router 
app.use("/", Router);

const mongoConnection=async()=>{
    try{
        
        mongo=mongoUrl;
        // await mongoose.connect(`mongodb://${mongoUrl}:${mongoPort}/`);
        await mongoose.connect(mongo);
        console.log(`mongo connected!!`);
    }
    catch(err){
        console.log(`mongo connecteion err!! ${err}`);
    }
}
mongoConnection();
async function start() {
    await runMigrations();

    //test DB begin
    async function fetchAndLogUserByEmail(email) {
        try {
            const user = await GetUserByEmail(email);
            console.log(user);
        } catch (error) {
            console.error("Error fetching user by email:", error);
        }
    }
    
    fetchAndLogUserByEmail("xyz.abc.com");

    //test DB end

    
}


// const redis= new Redis(process.env.REDIS_URL);

// redis.on('connect', () => {
//     console.log('Connected to Redis');
// });

// redis.on('error', (err) => {
//     console.log('Redis connection error:', err);
// });


//Listen and serve
app.listen(port, () => {
    console.log(`Server listening at port:${port}`)
});
// module.exports=redis;

//start();