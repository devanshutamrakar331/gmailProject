const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/gmailapp");
const plm = require("passport-local-mongoose");
const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  username: {
    type: String,
  },
  mobile: {
    type: Number,
  },

  sentMails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mails",
    },
  ],
  recievedMails: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "mails",
    },
  ],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  profilePic: {
    type: String,
    default: "def.jpg",
  },
});

userSchema.plugin(plm);

module.exports = mongoose.model("user", userSchema);
