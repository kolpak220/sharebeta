import { cn } from "@/lib/utils";
import { Media } from "@/types";
import { Layers, Maximize2, Play } from "lucide-react";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import styles from "./PostCard.module.css";

const PostMedia = React.memo(
  ({
    mediaFetch,
    count,
    handleClick,
  }: {
    mediaFetch: Media | undefined;
    count: number;
    handleClick: () => void;
  }) => {
    return (
      <>
        {mediaFetch && count > 0 && (
          <div
            onClick={() => {
              handleClick();
            }}
            className="relative"
          >
            {mediaFetch && mediaFetch.type.includes("video") && (
              <>
                <video className={styles.postImage} src={mediaFetch.url} />
                <div className={styles.postPlay}>
                  <Play />
                </div>
              </>
            )}
            {mediaFetch && mediaFetch.type.includes("image") && (
              <img
                src={mediaFetch.url}
                alt="Post content"
                className={styles.postImage}
              />
            )}

            <div className={styles.postMedia}>
              <Layers />
              1/{count}{" "}
            </div>
            <div className={styles.postMaximize}>
              <Maximize2 />
            </div>
          </div>
        )}
        {!mediaFetch && count > 0 && (
          <div className="relative">
            <Skeleton
              className={cn(styles.postImage, "h-[300px] w-full rounded-xl")}
            />
            <div className={styles.postMedia}>
              <Layers />
              1/{count}{" "}
            </div>
            <div className={styles.postMaximize}>
              <Maximize2 />
            </div>
          </div>
        )}
      </>
    );
  }
);

export default PostMedia;
