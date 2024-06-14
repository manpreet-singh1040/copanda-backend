import {app, port} from './server.js' 
import runMigrations from './src/db/migrations/migrations.js';
import {CreateUser, GetUserByEmail} from "./src/services/database.js"

async function start() {
    await runMigrations();

    //test query
    /*
    let user = {user_name: "gaurav", roll_no: 22104042, email:"xyz.abc.com", password:"pass"}
    console.log(CreateUser(user))

    let user2 = {user_name: "jake", roll_no: 22104041, email:"xyzd.abc.com", password:"pass"}
    console.log(CreateUser(user2))
    */
    async function fetchAndLogUserByEmail(email) {
        try {
            const user = await GetUserByEmail(email);
            console.log(user);
        } catch (error) {
            console.error("Error fetching user by email:", error);
        }
    }
    
    fetchAndLogUserByEmail("xyz.abc.com");

    //test end

    //Listen and serve
    app.listen(port, () => {
        console.log(`Server listening at port:${port}`) 
    });

}

start();