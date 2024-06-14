import { v4 as uuidv4 } from 'uuid';

const createTableUsers = `
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(30) NOT NULL,
        roll_no INT NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )
`

export default createTableUsers;