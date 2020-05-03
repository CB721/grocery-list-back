const sqlDB = require("../sql_connection");
const listTable = "lists";
const listItemsTable = "list_items";
const notificationsTable = "notifications";
const datamuse = require("datamuse");

module.exports = {
    addItem: function (req, res) {
        // prevent injections
        const name = sqlDB.escape(req.body.name);
        const user_id = sqlDB.escape(req.body.user_id);
        const store_id = sqlDB.escape(req.body.store_id);
        const position = sqlDB.escape(req.body.position);
        const priority = sqlDB.escape(req.body.priority);
        const list_id = sqlDB.escape(req.body.list_id);

        // find current list
        let getCurrentList = function () {
            let queryStr = `SELECT * FROM ${listTable} WHERE user_id = ${user_id} AND lists.completed = false;`;
            sqlDB
                .query(queryStr,
                    function (err, results) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            // if completed, or no lists create a new list
                            if (results.completed > 0 || results.length < 1) {
                                createList();
                            } else {
                                addItemToList(results[0].id);
                            }
                        }
                    });
        }
        // create list
        let createList = function () {
            const columns = "(date_added, user_id)"
            sqlDB
                .query(`INSERT INTO ${listTable} ${columns} VALUES (NOW(), ${user_id});`,
                    function (err) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            getCurrentList();
                        }
                    });
        }
        // add item to list
        let addItemToList = function (id) {
            sqlDB
                .query(`CALL add_item(${id}, ${name}, ${store_id}, ${position}, ${priority});`,
                    function (err, results) {
                        if (err) {
                            console.log(err);
                            return res.status(422).send(err);
                        } else {
                            return res.status(200).json(results);
                        }
                    });
        }
        // if a list id has been sent, there is an existing list that we can add to
        if (req.body.list_id) {
            addItemToList(list_id);
        } else {
            // otherwise create a list
            createList();
        }
    },
    getCurrentUserList: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.params.id);
        sqlDB
            .query(`CALL current_list(${ID});`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        return res.status(200).json(results[0]);
                    }
                });
    },
    updateItem: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.params.id);
        const update = req.body;
        // would be updating position on list, if it has been purchased or it's priority level
        const column = Object.keys(update)[0];
        const value = sqlDB.escape(update[column]);
        let date = " ";
        // if item is being purchased
        if (column === "purchased" && value === "true") {
            // add to column and value
            date = ", date_purchased = NOW()";
        } else if (column === "purchased" && value === "false") {
            date = `, date_purchased = ${null}`;
        }
        sqlDB
            .query(`UPDATE ${listItemsTable} SET ${column} = ${value}${date} WHERE id = ${ID};`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        if (results.affectedRows > 0) {
                            return res.status(200).send("Item updated");
                        } else {
                            return res.status(404).send("No item found");
                        }
                    }
                });
    },
    removeItem: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.params.id);
        sqlDB
            .query(`DELETE FROM ${listItemsTable} WHERE id = ${ID};`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        return res.status(200).json(results);
                    }
                });
    },
    getListByID: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.params.userid);
        const list_id = sqlDB.escape(req.params.id);
        sqlDB
            .query(`CALL get_list_by_id(${ID}, ${list_id});`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        return res.status(200).json(results[0]);
                    }
                });
    },
    getListsByUserID: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.body.user_id);
        let direction = sqlDB.escape(req.body.direction);
        // remove ' from beginning and end of direction string
        direction = direction.substr(1);
        direction = direction.substr(0, direction.length - 1);
        // default completed to true because this route will mostly be used for retrieving a completed list
        const completed = (sqlDB.escape(req.body.completed || true)) == "true";
        sqlDB
            .query(`SELECT * FROM lists WHERE user_id = ${ID} and completed = ${completed} ORDER BY date_added ${direction};`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        return res.status(200).json(results);
                    }
                });
    },
    updateList: function (req, res) {
        const update = req.body;
        // grab column name of what is to be updated
        const column = Object.keys(update)[0];
        // prevent injections
        const value = sqlDB.escape(update[column]);
        const userID = sqlDB.escape(req.body.user_id);
        const ID = sqlDB.escape(req.body.list_id);
        sqlDB
            .query(`UPDATE ${listTable} SET ${column} = ${value} WHERE user_id = ${userID} AND id = ${ID};`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        if (results.affectedRows > 0) {
                            return res.status(200).send("List updated");
                        } else {
                            return res.status(404).send("No list found");
                        }
                    }
                });
    },
    addPreviousListToCurrent: function (req, res) {
        // prevent injections
        // list id is the id of the list being added to the current list
        const list_id = sqlDB.escape(req.body.list_id);
        const user_id = sqlDB.escape(req.body.user_id);
        // check if any values are null
        if (!list_id || !user_id) {
            return res.status(400).send("Missing field");
        }
        // check if a list already exists
        // find current list
        let getCurrentList = function () {
            sqlDB
                .query(`SELECT * FROM ${listTable} WHERE user_id = ${user_id} AND lists.completed = false;`,
                    function (err, results) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            if (results.length < 1) {
                                // if no lists, create a new list
                                createList();
                            }
                            // if completed, create a new list
                            if (results.completed > 0 || results.length < 1) {
                                createList();
                            } else {
                                // pass current id along with amount of items for positioning
                                getPreviousList(results[0].id, results.length);
                            }
                        }
                    });
        }
        getCurrentList();
        let getPreviousList = function (currID, resLen) {
            sqlDB
                .query(`SELECT * FROM ${listItemsTable} WHERE list_id = ${list_id};`,
                    function (err, results) {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            // send results with current list id
                            addPrevListToCurrent(currID, resLen, results);
                        }
                    })
        }

        let createList = function () {
            const columns = "(date_added, user_id)"
            sqlDB
                .query(`INSERT INTO ${listTable} ${columns} VALUES (NOW(), ${user_id});`,
                    function (err) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            getCurrentList();
                        }
                    });
            // console.log("create list");
        }
        let addPrevListToCurrent = function (currID, resLen, itemsArr) {
            // check if anything is in the previous list
            if (itemsArr.length > 0) {
                const columns = "(date_added, list_id, name, store_id, position, priority)";
                let queryStr = `INSERT INTO ${listItemsTable} ${columns} VALUES`;
                // loop through items
                for (let i = 0; i < itemsArr.length; i++) {
                    // add each item's info to the string
                    // default date added to current time
                    // place additional items at the end of the current list
                    // default priority to Normal
                    queryStr += `(NOW(), ${currID}, '${itemsArr[i].name}', '${itemsArr[i].store_id}', ${resLen + i + 1}, 'Normal'), `;
                }
                // remove last comma and space from string
                queryStr = queryStr.substring(0, queryStr.length - 2);
                // add semicolon to string
                queryStr += ";";
                sqlDB
                    .query(queryStr,
                        function (err, results) {
                            if (err) {
                                return res.status(422).send(err);
                            } else {
                                if (results.affectedRows > 0) {
                                    return res.status(200).json({ status: "success" });
                                } else {
                                    return res.status(500).send("Error with database, nothing added");
                                }
                            }
                        });
            } else {
                return res.status(404).send("Nothing is previous list");
            }
        }
    },
    deleteList: function (req, res) {
        // prevent injections
        const ID = sqlDB.escape(req.params.id);
        const userID = sqlDB.escape(req.params.userid);
        sqlDB
            .query(`DELETE FROM ${listTable} WHERE id = ${ID} AND user_id = ${userID};`,
                function (err, results) {
                    if (err) {
                        return res.status(422).send(err);
                    } else {
                        if (results.affectedRows > 0) {
                            return res.status(200).send("List deleted");
                        } else {
                            return res.status(404).send("No list found");
                        }
                    }
                });
    },
    getSentLists: function (req, res) {
        // prevent injections
        const user_id = sqlDB.escape(req.params.userid);
        const other_user_id = sqlDB.escape(req.params.otheruserid);
        if (!user_id || !other_user_id) {
            return res.status(400).send("No user or other user id provided");
        }
        sqlDB
            .query(`CALL get_sent_lists(${user_id}, ${other_user_id});`,
                function (err, results) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        return res.status(200).json(results[0]);
                    }
                });
    },
    itemSuggestion: function (req, res) {
        // ensure user is signed in
        if (!req.session.user) {
            return res.status(401).send("Sign in to continue");
        }
        // only search when the search term is at least 4 characters
        if (req.body.search.length < 4) {
            return res.status(204).send("Invalid length");
        }
        // prevent injections and add place wildcard for sql like operator
        const search = sqlDB.escape(`*${req.body.search}*`);
        const ID = sqlDB.escape(req.session.user.id);
        // results array
        let suggestions = [];
        // first search the user's items
        sqlDB.query(`CALL search_user_items(${search}, ${ID})`,
            function (err, results) {
                if (err) {
                    return res.status(500).json(err);
                } else {
                    filterDuplicates(results[0]);
                }
            });
        function searchAllItems() {
            // search for all items that are not assigned to the user
            sqlDB.query(`CALL search_all_items(${search}, ${ID})`,
                function (err, results) {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        searchedAll = true;
                        filterDuplicates(results[0]);
                    }
                });
        }
        // set boolean to determine if all items have been searched yet
        let searchedAll = false;
        function filterDuplicates(items) {
            for (let i = 0; i < items.length; i++) {
                // lowercase name value
                let name = items[i].name.toLowerCase();
                // check if it is already in the suggestions array
                if (suggestions.indexOf(name) < 0) {
                    suggestions.push(name);
                }
            }
            // if the suggestions are less than 5 and all items haven't been searched yet
            if (suggestions.length < 5 && !searchedAll) {
                searchAllItems();
                // if the suggestions are still less than 5 after search all items
                // send request to datamuse api
            } else if (suggestions.length < 5) {
                // word suggestion api
                datamuse.sug({
                    s: search
                })
                    .then(results => {
                        const outputArr = [...suggestions];
                        for (let i = 0; i < results.length; i++) {
                            // if the output array has reached 5
                            if (outputArr.length >= 5) {
                                break;
                            }
                            let name = results[i].word.toLowerCase();
                            // if the suggestion has not already been added to the output array
                            if (outputArr.indexOf(name) < 0) {
                                outputArr.push(name);
                            }
                        }
                        return res.status(200).json(outputArr);
                    })
                    .catch(err => res.status(500).json(err));
            }
        }
    },
    addBulkItems: function (req, res) {
        // only allow authenicated users to proceed
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).send("Login to proceed");
        }
        const rightNow = Date.now();
        // if there is lastListBulkAdd property and it has been less than 5 minutes since the last request, don't process the request
        console.log(req.session.user.lastListBulkAdd - rightNow < 30000);
        if (req.session.user.lastListBulkAdd && req.session.user.lastListBulkAdd - rightNow < 30000) {
            return res.status(429).send("Recent request already processed");
        }
        // add last list items bulk add property to user session
        req.session.user = {
            id: req.session.user.id,
            email: req.session.user.email,
            user_auth: req.session.user.user_auth,
            lastListBulkAdd: rightNow
        };
        const user_id = req.session.user.id;
        // expecting an array for items
        const newItems = req.body.items;
        // check first item for list id
        // since this will be the first item added while offline, if it has a list id, the rest will use that id
        // will update this value if a new list needs to be created
        let existingListID = newItems[0].list_id;
        // if list id doesn't exist or the id isn't a number
        if (!existingListID || typeof (existingListID) !== "number") {
            // check if a list does actually currently exist
            sqlDB
                .query(`SELECT * FROM ${listTable} WHERE user_id = '${user_id}' AND lists.completed = false;`,
                    function (err, results) {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            if (results.length < 1 || results[0].completed > 0) {
                                // if it doesn't create new list
                                createList();
                            } else {
                                // if it does, update existing list id
                                existingListID = results[0].id;
                                addItems();
                            }
                        }
                    });
        } else {
            // if an id does exist, move on to add items
            addItems();
        }
        function createList() {
            console.log("time to create a list");
            const columns = "(date_added, user_id)"
            sqlDB
                .query(`INSERT INTO ${listTable} ${columns} VALUES (NOW(), ${user_id});`,
                    function (err, result) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            console.log("new list created");
                            // update list id to newly created list id
                            existingListID = result.insertId;
                            addItems();
                        }
                    });
        }
        function addItems() {
            // string for adding to query to add all items to a list
            const columns = "(date_added, list_id, name, store_id, position, priority)";
            let queryStr = `INSERT INTO ${listItemsTable} ${columns} VALUES`;
            // iterate over each item
            for (let i = 0; i < newItems.length; i++) {
                // prevent injections on each field
                let singleItem = `(NOW(), ${existingListID}, ${sqlDB.escape(newItems[i].name)}, ${sqlDB.escape(newItems[i].store_id)}, ${sqlDB.escape(newItems[i].position)}, ${sqlDB.escape(newItems[i].priority)}), `;
                // add to query
                queryStr += singleItem;
            }
            // remove last comma and space from string
            queryStr = queryStr.substring(0, queryStr.length - 2);
            // add semicolon to string
            queryStr += ";";
            // add items to existing or new list
            sqlDB.query(queryStr,
                function(err, results) {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        return res.status(201).json(results);
                    }
                });
        }
    }
}
