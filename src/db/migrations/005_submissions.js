const createTableSubmissions = `
CREATE TABLE IF NOT EXISTS submissions (
    submission_id UUID PRIMARY KEY,
    user_id UUID,
    problem_id UUID,
    language_id UUID,
    code TEXT NOT NULL,
    submission_time TIMESTAMP NOT NULL,
    status VARCHAR(40),
    execution_time INT,
    memory_used INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (problem_id) REFERENCES problems(problem_id),
    FOREIGN KEY (language_id) REFERENCES languages(language_id)
);
`

module.exports = createTableSubmissions;