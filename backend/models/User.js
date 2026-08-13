// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  childName: { type: String, required: true },
  childAge: { type: Number, required: true },
  childGender: { type: String, default: '' },  // Male, Female, etc.
  language: { type: String, default: 'en' },
  theme: { type: String, default: 'light' },
  notifications: {
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sound: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true }
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);