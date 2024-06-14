import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Router from './src/routes/router.js';

// express server instance
const app = express();
const port = process.env.PORT || 8080;

//basic api configs
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: true})
);

//setup router 
app.use("/", Router);


export { app, port};