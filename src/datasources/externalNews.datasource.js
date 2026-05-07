import newsApiClient from './newsApi.client.js';
import { DEFAULT_LANGUAGE, DEFAULT_COUNTRY } from '../constants/constants.js';

// NewsAPI /top-headlines only accepts one category per request.
// If the user has multiple categories we fire one request per category in
// parallel and merge the results, deduplicating by URL.
const fetchTopHeadlines = async (preferences = {}) => {
  const categories = preferences.categories?.length ? preferences.categories : [null];
  const country = preferences.country || DEFAULT_COUNTRY;
  const language = preferences.languages?.[0] || DEFAULT_LANGUAGE;

  const results = await Promise.all(
    categories.map((category) =>
      newsApiClient.fetchTopHeadlines({ category, country, language })
    )
  );

  // Flatten and deduplicate by article URL
  const seen = new Set();
  return results.flat().filter((article) => {
    if (!article.url || seen.has(article.url)) return false;
    seen.add(article.url);
    return true;
  });
};

// NewsAPI /everything accepts only a single language code.
const searchNews = async (query, preferences = {}) => {
  const language =
    preferences.languages?.[0] || DEFAULT_LANGUAGE;

  return newsApiClient.searchArticles({ q: query, language });
};

export default {
  fetchTopHeadlines,
  searchNews,
};
