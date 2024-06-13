const express = require('express');
const bodyParser = require('body-parser');
const Router = require("./src/routes/router")
const cookieParser=require('cookie-parser');
const cors=require('cors')
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

//Listen and serve
app.listen(port, () => {
    console.log(`Server listening at port:${port}`)
  });