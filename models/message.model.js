const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  key : { type: String }, 
  fromUsername : { type: String }, 
  toUsername : { type: String }, 
  data: { type: String }, 
  mob_message: { type: String }, 
  status :{ type: Number, default: 0 },  
  type :{ type: Number, default: 0 }, 
  messageType :{ type: Number, default: 0 }, 
  created : { type: Date, default: Date.now }
}, { _id: true });

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Message', schema);