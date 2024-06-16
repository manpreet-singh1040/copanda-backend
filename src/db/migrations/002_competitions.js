const createTableCompetitions = `
CREATE TABLE IF NOT EXISTS competitions (
    competition_id UUID PRIMARY KEY ,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);
`

module.exports = createTableCompetitions;