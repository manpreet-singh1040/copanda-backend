const createTableScores = `
CREATE TABLE IF NOT EXISTS scores (
    competition_id UUID,
    user_id UUID,
    score INT,
    Rank INT,
    PRIMARY KEY (competition_id, user_id),
    FOREIGN KEY (competition_id) REFERENCES competitions(competition_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
`

module.exports = createTableScores;