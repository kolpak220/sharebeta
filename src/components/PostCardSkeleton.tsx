import React from "react";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";
import { MoreVertical, Heart, MessageCircle, Share } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

const PostCardSkeleton = React.memo(() => {
  return (
    <>
      <div className={`${styles.postCard} glass`}>
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Skeleton className={styles.authorAvatar} />
            <div className="flex-col">
              {/* {post.authorName ? (
                <>
                  <h3 className={styles.authorName}>{post.authorName}</h3>
                  <p className={styles.authorUsername}>
                    @{post.authorUserName}
                  </p>
                </>
              ) : (
                <>
                  <h3 className={styles.authorName}>@{post.authorUserName}</h3>
                </>
              )} */}
              <Skeleton className={cn(styles.margin, "h-4 w-[150px]")} />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <span className="flex justify-center items-center">
            <span className="date right-0">
              <Skeleton className="h-4 w-[40px]" />
            </span>
            <button className={styles.moreBtn}>
              <MoreVertical size={18} />
            </button>
          </span>
        </div>

        <div className={styles.postContent}>
          <div className={styles.postText}>
            <Skeleton className="h-32 w-full" />
          </div>
        </div>

        <div className={styles.postActions}>
          <span className="flex justify-between items-center w-full">
            <span className="flex justify-center items-center">
              <button className={styles.actionBtn}>
                <Heart className={styles.actionIcon} size={20} fill="none" />
                <span className={styles.actionCount}>
                  <Skeleton className="w-5 h-5" />
                </span>
              </button>

              <button className={styles.actionBtn}>
                <MessageCircle className={styles.actionIcon} size={20} />
                <span className={styles.actionCount}>
                  <Skeleton className="w-5 h-5" />
                </span>
              </button>
            </span>
            <button className={styles.actionBtn}>
              <Share className={styles.actionIcon} size={20} />
            </button>
          </span>
        </div>
      </div>
    </>
  );
});

export default PostCardSkeleton;
