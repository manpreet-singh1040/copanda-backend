const createUserQuery = `
    INSERT INTO users(id, name, roll_no, email, password)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *;    
`

const getUserByEmailQuery = `
    SELECT * FROM users
    WHERE email = $1;
`

module.exports = {createUserQuery, getUserByEmailQuery};