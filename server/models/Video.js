const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  translatedText: String,
  voiceoverText: String,
});

module.exports = mongoose.model('Video', videoSchema);
