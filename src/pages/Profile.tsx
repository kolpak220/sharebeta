import React, { useState } from 'react';
import { 
  MoreVertical, 
  Camera, 
  FileText, 
  Settings, 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  Bell,
  Pencil,
  ChevronRight
} from 'lucide-react';
import { mockUser } from '../data/mockData';
import './Profile.css';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'settings'>('posts');

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="profile-page">
      <header className="profile-header glass-dark">
        <h1 className="page-title">Profile</h1>
        <button className="menu-btn">
          <MoreVertical size={20} />
        </button>
      </header>

      <div className="profile-content">
        <div className="profile-info glass">
          <div className="profile-avatar-section">
            <img 
              src={mockUser.avatar} 
              alt={mockUser.name}
              className="profile-avatar"
            />
            <button className="edit-avatar-btn">
              <Camera size={14} />
            </button>
          </div>
          
          <div className="profile-details">
            <h2 className="profile-name">{mockUser.name}</h2>
            <p className="profile-username">@{mockUser.username}</p>
            <p className="profile-bio">{mockUser.bio}</p>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{formatNumber(mockUser.posts)}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(mockUser.followers)}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formatNumber(mockUser.following)}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <button className="edit-profile-btn" aria-label="Edit profile">
            <Pencil size={16} />
          </button>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
            aria-label="Posts"
          >
            <FileText size={18} />
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'posts' && (
            <div className="posts-tab glass">
              <div className="empty-state">
                <FileText className="empty-icon" size={48} />
                <h3>Your posts will appear here</h3>
                <p>Share your thoughts and moments with the world!</p>
                <button className="create-post-btn">Create First Post</button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="settings-section glass">
                <h3 className="section-title">Account</h3>
                <div className="setting-item">
                  <Mail className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Email</span>
                    <span className="setting-value">{mockUser.email}</span>
                  </div>
                  <button className="setting-action">Edit</button>
                </div>
                <div className="setting-item">
                  <Lock className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Password</span>
                    <span className="setting-value">••••••••</span>
                  </div>
                  <button className="setting-action">Change</button>
                </div>
              </div>

              <div className="settings-section glass">
                <h3 className="section-title">Privacy</h3>
                <div className="setting-item">
                  <Shield className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Private Account</span>
                    <span className="setting-value">Off</span>
                  </div>
                  <button className="setting-toggle">Toggle</button>
                </div>
                <div className="setting-item">
                  <Eye className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Story Views</span>
                    <span className="setting-value">Everyone</span>
                  </div>
                  <button className="setting-action">Edit</button>
                </div>
              </div>

              <div className="settings-section glass">
                <h3 className="section-title">Notifications</h3>
                <div className="setting-item">
                  <Bell className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Push Notifications</span>
                    <span className="setting-value">On</span>
                  </div>
                  <button className="setting-toggle">Toggle</button>
                </div>
                <div className="setting-item">
                  <Mail className="setting-icon" size={20} />
                  <div className="setting-info">
                    <span className="setting-name">Email Notifications</span>
                    <span className="setting-value">Weekly</span>
                  </div>
                  <button className="setting-action">Edit</button>
                </div>
              </div>

              <div className="danger-zone glass">
                <h3 className="section-title danger">Danger Zone</h3>
                <button className="danger-btn">Delete Account</button>
                <button className="logout-btn">Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
