CREATE TABLE list_items
(
    id INT NOT NULL UNIQUE AUTO_INCREMENT 
    , date_added TIMESTAMP
    , date_purchased TIMESTAMP
    , list_id INT NOT NULL
    , name VARCHAR(255) NOT NULL
    , purchased BOOLEAN DEFAULT FALSE
    , store_id VARCHAR(255) NOT NULL
    , FOREIGN KEY (list_id) REFERENCES lists(id)
    , FOREIGN KEY (store_id) REFERENCES stores(id)
    , PRIMARY KEY(id)
);

CREATE PROCEDURE search_user_items(IN search VARCHAR(255), ID VARCHAR(255))
SELECT DISTINCT
list_items.name
FROM list_items 
INNER JOIN  lists ON list_items.list_id = lists.id
WHERE name LIKE search
AND user_id = ID
GROUP BY name
LIMIT 5;

CREATE PROCEDURE search_all_items(IN search VARCHAR(255), ID VARCHAR(255))
SELECT DISTINCT
list_items.name
FROM list_items 
INNER JOIN  lists ON list_items.list_id = lists.id
WHERE name LIKE search
AND user_id <> ID
GROUP BY name
LIMIT 5;