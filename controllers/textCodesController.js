const sqlDB = require("../sql_connection");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { corbato } = require("../utilities/hashPass");
const textTable = "text_codes";
const userTable = "users";
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'invite.glist@gmail.com',
        pass: process.env.NODEMAILER
    }
});

module.exports = {
    createReset: function (req, res) {
        let { user_id, number } = req.body;
        // check that the number is valid
        if (number.length < 10 || number.length > 15) {
            return res.status(400).send("Invalid phone number.  Must be 10 numbers.");
        }
        for (let i = 0; i < number.length; i++) {
            if (isNaN(parseInt(number[i]))) {
                return res.status(400).send("Invalid phone number.  Must be 10 numbers.");
            }
        }
        // prevent injections
        user_id = sqlDB.escape(user_id);
        number = sqlDB.escape(number);
        const carrier = sqlDB.escape(req.body.carrier);
        // check for valid carrier
        if (carrier !== "'att'" && carrier !== "'sprint'" && carrier !== "'tmobile'" && carrier !== "'verizon'") {
            return res.status(400).send("Invalid phone carrier");
        }
        // check if user exists with the corresponding number
        const checkUserQuery = `SELECT id, phone FROM ${userTable} WHERE id = ${user_id} AND phone = ${number};`;
        sqlDB.query(checkUserQuery,
            function (err, results) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    checkRecentTextCode(results[0].id, results[0].phone);
                }
            });
        function checkRecentTextCode(id, phone) {
            sqlDB
                .query(`SELECT TIMEDIFF(NOW(), date_requested) AS time_since_last_request FROM ${textTable} WHERE user_id = '${id}' ORDER BY date_requested DESC;`,
                    function (err, results) {
                        if (err) {
                            return res.status(500).send(err);
                        } else if (results.length) {
                            // if there are any text codes from this user
                            // get the time difference since the last request
                            const timeDifference = parseInt(results[0].time_since_last_request.split(":")[1]);
                            // only send a code if it has been at least 15 minutes since their last request
                            if (timeDifference < 3) {
                                return res.status(400).send("A code has already been sent to the number on file.");
                            }
                        }
                        // create code
                        const newCode = crypto.randomBytes(3).toString('hex');
                        // hash password and move on to sending code
                        corbato(newCode)
                            .then(hashedCode => {
                                // send user id, and hashed code for inserting into db
                                // send phone and unhashed code for sending to client
                                sendTextCode(id, phone, newCode, hashedCode);
                            });
                    });
        }
        function sendTextCode(id, phone, code, hashedCode) {
            let address = phone + "@";
            // add appropriate gateway
            switch (carrier) {
                case "'att'":
                    address += "txt.att.net";
                    break;
                case "'sprint'":
                    address += "messaging.sprintpcs.com";
                    break;
                case "'tmobile'":
                    address += "tmomail.net";
                    break;
                case "'verizon'":
                    address += "vtext.com";
                    break;
                default:
                    return;
            }
            const mailOptions = {
                from: 'invite.glist@gmail.com', // sender address
                to: address, // list of receivers
                subject: `G-List`, // Subject line
                html: `G-List password reset code: ${code}.  Valid for 15 minutes.`,
                priority: "normal"
            };
            // send message to phone
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    return res.status(406).send(err.response);
                else
                    if (info.rejected.length > 0) {
                        return res.status(403).send("phone number blocked");
                    } else {
                        res.status(200).send("Password reset sent to your mobile device");
                        addToTextCodeTable(id, phone, hashedCode);
                    }
            });
        }
        function addToTextCodeTable(id, phone, hashedCode) {
            // the id here is the user's id
            // the phone here is the user's phone number
            // the code here is the hashed version of the code that was sent to the user
            let textQuery = `INSERT INTO ${textTable}(number, code, date_requested, user_id) `;
            textQuery += `VALUES('${phone}', '${hashedCode}', NOW(), '${id}');`;
            sqlDB.query(textQuery,
                function (err) {
                    if (err) throw err;
                });
        }
    },
    validateCode: function (req, res) {
        // prevent injections
        const id = sqlDB.escape(req.body.id);
        sqlDB
            .query(`SELECT TIMEDIFF(NOW(), date_requested) AS time_since_last_request, code FROM ${textTable} WHERE user_id = ${id} ORDER BY date_requested DESC;`,
                function (err, results) {
                    if (err) {
                        return res.status(500).json(err);
                    } else if (results.length) {
                        const timeDifference = parseInt(results[0].time_since_last_request.split(":")[1]);
                        if (timeDifference <= 60) {
                            bcrypt.compare(req.body.code, results[0].code)
                                .then(match => {
                                    if (match) {
                                        // if it does match
                                        return res.status(200).send("success");
                                    } else {
                                        // if it doesn't match, send error
                                        return res.status(400).send("Incorrect code");
                                    }
                                })
                                .catch(err => {
                                    return res.status(500).send(err);
                                });
                        } else {
                            return res.status(429).send("That code has expired");
                        }
                    } else {
                        return res.status(404).send("No text code found");
                    }
                });
    }
}