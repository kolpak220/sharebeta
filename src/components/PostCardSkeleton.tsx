import React from "react";
import styles from "./PostCard.module.css";
import Base64Image from "./BaseImage";
import { MoreVertical, Heart, MessageCircle, Share } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

interface PostCardSkeletonProps {
  hasMedia?: boolean;
  height?: number;
}

const PostCardSkeleton = React.memo(({ 
  hasMedia = false, 
  height 
}: PostCardSkeletonProps) => {
  // Автоматически определяем высоту на основе типа контента
  const skeletonHeight = height || (hasMedia ? 700 : 300);
  const contentHeight = hasMedia ? "h-96" : "h-32";

  return (
    <div style={{ height: skeletonHeight, opacity: 0.8 }}>
      <div className={`${styles.postCard} glass`}>
        {/* Заголовок */}
        <div className={styles.postHeader}>
          <div className={styles.authorInfo}>
            <Skeleton className={styles.authorAvatar} />
            <div className="flex-col">
              <Skeleton className={cn(styles.margin, "h-4 w-[150px]")} />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-4 w-[40px]" />
        </div>

        {/* Контент */}
        <div className={styles.postContent}>
          <div className={styles.postText}>
            <Skeleton className={cn("w-full", contentHeight)} />
          </div>
        </div>

        {/* Действия */}
        <div className={styles.postActions}>
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
});

export default PostCardSkeleton;
