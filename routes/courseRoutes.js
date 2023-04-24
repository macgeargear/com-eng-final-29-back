const express = require("express");
const assignmentController = require("../controller/courseController");

const router = express.Router();

router.get("/", assignmentController.getItems);
router.get("/:code", assignmentController.getItemById);
// router.get("/members", itemsController.getGroupMembers);
router.post("/", assignmentController.addItem);
router.put("/:code/:new_val", assignmentController.updateItem);
router.delete("/:code", assignmentController.deleteItem);

module.exports = router;
