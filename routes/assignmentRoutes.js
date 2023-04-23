const express = require("express");
const assignmentController = require("../controller/assignmentController");

const router = express.Router();

router.get("/", assignmentController.getItems);
// router.get("/members", itemsController.getGroupMembers);
router.post("/", assignmentController.addItem);
router.delete("/:item_id", assignmentController.deleteItem);

module.exports = router;
