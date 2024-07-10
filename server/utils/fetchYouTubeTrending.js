const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

const fetchShorts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics,topicDetails',
        chart: 'mostPopular',
        maxResults: 10,
        videoCategoryId: '22',
        videoDuration: 'short',
        key: API_KEY,
      },
    });

    return response.data.items
      .filter(item => {
        const duration = item.contentDetails.duration;
        const match = duration.match(/PT(\d+)M(\d+)S/);
        const minutes = match ? parseInt(match[1], 10) : 0;
        const seconds = match ? parseInt(match[2], 10) : 0;
        return minutes < 1 && seconds <= 59;
      })
      .map(item => ({
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
        channelTitle: item.snippet.channelTitle,
        tags: item.snippet.tags || [],
        publishedAt: item.snippet.publishedAt,
        topicCategories: item.topicDetails ? item.topicDetails.topicCategories : [],
      }))
      .sort((a, b) => {
        // Sorting logic to prioritize videos
        const engagementRateA = (parseInt(a.likeCount) + parseInt(a.commentCount)) / parseInt(a.viewCount);
        const engagementRateB = (parseInt(b.likeCount) + parseInt(b.commentCount)) / parseInt(b.viewCount);
        return engagementRateB - engagementRateA;
      });
  } catch (error) {
    console.error('Error fetching YouTube shorts:', error);
    throw error;
  }
};

module.exports = fetchShorts;
