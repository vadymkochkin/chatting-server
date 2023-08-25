var express = require('express');
var bcrypt = require('bcryptjs');
var fs = require('fs');
var md5 = require('md5');
const config = require('../config.json');

var router = express.Router();

const db = require('../_helper/db');
const Message = db.Message;

router.post('/uploadfiles', uploadFile);
router.post('/makepic', makePicture);
router.get('/', getMessage);
router.get('/findcontact', findContact);
router.post('/', saveContact);
router.put('/', updateContact);
router.delete('/', deleteMessage);

async function getMessage(req, res, next) {
	if(!req.query.id) {
		res.json(await Message.find({}));
	} else {
		var idary = req.query.id.split('_');
		const messages = await Message.find({$or: [{toUsername: idary[1], fromUsername: idary[0]}, {toUsername: idary[0], fromUsername: idary[1]}]});
		Message.update(
			  {$or: [{toUsername: idary[1], fromUsername: idary[0]}, {toUsername: idary[0], fromUsername: idary[1]}]},  
			  {
			    $set: {
			      "status": 1
			    }
			  },
			  {
			    multi: true
			  }
			);
		res.json(messages);
	}
}

async function saveContact(req, res, next) {
	var contactInfo = req.body;
	if(contactInfo.user_id == contactInfo.contact_id) {
		res.json({status: 200, message: 'success'});
	} else {
		const contact = new Contact(contactInfo);

		await contact.save();
	}

	res.json({status: 200, message: 'success'});
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

async function deleteMessage(req, res, next) {
	const message = await Message.findById(req.query.id);

	if(!message) {
		throw "Can not found contact!";
	}

	await message.remove();

	res.json({status: 200, message: 'success'});
}


async function loginContact(req, res, next) {
	var contactInfo = req.body;

	const contact = await Contact.findOne({email: contactInfo.email});
	if(!contact) {
		res.json({status: 201, message: 'notcontactexist'});
	} else {
		var pwd = md5(contactInfo.password + '_' + config.secretKey);
		if(pwd == contact.user_pwd) {
			res.json({status: 200, message: 'success', data: user});
		} else {
			res.json({status: 201, message: 'wrongpwd'});
		}
	}
}

async function findContact(req, res, next) {
	if(!req.query.key) {
		res.json({});
	}

	var user = await User.find({"$or": [{"email": {'$regex': req.query.key}}, {"name": {'$regex': req.query.key}}]}).select('-user_pwd');

	res.json(user);
}

async function uploadFile(req, res, next) {
	if (Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "fileinfo") is used to retrieve the uploaded file
    let fileinfo = req.files.file;

    var dateObj = new Date();
    // Use the mv() method to place the file somewhere on your server
    var filenameary = fileinfo.name.split('.');
    var fileext = filenameary[filenameary.length - 1];
    var fileid = md5(fileinfo.name) + "_" + dateObj.getTime() + '.' + fileext;

    fileinfo.mv(__dirname + '/../public/uploaded/messages/' + fileid, function(err) {
        if (err)
          return res.status(500).send(err);

        res.json({status: 200, message: 'File uploaded!', fileId: fileid });
    });
}

async function makePicture(req, res, next) {
	
	var base64Data = req.body.base64.replace(/^data:image\/png;base64,/, "");

	var uploaddir = __dirname + '/../public/uploaded/messages';

	if (!fs.existsSync(uploaddir)){
      	fs.mkdirSync(uploaddir);
  	}

	var fileid = Date.now() + '.png';

	fs.writeFile(uploaddir + '/' + fileid, base64Data, 'base64', function(err) {
	  res.json({url: fileid})
	});
}

module.exports = router;
