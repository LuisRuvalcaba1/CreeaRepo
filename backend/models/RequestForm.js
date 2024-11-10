// models/RequestForm.js

const mongoose = require('mongoose');

const RequestFormSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RequestForm', RequestFormSchema);
