import { cn } from "@/lib/utils";
import { Media } from "@/types";
import { AlertCircle, Layers, Maximize2, Play } from "lucide-react";
import React, { useState } from "react";
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
    const [error, setError] = useState(false);

    return (
      <>
        {mediaFetch && count > 0 && (
          <div
            onClick={() => {
              handleClick();
            }}
            className="relative"
          >
            {!error && mediaFetch && mediaFetch.type.includes("video") && (
              <>
                <video
                  onError={() => {
                    setError(true);
                  }}
                  className={styles.postImage}
                  src={mediaFetch.url}
                />
                <div className={styles.postPlay}>
                  <Play />
                </div>
              </>
            )}
            {!error && mediaFetch && mediaFetch.type.includes("image") && (
              <img
                onError={() => {
                  setError(true);
                }}
                src={mediaFetch.url}
                alt="Post content"
                className={styles.postImage}
              />
            )}
            {error && (
              <div
                className={cn(
                  "bg-black w-full h-[200px] pt-15",
                  styles.postImage
                )}
              >
                <div className="media-viewer-error">
                  <AlertCircle size={48} />
                  <span>Failed to load media</span>
                </div>
              </div>
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
        {!mediaFetch && (
          <div className="relative">
            <Skeleton
              className={cn(styles.postImage, "h-[200px] w-full rounded-xl")}
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
