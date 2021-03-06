const router = require("express").Router();
const friendsController = require("../controllers/friendsController");

// Accept a friend request
router.post("/:id", friendsController.acceptFriendRequest);

// Send a friend request
router.put("/:username", friendsController.requestFriend);

module.exports = router;
