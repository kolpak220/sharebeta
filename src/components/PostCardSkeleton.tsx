import React from "react";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";
import { MoreVertical, Heart, MessageCircle, Share } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface PostCardSkeletonProps {
  hasMedia?: boolean;
}

const PostCardSkeleton = React.memo(({ hasMedia = false }: PostCardSkeletonProps) => {
  const contentHeight = hasMedia ? 'h-128' : 'h-32';

  return (
    <div style={{ height: hasMedia ? 500 : 300 }}> {/* Фиксированная высота для скелетона */}
      <div className={`${styles.postCard} glass`}>
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Skeleton className={styles.authorAvatar} />
            <div className="flex-col">
              <Skeleton className={cn(styles.margin, "h-4 w-[150px]")} />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <span className="flex justify-center items-center">
            <span className="date right-0">
              <Skeleton className="h-4 w-[40px]" />
            </span>
          </span>
        </div>

        <div className={styles.postContent}>
          <div className={styles.postText}>
            <Skeleton className={cn("w-full", contentHeight)} />
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
          </span>
        </div>
      </div>
    </div>
  );
});

export default PostCardSkeleton;