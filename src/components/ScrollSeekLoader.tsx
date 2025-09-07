import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';
import styles from './ScrollSeekLoader.module.css';

const ScrollSeekLoader: React.FC<{ index: number }> = ({ index }) => {
  return (
    <div className={styles.scrollSeekItem}>
      <PostCardSkeleton />
    </div>
  );
};

export default ScrollSeekLoader;