const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  engname: { type: String, default: "" },
  nation: { type: String, default: "" },
  life: { type: String, default: "" },
  price: { type: String, default: "" },
  pic: { type: String, default: "" },
  sticky: { type: Number, default: 0 },
  shout: { type: Number, default: 0 },
  friendly: { type: Number, default: 0 },
  lint: { type: Number, default: 0 },
  beauty: { type: Number, default: 0 },
  odour: { type: Number, default: 0 },
  saliva: { type: Number, default: 0 },
  active: { type: Number, default: 0 },
  message: { type: String, default: "" },
  feed: { type: String, default: "" },
  relative: { type: String, default: "" },
  pick: { type: String, default: "" }
}, { 
  timestamps: true,
  collection: 'pets'
});

module.exports = mongoose.model('Pet', petSchema);
