const bcrypt = require('bcrypt');
var users = require('../models/users');
const passport = require('passport');
var nodemailer = require('nodemailer');
const configMail = require('../config/mail');

isValidUserName = (username) => {
  var is_valid = (username.length === 6 && username[0].match(/^[a-z]+$/i));
  for (var i = 1; i < 6; i++) {
    is_valid = is_valid && (username[i].match(/^[0-9]+$/i));
  }
  return is_valid;
}

sendVerificationEmail = async (name, roll_no, link) => {
  var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: configMail
  });

  var mailOptions = {
    from: configMail.user,
    to: roll_no + '@students.iitmandi.ac.in',
    subject: 'AlgoHack IIT Mandi Email verification',
    html: `
Hi ${name},<br><br>

  <emsp>Click <a href="https://algohack-iitmandi.herokuapp.com/${link}">HERE</a> to verify your email for AlgoHack.<br>
  For any queries, reach out to the Algohack team.<br><br>

Regards,<br>
`
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

exports.register = async (req, res) => {
  var data = req.body;
  var msg = '';
  data.username = data.username.toLowerCase();
  if (data.name.length === 0) {
    msg = "Name cannot be empty";
  }
  else if (!isValidUserName(data.username)) {
    msg = "Invalid roll number";
  }
  else if (data.password.length === 0) {
    msg = "Password cannot be empty";
  }
  if (msg.length !== 0) {
    return res.send(msg);
  } else {

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const token = await bcrypt.hash(data.name + data.username, 5);
    const uri_encoded_token = encodeURIComponent(token);
    const uri_encoded_verificationUri = "verify&rollno=" + data.username + "&token=" + uri_encoded_token;
    const verificationUri = "verify&rollno=" + data.username + "&token=" + token;
    const user = new users({
      name: data.name,
      username: data.username,
      password: hashedPassword,
      isVerified: false,
      verificationUri: verificationUri,
      registeredAt: null,
      totalScore: 0,
      totalPenalty: 0,
      quesAttempts: [],
      isAdmin: false
    });
    await users.countDocuments({ username: data.username })
      .then(async (cnt) => {
        if (cnt === 0) {
          user.save();
          await sendVerificationEmail(data.name, data.username, uri_encoded_verificationUri);
          return res.send(`Verification email has been sent to ${data.username}@students.iitmandi.ac.in`);
        } else {
          return res.send("User already exists");
        }
      })
      .catch((err) => {
        return res.send(err);
      })
  }
}

exports.verify = async (req, res) => {
  const verificationUri = req.params.verificationUri;
  users.findOne({ verificationUri })
    .then(async (user) => {
      if (user === null) {
        return res.send('Something went wrong :( Could not verify the email.');
      } else {
        user.isVerified = true;
        user.registeredAt = new Date();
        await users.findOneAndUpdate({ verificationUri }, user, function (err, doc) {
          if (err) return res.send(500, { error: err });
          return res.send('success');
        });
      }
    })
}

exports.login = async (req, res, next) => {
  req.body.username = req.body.username.toLowerCase();
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send([user, 'Cannot log in', info]);
    }
    req.login(user, err => {
      res.send('Logged in');
    });
  })(req, res, next);
}

exports.logout = async (req, res) => {
  req.logout();
  return res.send('Logged out');
}

exports.userData = async (req, res) => {
  await users.findOne({ _id: req.session.passport.user })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
    })
}
