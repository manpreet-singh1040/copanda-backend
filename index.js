//external dependencies
require('dotenv/config');
require('dotenv').config();
const express = require('express');

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

//basic configs
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: true})
);

//setup router 
app.use("/", Router);


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

    //Listen and serve
    app.listen(port, () => {
    console.log(`Server listening at port:${port}`)
    });

}

start();