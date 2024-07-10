const express = require('express');
const router = express.Router();
const Video = require('../models/Video');

router.get('/', async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

router.post('/', async (req, res) => {
  const newVideo = new Video(req.body);
  await newVideo.save();
  res.json(newVideo);
});

module.exports = router;
