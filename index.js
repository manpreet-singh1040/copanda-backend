//external dependencies
require('dotenv/config');
require('dotenv').config();
const express = require('express');
const mongoose=require('mongoose');
const bodyParser = require('body-parser');
const Router = require("./src/routes/router")
const cookieParser=require('cookie-parser');
const cors=require('cors')

//internal dependencies
const runMigrations = require("./src/db/migrations/migrations");
const {GetUserByEmail, CreateUser} = require("./src/services/database")

// express server instance
const app = express();
const port = process.env.PORT || 8080;
const mongoPort=process.env.MONGO_PORT || 2017;
//basic configs
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: true})
);

//setup router 
app.use("/", Router);

const mongoConnection=async()=>{
    try{

        await mongoose.connect(`mongodb://localhost:${mongoPort}/`);
        console.log(`mongo connected!!`);
    }
    catch(err){
        console.log(`mongo connecteion err!!`);
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
//Listen and serve
app.listen(port, () => {
console.log(`Server listening at port:${port}`)
});

//start();