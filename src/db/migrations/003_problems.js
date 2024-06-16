const createTableProblems = `
CREATE TABLE IF NOT EXISTS problems (
    problem_id UUID PRIMARY KEY,
    competition_id UUID,
    title VARCHAR(255) NOT NULL,
    statement TEXT NOT NULL,
    sample_input TEXT,
    sample_output TEXT,
    difficulty VARCHAR(20),
    FOREIGN KEY (competition_id) REFERENCES competitions(competition_id)
);
`

module.exports = createTableProblems;