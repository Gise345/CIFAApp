// src/services/instagram/instagramService.ts
import axios from 'axios';

// Instagram API endpoints
const INSTAGRAM_API_URL = 'https://graph.instagram.com';
const INSTAGRAM_USER_ID = process.env.EXPO_PUBLIC_INSTAGRAM_USER_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN;

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string; // Only for VIDEO type
  permalink: string;
  caption?: string;
  timestamp: string; // ISO date string
  children?: {
    data: Array<{
      id: string;
      media_type: 'IMAGE' | 'VIDEO';
      media_url: string;
    }>;
  };
}

export interface InstagramResponse {
  data: InstagramMedia[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

/**
 * Fetches Instagram posts from the official CIFA account
 * @param limit Maximum number of posts to fetch
 * @returns Promise with Instagram media data
 */
export const fetchInstagramPosts = async (limit: number = 10): Promise<InstagramMedia[]> => {
  try {
    // Validate configuration
    if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
      console.error('Instagram API credentials not configured');
      return [];
    }

    // Make request to Instagram Graph API
    const response = await axios.get<InstagramResponse>(
      `${INSTAGRAM_API_URL}/${INSTAGRAM_USER_ID}/media`,
      {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{id,media_type,media_url}',
          access_token: INSTAGRAM_ACCESS_TOKEN,
          limit: limit
        }
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching Instagram posts:', error);
    
    // Fallback to mock data during development or if API fails
    // In production, you might want to handle this differently
    return getMockInstagramPosts();
  }
};

/**
 * Fetches a specific Instagram post by ID
 * @param mediaId Instagram media ID
 * @returns Promise with Instagram media data
 */
export const fetchInstagramPostById = async (mediaId: string): Promise<InstagramMedia | null> => {
  try {
    if (!INSTAGRAM_ACCESS_TOKEN) {
      console.error('Instagram API credentials not configured');
      return null;
    }

    const response = await axios.get<InstagramMedia>(
      `${INSTAGRAM_API_URL}/${mediaId}`,
      {
        params: {
          fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,children{id,media_type,media_url}',
          access_token: INSTAGRAM_ACCESS_TOKEN
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching Instagram post with ID ${mediaId}:`, error);
    return null;
  }
};

/**
 * Provides mock Instagram data for development and fallback
 * @returns Array of mock Instagram posts
 */
export const getMockInstagramPosts = (): InstagramMedia[] => {
  return [
    {
      id: 'mock_17941715581349286',
      media_type: 'VIDEO',
      media_url: 'https://your-app-domain.com/assets/placeholder-video.mp4',
      thumbnail_url: 'https://your-app-domain.com/assets/placeholder-thumbnail.jpg',
      permalink: 'https://www.instagram.com/p/sample1/',
      caption: 'Bodden Town Wins CIFA President Cup #CIFA #CaymanFootball',
      timestamp: '2025-04-12T18:30:00+0000'
    },
    {
      id: 'mock_17911715581366986',
      media_type: 'IMAGE',
      media_url: 'https://your-app-domain.com/assets/placeholder-image.jpg',
      permalink: 'https://www.instagram.com/p/sample2/',
      caption: "Academy's Women Celebrating Victory #WomensFootball #CIFA",
      timestamp: '2025-03-10T15:45:00+0000'
    },
    {
      id: 'mock_17941723451349126',
      media_type: 'CAROUSEL_ALBUM',
      media_url: 'https://your-app-domain.com/assets/placeholder-album.jpg',
      permalink: 'https://www.instagram.com/p/sample3/',
      caption: 'BTS - Cayman\'s Men National Team in training for World Cup Qualifiers',
      timestamp: '2025-04-08T14:20:00+0000',
      children: {
        data: [
          {
            id: 'mock_sub1',
            media_type: 'IMAGE',
            media_url: 'https://your-app-domain.com/assets/placeholder-album-1.jpg'
          },
          {
            id: 'mock_sub2',
            media_type: 'IMAGE',
            media_url: 'https://your-app-domain.com/assets/placeholder-album-2.jpg'
          }
        ]
      }
    },
    {
      id: 'mock_17941715123459286',
      media_type: 'VIDEO',
      media_url: 'https://your-app-domain.com/assets/placeholder-video2.mp4',
      thumbnail_url: 'https://your-app-domain.com/assets/placeholder-thumbnail2.jpg',
      permalink: 'https://www.instagram.com/p/sample4/',
      caption: 'Head Coach Michael Johnson Post-Match Interview #CaymanFootball',
      timestamp: '2025-04-05T19:15:00+0000'
    },
    {
      id: 'mock_17941715581349987',
      media_type: 'VIDEO',
      media_url: 'https://your-app-domain.com/assets/placeholder-video3.mp4',
      thumbnail_url: 'https://your-app-domain.com/assets/placeholder-thumbnail3.jpg',
      permalink: 'https://www.instagram.com/p/sample5/',
      caption: 'CMNT Showcasing skills in Portugal training camp',
      timestamp: '2025-04-05T08:30:00+0000'
    }
  ];
};

/**
 * Parses Instagram caption to get a clean title
 * @param caption Raw Instagram caption
 * @returns Formatted title string
 */
export const getPostTitle = (caption?: string): string => {
  if (!caption) return 'CIFA Update';
  
  // Take first sentence or up to 60 characters
  const firstSentence = caption.split(/[.!?]/)[0].trim();
  return firstSentence.length > 60 
    ? firstSentence.substring(0, 57) + '...' 
    : firstSentence;
};

/**
 * Formats Instagram timestamp to a readable date
 * @param timestamp ISO date string
 * @returns Formatted date string
 */
export const formatInstagramDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 * Determines badge type based on Instagram post content
 * @param media Instagram media item
 * @returns Badge configuration
 */
export const getPostBadgeInfo = (media: InstagramMedia): { text: string, colors: string[] } => {
  const caption = media.caption?.toLowerCase() || '';
  
  if (media.media_type === 'VIDEO') {
    if (caption.includes('interview')) {
      return { text: 'INTERVIEW', colors: ['#0A1172', '#2F4CB3'] };
    } else if (caption.includes('recap') || caption.includes('highlights')) {
      return { text: 'MATCH RECAP', colors: ['#B51546', '#FF0844'] };
    } else {
      return { text: 'VIDEO', colors: ['#0A1172', '#2F4CB3'] };
    }
  } else if (media.media_type === 'CAROUSEL_ALBUM') {
    if (caption.includes('behind the scenes') || caption.includes('bts')) {
      return { text: 'BEHIND THE SCENES', colors: ['#0A1172', '#2F4CB3'] };
    } else {
      return { text: 'GALLERY', colors: ['#6a11cb', '#2575fc'] };
    }
  } else {
    return { text: 'NEWS', colors: ['#2563eb', '#1d4ed8'] };
  }
};