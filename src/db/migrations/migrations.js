const db =  require("../db_postgres.js");

const  createTableUsers =  require("./001_users.js");
const  createTableCompetitions =  require("./002_competitions.js");
const  createTableProblems =  require("./003_problems.js");
const  createTableLanguages =  require("./004_languages.js");
const  createTableSubmissions =  require("./005_submissions.js");
const  createTableScores =  require("./006_scores.js");

const runMigrations = async() => {
    console.log("BEGIN DB MIGRATIONS")

    //get a client connection from the Pool
    const client = await db.connect();

    try{
        await client.query('BEGIN')     //Begin Transaction

        await client.query(createTableUsers)        //001_users migration
        await client.query(createTableCompetitions)        //002_competitions migration
        await client.query(createTableProblems)        //003_problems migration
        await client.query(createTableLanguages)        //004_languagesmigration
        await client.query(createTableSubmissions)        //005_submissions migration
        await client.query(createTableScores)        //001_scores migration

        await client.query('COMMIT')    //Commit Transaction
    }
    catch(error) {
        await client.query('ROLLBACK')  //Rollback incase of Transaction failure
        console.log("DATABASE MIGRATION FAILED")
        throw error
    }
    finally {
        client.release()                //Release client back to Database Pool
        console.log("DB MIGRATION FINISHED")
    }
}
module.exports = runMigrations ;