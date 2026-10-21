const mongoose = require('mongoose');

const childProfileSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  alias: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 3, max: 18 },
  asdSeverityLevel: { type: Number, enum: [1, 2, 3], default: 1 },
  verbalAbility: {
    type: String,
    enum: ['non-verbal', 'limited', 'verbal'],
    default: 'limited',
  },
  dominantHand: { type: String, enum: ['left', 'right', 'unknown'], default: 'unknown' },
  sensoryProfile: {
    soundSensitive: { type: Boolean, default: false },
    lightSensitive: { type: Boolean, default: false },
    preferredRewardType: { type: String, enum: ['visual', 'audio', 'both'], default: 'visual' },
  },
  consentRecorded: { type: Boolean, default: false, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ChildProfile', childProfileSchema);
