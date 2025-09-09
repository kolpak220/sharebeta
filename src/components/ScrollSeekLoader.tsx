import React from 'react';
import PostCardSkeleton from './PostCardSkeleton';
import styles from './ScrollSeekLoader.module.css';
interface ScrollSeekLoaderProps {
  index: number;
  hasMedia?: boolean;
  estimatedHeight?: number;
}

const ScrollSeekLoader: React.FC<ScrollSeekLoaderProps> = ({ 
  index, 
  hasMedia = false, 
  estimatedHeight 
}) => {
  // Определяем высоту на основе типа контента
  const height = estimatedHeight || (hasMedia ? 700 : 300);
  
  return (
    <div className={styles.scrollSeekItem} style={{ height }}>
      <PostCardSkeleton hasMedia={hasMedia} height={height} />
    </div>
  );
};

export default ScrollSeekLoader;