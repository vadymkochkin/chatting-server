const config = require('../config.json');
const mongoose = require('mongoose');
var db = mongoose.connect(config.connectionString, { useNewUrlParser: true }, function(err, response) {
    if(err) { console.log(err); }
    else { console.log('Connected to ' + db, ' + ', response); }
});
// var db = mongoose.connect(config.connectionString);
mongoose.Promise = global.Promise;

module.exports = {
    User: require('../models/user.model'),
    Contact: require('../models/contact.model'),
    Message: require('../models/message.model')
};