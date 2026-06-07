const mongoose = require('mongoose')

const ApplicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'],
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  nextFollowUp: { type: Date },
  notes: { type: String },
  jobUrl: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Application', ApplicationSchema)