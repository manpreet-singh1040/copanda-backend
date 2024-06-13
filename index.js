const express = require('express');
const bodyParser = require('body-parser');
const Router = require("./src/routes/router")

// express server instance
const app = express();
const port = process.env.PORT || 8080;

//basic configs
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({ extended: true})
);

//setup router 
app.use("/api/v1", Router);

//Listen and serve
app.listen(port, () => {
    console.log(`Server listening at port:${port}`)
  });