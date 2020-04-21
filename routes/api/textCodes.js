const router = require("express").Router();
const controller = require("../../controllers/textCodesController");

router
    .route("/request")
    .post(controller.createReset);
router
    .route("/validate")
    .post(controller.validateCode);

module.exports = router;