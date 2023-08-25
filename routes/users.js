var express = require('express');
var bcrypt = require('bcryptjs');
var md5 = require('md5');
const config = require('../config.json');

var router = express.Router();

const db = require('../_helper/db');
const User = db.User;

router.post('/loginbytoken', loginUserByToken);
router.post('/login', loginUser);
router.get('/', getUser);
router.post('/', saveUser);
router.put('/', updateUser);

async function getUser(req, res, next) {
	if(!req.query.email) {
		return await User.find({});
	} else {
		const user = await User.findById(req.query.id);
		return user;
	}
}

async function saveUser(req, res, next) {
	var userInfo = req.body;

	const user = new User(userInfo);

	var key = bcrypt.hashSync(userInfo.email + '_' + (new Date().getTime()), 10);
	user.access_key = key.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');	

	var pwd = md5(userInfo.password + '_' + config.secretKey);

	user.user_pwd = pwd;

	await user.save();

	res.json({status: 200, message: 'success', data: user});
}

async function updateUser(req, res, next) {
	var userInfo = req.body;

	const user = await User.findById(req.body.userId);
	if(!user) {
		throw "Can not found user!";
	}
	if (!userInfo.user_pwd) {
		userInfo.user_pwd = user.user_pwd;
	}
	Object.assign(user, userInfo);

	await user.save();

	res.json({status: 200, message: 'success'});
}

async function loginUser(req, res, next) {
	var userInfo = req.body;

	const user = await User.findOne({email: userInfo.email});
	if(!user) {
		res.json({status: 201, message: 'notuserexist'});
	} else {
		var pwd = md5(userInfo.password + '_' + config.secretKey);
		if(pwd == user.user_pwd) {
			res.json({status: 200, message: 'success', data: user});
		} else {
			res.json({status: 201, message: 'wrongpwd'});
		}
	}
}

async function loginUserByToken(req, res, next) {
	var userInfo = req.body;

	const user = await User.findOne({access_key: userInfo.token});
	if(!user) {
		res.json({status: 201, message: 'notuserexist'});
	} else {
		res.json({status: 200, message: 'success', data: user});
	}
}

module.exports = router;
