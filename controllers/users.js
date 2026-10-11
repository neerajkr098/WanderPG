const User = require("../models/user.js");
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const role = req.body.role === "owner" ? "owner" : "student";
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "Could not create account. Try logging in or another email.");
      return res.redirect("/signup");
    }
    const newUser = new User({ email, username, role });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome to WanderPG, ${registeredUser.username}!`);
      const target = registeredUser.role === "owner" ? "/owner/listings" : "/colleges";
      res.redirect(target);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderPG!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
