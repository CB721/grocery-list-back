const router = require("express").Router();
const controller = require("../../controllers/textCodesController");

router
    .route("/request")
    .post(controller.createReset);

module.exports = router;