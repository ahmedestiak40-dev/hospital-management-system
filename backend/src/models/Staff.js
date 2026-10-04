const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffId: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  designation: {
    type: String,
    required: true
  },
  qualification: String,
  experience: Number,
  shift: {
    type: String,
    enum: ['morning', 'evening', 'night', 'general'],
    default: 'general'
  },
  salary: Number,
  joiningDate: {
    type: Date,
    default: Date.now
  },
  responsibilities: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Staff', staffSchema);