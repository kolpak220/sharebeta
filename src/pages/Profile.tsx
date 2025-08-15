import React, { useState } from "react";
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
} from "lucide-react";
import { mockUser } from "../data/mockData"
import styles from "./Profile.module.css";

const Profile: React.FC = () => {
  const [activeProfileTab, setActiveProfileTab] = useState<
    "posts" | "settings"
  >("posts");

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className={styles.profilePage}>
      <header className={`${styles.profileHeader} glass-dark`}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <button className={styles.menuBtn}>
          <MoreVertical size={20} />
        </button>
      </header>

      <div className={styles.profileContent}>
        <div className={`glass ${styles.profileInfo}`}>
          <div className={styles.profileAvatarSection}>
            <img
              src={mockUser.avatar}
              alt={mockUser.name}
              className={styles.profileAvatar}
            />
            <button className={styles.editAvatarBtn}>
              <Camera size={14} />
            </button>
          </div>

          <div className={styles.profileDetails}>
            <h2 className={styles.profileName}>{mockUser.name}</h2>
            <p className={styles.profileUsername}>@{mockUser.username}</p>
            <p className={styles.profileBio}>{mockUser.bio}</p>
          </div>

          <div className={styles.profileStats}>
            <div className="stat">
              <span className={styles.statNumber}>
                {formatNumber(mockUser.posts)}
              </span>
              <span className={styles.statLabel}>Posts</span>
            </div>
            <div className="stat">
              <span className={styles.statNumber}>
                {formatNumber(mockUser.followers)}
              </span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className="stat">
              <span className={styles.statNumber}>
                {formatNumber(mockUser.following)}
              </span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>

          <button className={styles.editProfileBtn} aria-label="Edit profile">
            <Pencil size={16} />
          </button>
        </div>

        <div className={styles.profileTabs}>
          <button
            className={`${styles.tabBtn} ${activeProfileTab === "posts" ? styles.active : ""}`}
            onClick={() => setActiveProfileTab("posts")}
            aria-label="Posts"
          >
            <FileText size={18} />
          </button>
          <button
            className={`${styles.tabBtn} ${activeProfileTab === "settings" ? styles.active : ""}`}
            onClick={() => setActiveProfileTab("settings")}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeProfileTab === "posts" && (
            <div className={`${styles.postsTab} glass`}>
              <div className={styles.emptyState}>
                <FileText className={styles.emptyIcon} size={48} />
                <h3>Your posts will appear here</h3>
                <p>Share your thoughts and moments with the world!</p>
                <button className={styles.createPostBtn}>Create First Post</button>
              </div>
            </div>
          )}

          {activeProfileTab === "settings" && (
            <div className={styles.settingsTab}>
              <div className={`${styles.settingsSection} glass`}>
                <h3 className={styles.sectionTitle}>Account</h3>
                <div className={styles.settingItem}>
                  <Mail className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Email</span>
                    <span className={styles.settingValue}>{mockUser.email}</span>
                  </div>
                  <button className={styles.settingAction}>Edit</button>
                </div>
                <div className={styles.settingItem}>
                  <Lock className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Password</span>
                    <span className={styles.settingValue}>••••••••</span>
                  </div>
                  <button className={styles.settingAction}>Change</button>
                </div>
              </div>

              <div className={`${styles.settingsSection} glass`}>
                <h3 className={styles.sectionTitle}>Privacy</h3>
                <div className={styles.settingItem}>
                  <Shield className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Private Account</span>
                    <span className={styles.settingValue}>Off</span>
                  </div>
                  <button className={styles.settingToggle}>Toggle</button>
                </div>
                <div className={styles.settingItem}>
                  <Eye className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Story Views</span>
                    <span className={styles.settingValue}>Everyone</span>
                  </div>
                  <button className={styles.settingAction}>Edit</button>
                </div>
              </div>

              <div className={`${styles.settingsSection} glass`}>
                <h3 className={styles.sectionTitle}>Notifications</h3>
                <div className={styles.settingItem}>
                  <Bell className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Push Notifications</span>
                    <span className={styles.settingValue}>On</span>
                  </div>
                  <button className={styles.settingToggle}>Toggle</button>
                </div>
                <div className={styles.settingItem}>
                  <Mail className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>Email Notifications</span>
                    <span className={styles.settingValue}>Weekly</span>
                  </div>
                  <button className={styles.settingAction}>Edit</button>
                </div>
              </div>

              <div className={`glass ${styles.dangerZone}`}>
                <h3 className={`${styles.sectionTitle} ${styles.danger}`}>Danger Zone</h3>
                <button className={styles.dangerBtn}>Delete Account</button>
                <button className={styles.logoutBtn}>Log Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
