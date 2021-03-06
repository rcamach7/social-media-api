const middleware = require("../assets/middleware");
const User = require("../models/User");

exports.sendMessage = [
  // Verify token exists - if so, pull and save user id in res.locals.userId for next middleware.
  middleware.verifyTokenAndStoreCredentials,
  async (req, res, next) => {
    try {
      // Create new message
      const message = {
        from: res.locals.userId,
        to: req.params.id,
        message: req.body.message,
        timestamp: new Date(),
      };

      // Update user with new message between this friend
      await User.updateOne(
        {
          _id: res.locals.userId,
          "friends.friend": req.params.id,
        },
        { $push: { "friends.$.messages": message } }
      );
      // Update friend with new message from user
      await User.updateOne(
        { _id: req.params.id, "friends.friend": res.locals.userId },
        { $push: { "friends.$.messages": message } }
      );

      // Save message and move on to next middleware
      res.locals.message = message;
      next();
    } catch (error) {
      return res
        .status(400)
        .json({ message: "Error sending new message", error });
    }
  },
  // Handle socket emits
  (req, res) => {
    // Sent emit for our client
    req.app
      .get("socketio")
      // This represents the room socket ID, which we generated and assigned manually when we created a new friend.
      .sockets.in(`${req.body._id}`)
      .emit("chat message", res.locals.message);

    // End response with new message
    return res.json({ message: res.locals.message });
  },
];
