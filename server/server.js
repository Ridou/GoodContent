const express = require('express');
const cors = require('cors');
const fetchYouTubeTrending = require('./utils/fetchYouTubeTrending');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/fetch-trending', async (req, res) => {
  try {
    const trendingVideos = await fetchYouTubeTrending();
    res.json(trendingVideos);
  } catch (error) {
    console.error('Error in /fetch-trending endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
