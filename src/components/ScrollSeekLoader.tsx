import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';
import styles from './ScrollSeekLoader.module.css';

interface ScrollSeekLoaderProps {
  index: number;
  hasMedia?: boolean;
}

const ScrollSeekLoader: React.FC<ScrollSeekLoaderProps> = ({ index, hasMedia = false }) => {
  return (
    <div className={styles.scrollSeekItem}>
      <PostCardSkeleton hasMedia={hasMedia} />
    </div>
  );
};

export default ScrollSeekLoader;