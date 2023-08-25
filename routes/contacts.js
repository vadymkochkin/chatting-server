var express = require('express');
var bcrypt = require('bcryptjs');
var md5 = require('md5');
const config = require('../config.json');

var router = express.Router();

const db = require('../_helper/db');
const Contact = db.Contact;
const User = db.User;

router.put('/accept', acceptContact);
router.put('/decline', declineContact);
router.get('/', getContact);
router.get('/findcontact', findContact);
router.post('/', saveContact);
router.put('/', updateContact);

async function getContact(req, res, next) {
	if(!req.query.id) {
		res.json(await Contact.find({}));
	} else {
		const contact = await Contact.find({user_id: req.query.id}).select('contact_id status');
		var con_id = [];
		var sary = [];
		for(var i in contact) {
			con_id[i] = contact[i].contact_id;
			sary[i] = contact[i].status;
		}
		const users = await User.find({ _id: {$in: con_id } });
		var result = [];
		for (var i in users) {

			var user = {};
			user.id = users[i]._id;
			user.status = users[i].status;
			user.avatar_url = users[i].avatar_url ? users[i].avatar_url : 'assets/images/users/user.png';
			user.name = users[i].name;
			user.lastmessage = users[i].lastmessage;

			user.state = sary[i];
			result.push(user);
		}
		res.json(result);
	}
}

async function saveContact(req, res, next) {
	var contactInfo = req.body;
	if(contactInfo.user_id == contactInfo.contact_id) {
		res.json({status: 200, message: 'success'});
	} else {
		
		contactInfo.status = 1;
		var contact = await Contact.findOne({ user_id: contactInfo.user_id, contact_id: contactInfo.contact_id });

		if(!contact)
			contact = new Contact(contactInfo);

		Object.assign(contact, contactInfo);

		await contact.save();

		var from = contactInfo.user_id;
		contactInfo.user_id = contactInfo.contact_id;
		contactInfo.contact_id = from;
		contactInfo.status = 0;

		var newcontact = await Contact.findOne({ user_id: contactInfo.user_id, contact_id: contactInfo.contact_id });

		if(!newcontact)
			newcontact = new Contact(contactInfo);

		Object.assign(newcontact, contactInfo);

		await newcontact.save(); 
	}

	userinfo = await User.findById(contactInfo.contact_id);

	res.json({status: 200, message: 'success', data: userinfo});
}

async function updateContact(req, res, next) {
	var contactInfo = req.body;

	const contact = await Contact.findById(req.body._id);
	if(!contact) {
		throw "Can not found contact!";
	}
	Object.assign(contact, contactInfo);

	await contact.save();

	res.json({status: 200, message: 'success'});
}


async function findContact(req, res, next) {
	if(!req.query.key) {
		res.json({});
	}

	var user = await User.find({"$or": [{"email": {'$regex': req.query.key}}, {"name": {'$regex': req.query.key}}]}).select('-user_pwd');

	res.json(user);
}

async function acceptContact(req, res, next) {
	var contactInfo = req.body;

	const contact = await Contact.findOne({user_id: contactInfo.userId, contact_id: contactInfo.contact_id});
	if(!contact) {
		throw "Can not found contact!";
	}
	contact.status = 1;

	await contact.save();

	res.json({status: 200, message: 'success'});
}

async function declineContact(req, res, next) {
	var contactInfo = req.body;

	const contact = await Contact.findOne({user_id: contactInfo.userId, contact_id: contactInfo.contact_id});
	if(!contact) {
		throw "Can not found contact!";
	}
	contact.remove();

	res.json({status: 200, message: 'success'});
}

module.exports = router;
