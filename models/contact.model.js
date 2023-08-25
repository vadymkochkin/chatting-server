const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
  user_id : { type: String }, 
  contact_id : { type: String }, 
  created: { type: Date, default: Date.now },
  lastmessage: { type: String },
  status: { type: Number, default: 0 }
}, { _id: true });

schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Contact', schema);