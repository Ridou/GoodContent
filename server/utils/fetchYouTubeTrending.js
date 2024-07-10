const axios = require('axios');
require('dotenv').config();

const API_KEYS = [
  process.env.API_KEY_1,
  process.env.API_KEY_2,
];
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const REGION_CODES = ['CA', 'GB', 'AU', 'IN', 'JP', 'MX', 'BR']; // Removed US, added Mexico and Brazil

let apiKeyIndex = 0;
let cachedVideos = [];
let cacheTimestamp = 0;

const getApiKey = () => API_KEYS[apiKeyIndex];

const switchApiKey = () => {
  apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length;
};

const fetchWithRetry = async (url, params) => {
  let attempts = API_KEYS.length;
  while (attempts > 0) {
    const key = getApiKey();
    try {
      const response = await axios.get(url, { params: { ...params, key } });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.warn(`API key quota exceeded or invalid key: ${key}`);
        switchApiKey();
      } else {
        throw error;
      }
    }
    attempts--;
  }
  throw new Error('All API keys have exceeded their quota or are invalid.');
};

const fetchShorts = async () => {
  try {
    const now = Date.now();
    const cacheDuration = 60 * 60 * 1000; // 1 hour

    if (cachedVideos.length > 0 && (now - cacheTimestamp) < cacheDuration) {
      return cachedVideos;
    }

    const allShorts = [];
    const seenVideos = new Set();

    for (const regionCode of REGION_CODES) {
      const searchResponse = await fetchWithRetry(`${BASE_URL}/search`, {
        part: 'snippet',
        maxResults: 50, // Increased maxResults to reduce the number of requests
        type: 'video',
        videoDuration: 'short',
        order: 'date',
        publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Fetch videos from the last 30 days
        regionCode: regionCode,
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');

      const videoResponse = await fetchWithRetry(`${BASE_URL}/videos`, {
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
      });

      const shorts = videoResponse.data.items
        .filter(item => {
          const duration = item.contentDetails.duration;
          const match = duration.match(/PT(\d+)M(\d+)S/);
          const minutes = match ? parseInt(match[1], 10) : 0;
          const seconds = match ? parseInt(match[2], 10) : 0;
          const isLive = item.snippet.liveBroadcastContent === 'live';
          return minutes === 0 && seconds <= 60 && !isLive;
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
          publishedAt: new Date(item.snippet.publishedAt),
          engagementScore: parseInt(item.statistics.viewCount, 10) + parseInt(item.statistics.likeCount, 10) + parseInt(item.statistics.commentCount, 10),
        }))
        .filter(item => {
          if (seenVideos.has(item.url)) {
            return false;
          }
          seenVideos.add(item.url);
          return true;
        });

      allShorts.push(...shorts);
    }

    cachedVideos = allShorts.sort((a, b) => {
      const now = new Date();
      const timeDiffA = (now - a.publishedAt) / (1000 * 60);
      const timeDiffB = (now - b.publishedAt) / (1000 * 60);
      const engagementRateA = a.engagementScore / timeDiffA;
      const engagementRateB = b.engagementScore / timeDiffB;
      return engagementRateB - engagementRateA;
    });

    cacheTimestamp = Date.now();
    return cachedVideos;

  } catch (error) {
    if (error.response) {
      console.error('Error fetching YouTube shorts:', error.response.data);
    } else {
      console.error('Error fetching YouTube shorts:', error.message);
    }
    throw error;
  }
};

module.exports = { fetchShorts };
