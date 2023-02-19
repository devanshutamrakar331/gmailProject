const mongoose = require("mongoose");

const mailSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  recieveMail: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
  mailtext: String,
});
module.exports = mongoose.model("mails", mailSchema);
