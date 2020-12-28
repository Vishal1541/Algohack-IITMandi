var express = require("express");
var router = express.Router();
var auth = require("../controls/auth");

router.post('/register', auth.register);

router.post('/email-verify&:verificationUri', auth.verify);

router.post('/login', auth.login);

router.post('/logout', auth.logout);

router.get('/user-data', auth.userData);

module.exports = router;
