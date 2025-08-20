import React, { useEffect, useState } from "react";
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
import { mockUser } from "../data/mockData";
import styles from "./Profile.module.css";
import Cookies from "js-cookie";
import { DialogView } from "@/components/DialogView";
import { Link } from "react-router-dom";
import getUser, { postsData, subsData } from "@/services/getUser";
import { ProfileData } from "@/types";

const Profile: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>();
  const [posts, setPosts] = useState<postsData>();
  const [subs, setSubs] = useState<subsData>();

  // const;

  const [activeProfileTab, setActiveProfileTab] = useState<
    "posts" | "settings"
  >("posts");

  useEffect(() => {
    async function fetchdata() {
      const id = Cookies.get("id");
      if (!id) {
        return;
      }
      const profiledata = await getUser.getUserById(Number(id));
      const postsdata = await getUser.getPosts();
      const subsdata = await getUser.getSubs();

      setProfile(profiledata);
      setPosts(postsdata);
      setSubs(subsdata);
    }
    fetchdata();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  if (!subs || !posts || !profile) {
    return;
  }

  return (
    <>
      <div className={styles.profilePage}>
        <header className={`${styles.profileHeader} glass-dark`}>
          <h1 className={styles.pageTitle}>Profile</h1>
          {/* <button className={styles.menuBtn}>
            <MoreVertical size={20} />
          </button> */}
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
              <h2 className={styles.profileName}>{profile.name}</h2>
              <p className={styles.profileUsername}>@{profile.userName}</p>
              {profile.about ? (
                <p className={styles.profileBio}>{profile.about}</p>
              ) : (
                <p className={styles.profileBio}>Tell us about yourself!</p>
              )}
            </div>

            <div className={styles.profileStats}>
              <div className="stat">
                <span className={styles.statNumber}>
                  {formatNumber(posts.count)}
                </span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className="stat">
                <span className={styles.statNumber}>
                  {formatNumber(subs.followersCount)}
                </span>
                <span className={styles.statLabel}>Followers</span>
              </div>
              <div className="stat">
                <span className={styles.statNumber}>
                  {formatNumber(subs.followingCount)}
                </span>
                <span className={styles.statLabel}>Following</span>
              </div>
            </div>

            <button className={styles.editProfileBtn} aria-label="Edit profile">
              <span className="w-full items-center justify-center flex">
                <Pencil size={16} />
              </span>
            </button>
          </div>

          <div className={styles.profileTabs}>
            <button
              className={`${styles.tabBtn} ${
                activeProfileTab === "posts" ? styles.active : ""
              }`}
              onClick={() => setActiveProfileTab("posts")}
              aria-label="Posts"
            >
              <FileText size={18} />
            </button>
            <button
              className={`${styles.tabBtn} ${
                activeProfileTab === "settings" ? styles.active : ""
              }`}
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
                  <Link to="/newpost">
                    <button className={styles.createPostBtn}>
                      Create First Post
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {activeProfileTab === "settings" && (
              <div className={styles.settingsTab}>
                <div className={`${styles.settingsSection} glass`}>
                  <h3 className={styles.sectionTitle}>Account</h3>

                  <div className={styles.settingItem}>
                    <Lock className={styles.settingIcon} size={20} />
                    <div className={styles.settingInfo}>
                      <span className={styles.settingName}>Password</span>
                      <span className={styles.settingValue}>••••••••</span>
                    </div>
                    <button className={styles.settingAction}>Change</button>
                  </div>
                </div>

                {/* <div className={`${styles.settingsSection} glass`}>
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
              </div> */}

                {/* <div className={`${styles.settingsSection} glass`}>
                <h3 className={styles.sectionTitle}>Notifications</h3>
                <div className={styles.settingItem}>
                  <Bell className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>
                      Push Notifications
                    </span>
                    <span className={styles.settingValue}>On</span>
                  </div>
                  <button className={styles.settingToggle}>Toggle</button>
                </div>
                <div className={styles.settingItem}>
                  <Mail className={styles.settingIcon} size={20} />
                  <div className={styles.settingInfo}>
                    <span className={styles.settingName}>
                      Email Notifications
                    </span>
                    <span className={styles.settingValue}>Weekly</span>
                  </div>
                  <button className={styles.settingAction}>Edit</button>
                </div>
              </div> */}

                <div className={`glass ${styles.dangerZone}`}>
                  <h3 className={`${styles.sectionTitle} ${styles.danger}`}>
                    Danger Zone
                  </h3>
                  {/* <button className={styles.dangerBtn}>Delete Account</button> */}
                  <button
                    className={styles.logoutBtn}
                    onClick={() => {
                      setDialogOpen(true);
                    }}
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {dialogOpen && (
        <DialogView
          setOpen={() => setDialogOpen(false)}
          title="Are you sure?"
          buttonText="Log out"
          buttonFunc={() => {
            Cookies.remove("id");
            Cookies.remove("token");
            window.location.reload();
          }}
        />
      )}
    </>
  );
};

export default Profile;
