const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  id : { type: String }, 
  name : { type: String }, 
  email : { type: String }, 
  access_key: { type: String }, 
  request_number :{ type: Number, default: 1000 },  // user Allocated API call  number 
  requests_used : { type: Number, default: 0}, 
  vurtual_number : { type: String }, 
  user_pwd : { type: String }, 
  avatar_url : { type: String }, 
  gender : { type: String, default: 'Man' }, 
  address : { type: String }, 
  birthday : { type: Date, default: Date.now }, 
  created : { type: Date, default: Date.now }, 
  lastmessage : { type: String }, 
  status : { type: Number, default: 0 }
}, { _id: true });

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('User', schema);