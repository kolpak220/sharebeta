export interface User {
  id: string;
  avatar: string;
  name: string;
  username: string;
  bio: string;
  email: string;
  posts: number;
  followers: number;
  following: number;
  joinDate: string;
  location?: string;
  website?: string;
}

export const mockUser: User = {
  id: "user-12345",
  avatar: "https://randomuser.me/api/portraits/women/68.jpg", // Random avatar URL
  name: "Alexandra Johnson",
  username: "alex_j",
  bio: "Digital creator | Photography enthusiast | Travel addict ✈️ | Coffee lover ☕",
  email: "alex.johnson@example.com",
  posts: 247,
  followers: 12800,
  following: 560,
  joinDate: "2020-06-15T10:30:00Z",
  location: "San Francisco, CA",
  website: "https://alexjohnson.design",
};
