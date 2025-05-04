// CIFAMobileApp/src/hooks/useNews.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  getNewsArticles, 
  getFeaturedNews,
  getNewsByCategory,
  getNewsById,
  searchNews,
  NewsArticle
} from '../services/firebase/news';

interface NewsState {
  loading: boolean;
  error: string | null;
  articles: NewsArticle[];
  featuredArticles: NewsArticle[];
  currentArticle: NewsArticle | null;
}

export const useNews = () => {
  const [state, setState] = useState<NewsState>({
    loading: false,
    error: null,
    articles: [],
    featuredArticles: [],
    currentArticle: null
  });

  const fetchNews = useCallback(async (category?: string, limit: number = 10) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const articles = await getNewsArticles(category, undefined, limit);
      setState(prev => ({ ...prev, articles, loading: false }));
      return articles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  const fetchFeaturedNews = useCallback(async (limit: number = 5) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const featuredArticles = await getFeaturedNews(limit);
      setState(prev => ({ ...prev, featuredArticles, loading: false }));
      return featuredArticles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured news';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  const fetchNewsByCategory = useCallback(async (category: string, limit: number = 10) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const articles = await getNewsByCategory(category, limit);
      setState(prev => ({ ...prev, articles, loading: false }));
      return articles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news by category';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  const fetchNewsById = useCallback(async (newsId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const article = await getNewsById(newsId);
      setState(prev => ({ ...prev, currentArticle: article, loading: false }));
      return article;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news article';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  const searchNewsArticles = useCallback(async (keyword: string, limit: number = 10) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const articles = await searchNews(keyword, limit);
      setState(prev => ({ ...prev, articles, loading: false }));
      return articles;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search news';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Load featured news on initial render
  useEffect(() => {
    fetchFeaturedNews();
  }, [fetchFeaturedNews]);

  return {
    ...state,
    fetchNews,
    fetchFeaturedNews,
    fetchNewsByCategory,
    fetchNewsById,
    searchNewsArticles
  };
};

export default useNews;