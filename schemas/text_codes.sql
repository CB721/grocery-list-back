CREATE TABLE text_codes
(
	id INT NOT NULL AUTO_INCREMENT
    , number VARCHAR(15)
    , code VARCHAR(75)
    , date_requested TIMESTAMP
    , count INT DEFAULT 0
    , user_id VARCHAR(100)
    , PRIMARY KEY(id)
    , FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);