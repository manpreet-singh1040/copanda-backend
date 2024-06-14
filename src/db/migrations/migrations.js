import db from "../db_postgres.js";
import createTableUsers from "./001_users.js";

const runMigrations = async() => {
    console.log("BEGIN DB MIGRATIONS")

    //get a client connection from the Pool
    const client = await db.connect();

    try{
        await client.query('BEGIN')     //Begin Transaction

        await client.query(createTableUsers)        //001_users migration

        await client.query('COMMIT')    //Commit Transaction
    }
    catch(error) {
        await client.query('ROLLBACK')  //Rollback incase of Transaction failure
        console.log("DATABASE MIGRATION FAILED")
        throw error
    }
    finally {
        client.release()                //Release client back to Database Pool
    }
}

export default runMigrations;