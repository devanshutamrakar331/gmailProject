var express = require("express");
var router = express.Router();
const passport = require("passport");
const usermodel = require("./users");
const localStrategy = require("passport-local");
const mails = require("./mails");
const flash = require("connect-flash");
const multer = require("multer");
const { v4 } = require("uuid");
passport.use(new localStrategy(usermodel.authenticate()));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const fn = v4() + file.originalname;
    cb(null, fn);
  },
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Middleware isLoggedIn */
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated) {
    return next();
  }
  res.redirect("/login");
};
/* GET profile page. */
router.get("/profile", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  const mails = await usermodel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "recievedMails",
      populate: {
        path: "userId",
      },
    });
  res.render("profile", { user, mails: mails.recievedMails });
});

/* GET Login page. */
router.get("/login", (req, res) => {
  res.render("login");
});
/* Post Register */
router.post("/register", (req, res) => {
  const newUser = new usermodel({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    mobile: req.body.mobile,
  });

  usermodel
    .register(newUser, req.body.password)
    .then((registereduser) => {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/profile");
      });
    })
    .catch((err) => console.log(err));
});

/* Post Login */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  () => {}
);

/* Get Logout */
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

router.post("/compose", isLoggedIn, async (req, res) => {
  const loggedInUser = await usermodel.findOne({
    username: req.session.passport.user,
  });
  const newmail = await mails.create({
    userId: loggedInUser._id,
    mailtext: req.body.mailtext,
    recieveMail: req.body.recieveMail,
  });

  await loggedInUser.sentMails.push(newmail._id);
  loggedInUser.save();

  const reciever = await usermodel.findOne({ email: req.body.recieveMail });
  await reciever.recievedMails.push(newmail._id);
  reciever.save();

  res.redirect("/profile");
});

router.get("/profile/mail/sent", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  const mails = await usermodel
    .findOne({ username: req.session.passport.user })
    .populate({
      path: "sentMails",
    });

  res.render("sentmails", { user, mails: mails.sentMails });
});
router.get("/delete/mail/:id", (req, res) => {
  mails.findByIdAndDelete({ _id: req.params.id }).then((deletedmail) => {
    req.flash("success", "Kommentar wurde gelöscht!");
    res.redirect("back");
  });
});

router.get("/mail/read/:id", isLoggedIn, async (req, res) => {
  const user = await usermodel.findOne({ username: req.session.passport.user });

  const mail = await mails.findOne({ _id: req.params.id }).populate("userId");
  mail.read = true;
  await mail.save();
  res.render("readmail", { user, mail });
});

router.post("/photo", upload.single("image"), async function (req, res, next) {
  const user = await usermodel.findOne({ username: req.session.passport.user });
  user.profilePic = `${req.file.filename}`;
  await user.save();
  console.log(user.profilePic);
  res.redirect("/profile");
});
module.exports = router;
