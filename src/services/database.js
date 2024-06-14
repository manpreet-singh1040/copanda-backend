import {createUserQuery, getUserByEmailQuery} from "../db/queries/users.js";
import db from "../db/db_postgres.js";
import { v4 as uuidv4, v4 } from 'uuid';

const CreateUser = async(user) => {
    const { user_name, roll_no, email, password } = user;
    const user_id = uuidv4();

    try {
        const result = await db.query(createUserQuery, [user_id,
            user_name, roll_no, email, password
        ])
    
        return result.rows[0];
    } catch(error) {
        console.error("Error Creating user: ", error);
        throw error
    }
}

const GetUserByEmail = async(email) => {
    try{
        const result = await db.query(getUserByEmailQuery, [email]);
        return result.rows[0];
    } catch(error) {
        console.error("Error Fetching user: ", error);
        throw error
    }
}

export {CreateUser, GetUserByEmail}