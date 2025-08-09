import { Post, User } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  bio: 'Mobile developer & UI/UX enthusiast 📱✨',
  followers: 1234,
  following: 567,
  posts: 89
};

const basePosts: Omit<Post, 'id'>[] = [
  {
    author: {
      name: 'Alice Johnson',
      username: 'alicej',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Just finished building an amazing React app! The component architecture is so clean and maintainable. Love how TypeScript makes everything more robust 🚀',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: '2h',
    isLiked: false
  },
  {
    author: {
      name: 'Mike Chen',
      username: 'mikechen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Beautiful sunset from my balcony today 🌅 Sometimes you need to pause and appreciate the simple moments in life.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    likes: 156,
    comments: 23,
    shares: 12,
    timestamp: '4h',
    isLiked: true
  },
  {
    author: {
      name: 'Sarah Wilson',
      username: 'sarahw',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
    content: 'New coffee shop discovery! ☕ The atmosphere here is perfect for remote work. Plus they have the best matcha latte in town 💚',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
    likes: 89,
    comments: 15,
    shares: 7,
    timestamp: '6h',
    isLiked: false
  },
  {
    author: {
      name: 'David Park',
      username: 'davidp',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Weekend hiking adventure! 🥾 Nature always provides the best therapy. The view from the summit was absolutely breathtaking.',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop',
    likes: 203,
    comments: 31,
    shares: 18,
    timestamp: '8h',
    isLiked: true
  },
  {
    author: {
      name: 'Emma Rodriguez',
      username: 'emmar',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Homemade pizza night! 🍕 Tried a new recipe with truffle oil and arugula. Cooking is such a therapeutic hobby.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    likes: 67,
    comments: 12,
    shares: 5,
    timestamp: '12h',
    isLiked: false
  },
  {
    author: {
      name: 'James Wilson',
      username: 'jameswilson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Morning workout complete! 💪 Nothing beats starting the day with some endorphins. Today\'s goal: deadlifts and positive vibes.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    likes: 124,
    comments: 19,
    shares: 8,
    timestamp: '1h',
    isLiked: false
  },
  {
    author: {
      name: 'Lisa Chang',
      username: 'lisac',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Just launched my new portfolio website! 🎨 It\'s been months of work but finally seeing it live feels incredible. Thanks to everyone who supported me!',
    likes: 89,
    comments: 34,
    shares: 15,
    timestamp: '3h',
    isLiked: true
  },
  {
    author: {
      name: 'Ryan Torres',
      username: 'ryant',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    content: 'Late night coding session with some jazz music 🎵 There\'s something magical about solving complex problems when the world is quiet.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    likes: 76,
    comments: 12,
    shares: 4,
    timestamp: '5h',
    isLiked: false
  }
];

// Generate infinite posts by cycling through base posts with different IDs
export const generatePosts = (page: number, pageSize: number = 10): Post[] => {
  const posts: Post[] = [];
  const startIndex = page * pageSize;
  
  for (let i = 0; i < pageSize; i++) {
    const baseIndex = (startIndex + i) % basePosts.length;
    const basePost = basePosts[baseIndex];
    
    posts.push({
      ...basePost,
      id: `${startIndex + i + 1}`,
      likes: basePost.likes + Math.floor(Math.random() * 50),
      comments: basePost.comments + Math.floor(Math.random() * 20),
      shares: basePost.shares + Math.floor(Math.random() * 10),
      isLiked: Math.random() > 0.7
    });
  }
  
  return posts;
};

export const mockPosts: Post[] = generatePosts(0, 5);
