const axios = require('axios');
const CustomError = require('../utils/custom-error');


const BASE_URL = 'https://newsapi.org/v2/top-headlines';

async function fetchNews({ categories = [], language = 'en' }) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const categoryQuery = categories.length ? `&category=${categories.join(',')}` : '';

  try {
    const newsUrl = `${BASE_URL}?country=us${categoryQuery}&language=${language}&apiKey=${NEWS_API_KEY}`;
    console.log('[News API URL]', newsUrl);
    const response = await axios.get(newsUrl);
    
    if (response.data.status !== 'ok') {
      throw new CustomError('Failed to fetch news from external API', 503);
    }

    return response.data.articles;
  } catch (err) {
    console.error('[External News API Error]', err?.response?.data || err.message);
    throw new CustomError('News API call failed', 503);
  }
}

module.exports = {
  fetchNews,
};
