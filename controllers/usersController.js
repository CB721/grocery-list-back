const sqlDB = require("../sql_connection");
const { User } = require("../mongoose_models");
const checkPass = require("../validation/checkPass");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const table = "users";
const notificationsTable = "notifications";
const userStoreTable = "user_stores";
const { isEmail } = require("validator");
const { corbato } = require("../utilities/hashPass");

module.exports = {
    createUser: function (req, res) {
        const newUser = req.body;
        // check if password is at least 8 characters
        if (!checkPass(newUser.password)) {
            return res.status(400).send("Password must be at least 8 characters");
        }
        // check for mongo injection and a valid email
        if (newUser.email.indexOf("$") > -1 || !isEmail(newUser.email)) {
            return res.status(406).send("Invalid email");
        } else {
            // check if email already exists - mongo
            User
                .find({ email: newUser.email })
                .then(response => {
                    if (response.length > 0) {
                        // check sql to see if this user has been created or not
                        userIsCreated(response[0].id);
                    } else {
                        // otherwise create a new user
                        createUserMongo();
                    }
                })
                .catch(err => console.log(err));
        }
        function userIsCreated(id) {
            const ID = sqlDB.escape(id);
            sqlDB
                .query(`SELECT * FROM ${table} WHERE id = ${ID};`,
                    function (err, results) {
                        if (err) {
                            return res.status(500).send(err);
                            // if the user has already been completed
                        } else if (results[0].created === 1) {
                            return res.status(400).send("Email already exists");
                        } else {
                            // hash user password
                            corbato(newUser.password)
                                .then(hash => {
                                    // update created user with new password and name
                                    updateUser(hash, ID);
                                })
                                .catch(err => {
                                    return res.status(500).send(err);
                                });
                        }
                    });
        }
        // update user info
        function updateUser(pass, ID) {
            if (newUser.first_name == undefined ||
                newUser.last_name == undefined ||
                pass == undefined) {
                return res.status(400).send("Complete all fields before continuing");
            } else {
                sqlDB
                    .query(`UPDATE ${table} SET first_name = ${newUser.first_name}, last_name = ${newUser.last_name}, password = ${pass}, last_visit = NOW(), joined = NOW() WHERE id = ${ID};`,
                        function (err, results) {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                newUserNotification(ID);
                                return res.status(200).json(results);
                            }
                        })
            }
        }
        // create user in mongo
        // only email is saved in mongo
        function createUserMongo() {
            User
                .create({ email: newUser.email })
                .then(response => {
                    // get id from mongo
                    let id = response.id;
                    // check if all user fields are complete
                    if (newUser.first_name == undefined ||
                        newUser.last_name == undefined ||
                        newUser.password == undefined ||
                        newUser.email == undefined) {
                        return res.status(400).send("Complete all fields before continuing")
                    } else {
                        // password gets hashed and sent directly to sql
                        corbato(newUser.password)
                            .then(hash => completeUser(hash, id))
                            .catch(err => {
                                return res.status(500).send(err);
                            });
                    }
                })
                .catch(err => res.status(422).json(err));
        }
        // transfer id, email, to sql
        let completeUser = function (pass, identity) {
            let columns = "(id, first_name, last_name, email, user_password, last_visit, joined)";
            const first = sqlDB.escape(newUser.first_name);
            const last = sqlDB.escape(newUser.last_name);
            const email = sqlDB.escape(newUser.email);
            const id = sqlDB.escape(identity);
            const password = sqlDB.escape(pass);
            sqlDB
                .query(`INSERT INTO ${table} ${columns} VALUES(${id}, ${first}, ${last}, ${email}, ${password}, NOW(), NOW());`,
                    function (err, results) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            newUserNotification(id);
                            addDefaultStore(id);
                            return res.status(200).json(results);
                        }
                    });
        }
        function newUserNotification(ID) {
            sqlDB
                .query(`INSERT INTO ${notificationsTable} (content, date_added, user_id) VALUES("Welcome to G-List!", NOW(), ${ID});`,
                    function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
        }
        function addDefaultStore(user_id) {
            let columns = "(store_id, user_id)";
            sqlDB
                .query(`INSERT INTO ${userStoreTable} ${columns} VALUES('1', ${user_id});`,
                    function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
        }
    },
    deleteUser: function (req, res) {
        // get id
        let id = req.params.id;
        // prevent injections
        if (id.indexOf("$") > -1) {
            return res.status(406).send("Invalid user id");
        }
        id = sqlDB.escape(id);

        // delete from mongo
        User
            .findById({ _id: req.params.id })
            .then(response => {
                response.remove();
                deleteSQL();
            })
            .catch(err => res.status(422).send(err));
        // delete in sql
        let deleteSQL = function () {
            sqlDB
                .query(`DELETE FROM ${table} WHERE id = ${id};`,
                    function (err, results) {
                        if (err) {
                            return res.status(422).send(err);
                        } else {
                            return res.status(200).json(results);
                        }
                    })
        }
    },
    updateUser: function (req, res) {
        // expecting the column name and value to be updated
        const update = req.body;
        let id = req.params.id;
        let query = `UPDATE ${table} SET`;
        let hasEmail = false;
        let email = update.email;
        for (const column in update) {
            if ((update[column] !== "null" || update[column] !== null) && column !== "user_password") {
                // prevent injection and add column/value to query string
                if (column === "last_visit" || column === "last_pwa_prompt") {
                    query += ` ${column} = NOW(), `;
                } else {
                    query += ` ${column} = ${sqlDB.escape(update[column])}, `;
                }
            } else if (column === "email") {
                // prevent injection
                if (update[column].indexOf("$") > -1) {
                    return res.status(406).send("Invalid value");
                } else {
                    hasEmail = true;
                }
            }
        }
        let checkIfEmailExists = function () {
            return new Promise((resolve, reject) => {
                User
                    .find({ email: email })
                    .then(response => {
                        if (response.length > 0) {
                            reject(new Error("Email already in use"));
                        } else {
                            resolve();
                        }
                    })
                    .catch(err => console.log(err));
            });
        }

        let updateUserSQL = function () {
            // remove last comma and space from query string
            query = query.substring(0, query.length - 2);
            // hash the user password update
            if (update["user_password"]) {
                corbato(update["user_password"])
                    .then(hash => {
                        query += `ET user_password = ${sqlDB.escape(hash)}`;
                        query += ` WHERE id = ${sqlDB.escape(id)};`;
                        // all fields can be updated in sql
                        sqlDB
                            .query(query,
                                function (err, results) {
                                    if (err) {
                                        return res.status(500).send(err);
                                    } else {
                                        updateMongo();
                                    }
                                });
                    });
            } else {
                query += ` WHERE id = ${sqlDB.escape(id)};`;
                // all fields can be updated in sql
                sqlDB
                    .query(query,
                        function (err, results) {
                            if (err) {
                                return res.status(500).send(err);
                            } else {
                                updateMongo();
                            }
                        });
            }
        }
        let updateMongo = function () {
            // only email can be updated in mongo
            if (hasEmail) {
                User
                    .findOneAndUpdate({ _id: id }, { $set: { email: update.email } })
                    .then(() => {
                        return res.status(200).json("success")
                    })
                    .catch(err => res.status(422).json(err));
            } else {
                return res.status(200).json("success");
            }
        }
        if (hasEmail) {
            checkIfEmailExists()
                .then(() => {
                    updateUserSQL();
                })
                .catch(err => {
                    return res.status(409).send(err);
                });
        } else {
            updateUserSQL();
        }
    },
    getUserByEmail: function (req, res) {
        // prevent injectsions
        const userEmail = sqlDB.escape(req.body.email);
        const ip = sqlDB.escape(req.body.ip);
        const userCurrTime = parseInt(
            sqlDB
                .escape(req.body.time.split(" ")[4])
                .split(":")[0]
                .split("'")[1]
        );
        // password does not go into db and is just compared to what is stored
        const password = req.body.password;
        // if the user is already saved to the session, automatically send the complete user
        if (req.session.user) {
            sendCompleteUser();
        } else {
            sqlDB.query(`SELECT * FROM ${table} WHERE email = ${userEmail};`,
                function (err, results) {
                    if (err) {
                        return res.status(500).send(err);
                    } else {
                        if (results.length > 0) {
                            bcrypt.compare(password, results[0].user_password)
                                .then(
                                    match => {
                                        if (match) {
                                            const token = `'${crypto.randomBytes(64).toString('hex')}'`;
                                            // reset user auth token, set last visit to current date, update ip address
                                            sqlDB.query(`UPDATE ${table} SET user_auth = ${token}, last_visit = NOW(), ip_address = ${ip} WHERE id = '${results[0].id}';`,
                                                function (err, tokenUpdate) {
                                                    if (err) {
                                                        return res.status(502).send(err);
                                                    } else if (tokenUpdate.affectedRows == 1) {
                                                        sendCompleteUser();
                                                    }
                                                }
                                            )
                                        } else {
                                            return res.status(404).send("Password does not match");
                                        }
                                    }
                                )
                                .catch(err => res.status(500).send(err));
                        } else {
                            return res.status(404).send("Account not found");
                        }
                    }
                });
        }
        function checkPWA(userData) {
            const isValidTime = userCurrTime >= 12 && userCurrTime < 19;
            const lastPromptDiff = parseInt(userData[0].last_pwa_prompt_diff.split(":")[0]);
            // if the user is not using the pwa and 
            // it has been greater than 60 days since they were last prompted
            // and the user's current time is between noon and 6pm 
            if (!userData[0].using_PWA && lastPromptDiff > 5 && isValidTime) {
                // insert new notification
                let pwaNotificationQuery = `INSERT INTO ${notificationsTable}(content, date_added, user_id) VALUES("Save G-List to your home page for better performance!", NOW(), '${userData[0].id}');`;
                sqlDB.query(pwaNotificationQuery,
                    function (err) {
                        if (err) throw err;
                    });
                let userUpdateQuery = `UPDATE ${table} SET last_pwa_prompt = NOW() WHERE id = '${userData[0].id}';`;
                // update last prompt column to current time
                sqlDB.query(userUpdateQuery,
                    function (err) {
                        if (err) throw err;
                    });
            }
        }
        function sendCompleteUser() {
            // only select certain columns, hashed password will not be used by the front end
            const columns = "id, first_name, last_name, email, last_visit, phone, joined, user_auth, using_PWA, TIMEDIFF(NOW(), last_pwa_prompt) AS last_pwa_prompt_diff";
            sqlDB
                .query(`SELECT ${columns} FROM ${table} WHERE email = ${userEmail};`,
                    function (err, results) {
                        if (err) {
                            return res.status(500).send(err);
                        } else {
                            // set user info to session object
                            req.session.user = {
                                id: results[0].id,
                                email: results[0].email,
                                user_auth: results[0].user_auth
                            };
                            checkPWA(results);
                            return res.status(200).json(results);
                        }
                    });
        }
    },
    verifyUser: function (req, res) {
        const token = sqlDB.escape(req.params.token);
        const ip = req.params.ip;
        console.log("--------")
        console.log("--------")
        console.log(req.session.user);
        console.log("--------")
        console.log("--------")
        sqlDB
            .query(`CALL verify_user(${token});`,
                function (err, results) {
                    if (err) {
                        return res.status(404).send(err);
                    } else {
                        if (results && results[0].length > 0) {
                            if (results[0][0].ip_address === ip) {
                                sqlDB
                                    .query(`UPDATE ${table} SET last_visit = NOW() WHERE id = '${results[0][0].id}';`,
                                        function (err) {
                                            if (err) {
                                                return res.status(500).send(err);
                                            } else {
                                                // don't return IP address in results
                                                // this will rely on the IP address secured from API
                                                const data = [{
                                                    first_name: results[0][0].first_name,
                                                    last_name: results[0][0].last_name,
                                                    last_visit: results[0][0].last_visit,
                                                    email: results[0][0].email,
                                                    joined: results[0][0].joined,
                                                    time_difference: results[0][0].time_difference,
                                                    user_auth: results[0][0].user_auth,
                                                    id: results[0][0].id,
                                                    using_PWA: results[0][0].using_PWA,
                                                    phone: results[0][0].phone
                                                }]
                                                req.session.user = {
                                                    id: results[0][0].id,
                                                    email: results[0][0].email,
                                                    user_auth: token
                                                };
                                                return res.status(200).json(data);
                                            }
                                        })
                            } else {
                                return res.status(401).send("Different IP address");
                            }
                        } else {
                            return res.status(404).send("No user found");
                        }
                    }
                });
    },
    checkEmailExists: function (req, res) {
        const email = req.params.id;
        // prevent injections
        if (email.indexOf("$") > -1 || !isEmail(email)) {
            return res.status(406).send("Invalid email");
        } else {
            // check if email already exists - mongo
            User
                .find({ email })
                .then(response => {
                    if (response.length > 0) {
                        return res.status(400).send("Email already in use");
                    } else {
                        return res.status(200).send("Email is available");
                    }
                })
                .catch(err => console.log(err));
        }
    },
    logout: function (req, res) {
        req.session.destroy(err => {
            if (err) throw err;
            else {
                return res.status(200).send("logged out");
            }
        });
    }
}