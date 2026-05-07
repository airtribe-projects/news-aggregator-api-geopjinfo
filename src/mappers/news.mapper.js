const mapExternalArticles = (articles = []) =>
  articles.map((article) => ({
    articleId: article.url,
    title: article.title,
    url: article.url,
    description: article.description,
    source: article.source?.name,
    image: article.urlToImage,
    publishedAt: article.publishedAt,
    author: article.author,
    content: article.content,
  }));

export {
  mapExternalArticles,
};
