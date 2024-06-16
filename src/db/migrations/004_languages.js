const createTableLanguages = `
CREATE TABLE IF NOT EXISTS languages (
    language_id UUID PRIMARY KEY ,
    name VARCHAR(50) NOT NULL
);
`
module.exports = createTableLanguages;