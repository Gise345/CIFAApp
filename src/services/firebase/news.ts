// CIFAMobileApp/src/services/firebase/news.ts
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    getDoc, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    orderBy,
    limit,
    Timestamp 
  } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { firestore, storage } from './config';
  
  export interface NewsArticle {
    id: string;
    title: string;
    body: string;
    summary?: string;
    author: string;
    date: Timestamp;
    category: string;
    tags: string[];
    featured: boolean;
    mediaUrls: string[];
    thumbnailUrl?: string;
  }
  
  /**
   * Get all news articles with optional filtering and pagination
   */
  export const getNewsArticles = async (
    category?: string, 
    featured?: boolean, 
    limit_num: number = 10
  ): Promise<NewsArticle[]> => {
    try {
      const newsCollection = collection(firestore, 'news');
      let newsQuery;
      
      if (category && featured !== undefined) {
        newsQuery = query(
          newsCollection, 
          where('category', '==', category),
          where('featured', '==', featured),
          orderBy('date', 'desc'),
          limit(limit_num)
        );
      } else if (category) {
        newsQuery = query(
          newsCollection, 
          where('category', '==', category),
          orderBy('date', 'desc'),
          limit(limit_num)
        );
      } else if (featured !== undefined) {
        newsQuery = query(
          newsCollection, 
          where('featured', '==', featured),
          orderBy('date', 'desc'),
          limit(limit_num)
        );
      } else {
        newsQuery = query(
          newsCollection, 
          orderBy('date', 'desc'),
          limit(limit_num)
        );
      }
      
      const snapshot = await getDocs(newsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsArticle));
    } catch (error) {
      console.error('Error fetching news articles:', error);
      throw error;
    }
  };
  
  /**
   * Get featured news articles
   */
  export const getFeaturedNews = async (limit_num: number = 5): Promise<NewsArticle[]> => {
    return getNewsArticles(undefined, true, limit_num);
  };
  
  /**
   * Get news articles by category
   */
  export const getNewsByCategory = async (category: string, limit_num: number = 10): Promise<NewsArticle[]> => {
    return getNewsArticles(category, undefined, limit_num);
  };
  
  /**
   * Get a news article by ID
   */
  export const getNewsById = async (newsId: string): Promise<NewsArticle | null> => {
    try {
      const newsDoc = await getDoc(doc(firestore, 'news', newsId));
      
      if (!newsDoc.exists()) {
        return null;
      }
      
      return {
        id: newsDoc.id,
        ...newsDoc.data()
      } as NewsArticle;
    } catch (error) {
      console.error('Error fetching news article:', error);
      throw error;
    }
  };
  
  /**
   * Search news articles by keyword
   * Note: This is a simple implementation that searches titles only.
   * For more advanced search, consider using Algolia or Elasticsearch.
   */
  export const searchNews = async (keyword: string, limit_num: number = 10): Promise<NewsArticle[]> => {
    try {
      // For simple search, we get all articles and filter in memory
      // This is not efficient for large datasets
      const newsCollection = collection(firestore, 'news');
      const newsQuery = query(
        newsCollection, 
        orderBy('date', 'desc'),
        limit(100) // Fetch a larger set to search through
      );
      
      const snapshot = await getDocs(newsQuery);
      
      const articles = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NewsArticle));
      
      // Simple search through titles and bodies
      const lowercaseKeyword = keyword.toLowerCase();
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(lowercaseKeyword) || 
        article.body.toLowerCase().includes(lowercaseKeyword) ||
        (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowercaseKeyword)))
      );
      
      return filtered.slice(0, limit_num);
    } catch (error) {
      console.error('Error searching news articles:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Create a new news article
   */
  export const createNewsArticle = async (
    article: Omit<NewsArticle, 'id'>, 
    thumbnailFile?: Blob, 
    mediaFiles?: Blob[]
  ): Promise<string> => {
    try {
      let thumbnailUrl = article.thumbnailUrl;
      let mediaUrls = [...article.mediaUrls];
      
      // If a thumbnail file is provided, upload it to storage
      if (thumbnailFile) {
        const storageRef = ref(storage, `news-thumbnails/${Date.now()}-${article.title.replace(/\s+/g, '-').toLowerCase()}`);
        await uploadBytes(storageRef, thumbnailFile);
        thumbnailUrl = await getDownloadURL(storageRef);
      }
      
      // If media files are provided, upload them to storage
      if (mediaFiles && mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          const file = mediaFiles[i];
          const storageRef = ref(storage, `news-media/${Date.now()}-${i}-${article.title.replace(/\s+/g, '-').toLowerCase()}`);
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          mediaUrls.push(url);
        }
      }
      
      const articleData = {
        ...article,
        thumbnailUrl,
        mediaUrls,
        date: Timestamp.now(),
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(firestore, 'news'), articleData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating news article:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Update an existing news article
   */
  export const updateNewsArticle = async (
    newsId: string, 
    articleData: Partial<NewsArticle>,
    thumbnailFile?: Blob,
    mediaFiles?: Blob[]
  ): Promise<void> => {
    try {
      const articleRef = doc(firestore, 'news', newsId);
      let updateData = { ...articleData };
      
      // If a thumbnail file is provided, upload it to storage
      if (thumbnailFile) {
        const storageRef = ref(storage, `news-thumbnails/${Date.now()}-${articleData.title?.replace(/\s+/g, '-').toLowerCase() || 'thumbnail'}`);
        await uploadBytes(storageRef, thumbnailFile);
        const url = await getDownloadURL(storageRef);
        updateData.thumbnailUrl = url;
      }
      
      // If media files are provided, upload them to storage
      if (mediaFiles && mediaFiles.length > 0) {
        // First get the current article to access existing mediaUrls
        const articleDoc = await getDoc(articleRef);
        if (articleDoc.exists()) {
          const existingMediaUrls = articleDoc.data().mediaUrls || [];
          
          const newMediaUrls: string[] = [];
          for (let i = 0; i < mediaFiles.length; i++) {
            const file = mediaFiles[i];
            const storageRef = ref(storage, `news-media/${Date.now()}-${i}-${articleData.title?.replace(/\s+/g, '-').toLowerCase() || 'media'}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            newMediaUrls.push(url);
          }
          
          updateData.mediaUrls = [...existingMediaUrls, ...newMediaUrls];
        }
      }
      
      await updateDoc(articleRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating news article:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Delete a news article
   */
  export const deleteNewsArticle = async (newsId: string): Promise<void> => {
    try {
      await deleteDoc(doc(firestore, 'news', newsId));
    } catch (error) {
      console.error('Error deleting news article:', error);
      throw error;
    }
  };
  
  /**
   * Admin function: Toggle featured status of a news article
   */
  export const toggleFeaturedStatus = async (newsId: string, featured: boolean): Promise<void> => {
    try {
      const articleRef = doc(firestore, 'news', newsId);
      await updateDoc(articleRef, {
        featured,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      throw error;
    }
  };