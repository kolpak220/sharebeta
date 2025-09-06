import React, { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";

type VirtualizedPostIdsProps = {
  postIds: number[];
  containerRef: React.RefObject<HTMLDivElement>;
  overscan?: number;
  estimatedHeight?: number;
  disableComments?: boolean;
};

const VirtualizedPostIds: React.FC<VirtualizedPostIdsProps> = ({
  postIds,
  containerRef,
  overscan = 3,
  estimatedHeight = 420,
  disableComments = false,
}) => {
  console.log(containerRef.current?.clientHeight);

  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperOffsetTop, setWrapperOffsetTop] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => setScrollTop(el.scrollTop);
    setContainerHeight(el.clientHeight);
    setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);

    const updateWrapperOffset = () => {
      if (wrapperRef.current) {
        setWrapperOffsetTop(wrapperRef.current.offsetTop || 0);
      }
    };
    updateWrapperOffset();
    const roWrapper = new ResizeObserver(updateWrapperOffset);
    if (wrapperRef.current) roWrapper.observe(wrapperRef.current);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
      roWrapper.disconnect();
    };
  }, [containerRef]);

  const itemHeight = Math.max(1, estimatedHeight);

  const effectiveScrollTop = Math.max(0, scrollTop - wrapperOffsetTop);

  let startIndex = Math.floor(effectiveScrollTop / itemHeight) - overscan;
  startIndex = Math.max(0, startIndex);

  let endIndex =
    Math.floor((effectiveScrollTop + containerHeight) / itemHeight) + overscan;
  endIndex = Math.min(postIds.length - 1, endIndex);

  const offsetTop = startIndex * itemHeight;
  const totalHeight = postIds.length * itemHeight;
  const visibleIds = postIds.slice(startIndex, endIndex + 1);

  console.log(startIndex, endIndex);

  // replace the render block
  return (
    <div ref={wrapperRef}>
      <div style={{ height: startIndex * itemHeight }} />
      {visibleIds.map((id) => (
        <div key={id}>
          <PostCard postId={id} disableComments={disableComments} />
        </div>
      ))}
      <div style={{ height: (postIds.length - (endIndex + 1)) * itemHeight }} />
    </div>
  );
};

export default VirtualizedPostIds;
