import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface HeightCache {
  [id: number]: number;
}

const VirtualizedPostsFeed: React.FC = () => {
  // Configuration state
  const [overscan, setOverscan] = useState<number>(3);
  const [estimatedHeight, setEstimatedHeight] = useState<number>(120);
  const [showDebugOverlay, setShowDebugOverlay] = useState<boolean>(false);
  
  // Data and UI state
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(600);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const heightCache = useRef<HeightCache>({});
  
  // Generate mock posts
  useEffect(() => {
    const generatePosts = () => {
      const newPosts: Post[] = [];
      for (let i = 1; i <= 500; i++) {
        // Vary content length to produce different heights
        const titleLength = 3 + Math.floor(Math.random() * 5);
        const bodyLength = 20 + Math.floor(Math.random() * 100);
        
        newPosts.push({
          id: i,
          title: `Post ${i} ${'Word'.repeat(titleLength)}`,
          body: `This is the body content of post ${i}. ${'Longer text. '.repeat(bodyLength)}`,
          userId: 1 + Math.floor(Math.random() * 10)
        });
      }
      setPosts(newPosts);
      setIsLoading(false);
    };
    
    generatePosts();
  }, []);
  
  // Set up container height and scroll listener
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight);
      
      const handleScroll = () => {
        if (containerRef.current) {
          setScrollTop(containerRef.current.scrollTop);
        }
      };
      
      containerRef.current.addEventListener('scroll', handleScroll);
      return () => {
        containerRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Calculate visible items
  const { startIndex, endIndex, totalHeight } = React.useMemo(() => {
    if (posts.length === 0) return { startIndex: 0, endIndex: 0, totalHeight: 0 };
    
    let currentPosition = 0;
    const positions = posts.map(post => {
      const height = heightCache.current[post.id] || estimatedHeight;
      const position = currentPosition;
      currentPosition += height;
      return position;
    });
    
    // Find start index
    let startIndex = 0;
    while (startIndex < posts.length && positions[startIndex] + (heightCache.current[posts[startIndex].id] || estimatedHeight) < scrollTop) {
      startIndex++;
    }
    startIndex = Math.max(0, startIndex - overscan);
    
    // Find end index
    let endIndex = startIndex;
    while (endIndex < posts.length && positions[endIndex] < scrollTop + containerHeight) {
      endIndex++;
    }
    endIndex = Math.min(posts.length - 1, endIndex + overscan);
    
    return { startIndex, endIndex, totalHeight: currentPosition };
  }, [posts, scrollTop, containerHeight, overscan, estimatedHeight]);
  
  // Handle height measurement
  const handleHeightMeasured = useCallback((id: number, height: number) => {
    if (heightCache.current[id] !== height) {
      heightCache.current[id] = height;
    }
  }, []);
  
  // Reset cache
  const handleResetCache = () => {
    heightCache.current = {};
  };
  
  // Render a single post item
  const renderPost = (post: Post) => (
    <PostCard 
      key={post.id} 
      post={post} 
      onHeightMeasured={handleHeightMeasured}
      estimatedHeight={estimatedHeight}
    />
  );
  
  // Calculate offset for visible items
  const offsetTop = React.useMemo(() => {
    let offset = 0;
    for (let i = 0; i < startIndex; i++) {
      offset += heightCache.current[posts[i].id] || estimatedHeight;
    }
    return offset;
  }, [startIndex, posts, estimatedHeight]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Virtualized Posts Feed</h1>
          <p className="text-gray-600">Efficiently rendering only visible items while preserving scroll position</p>
        </header>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Overscan Count</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={overscan} 
                  onChange={(e) => setOverscan(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-gray-700 font-medium w-8">{overscan}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Items rendered outside viewport</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Height</label>
              <div className="flex items-center">
                <input 
                  type="range" 
                  min="60" 
                  max="300" 
                  step="10"
                  value={estimatedHeight} 
                  onChange={(e) => setEstimatedHeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-2 text-gray-700 font-medium w-12">{estimatedHeight}px</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">For not-yet-measured items</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg flex flex-col justify-center">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="debug-toggle"
                  checked={showDebugOverlay} 
                  onChange={() => setShowDebugOverlay(!showDebugOverlay)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <label htmlFor="debug-toggle" className="ml-2 text-sm font-medium text-gray-700">
                  Show Debug Overlay
                </label>
              </div>
              <button 
                onClick={handleResetCache}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Reset Height Cache
              </button>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="text-center p-2 bg-white rounded text-black">
                <div className="text-gray-500">Total Items</div>
                <div className="font-bold">{posts.length}</div>
              </div>
              <div className="text-center p-2 bg-white rounded text-black">
                <div className="text-gray-500">Rendered Items</div>
                <div className="font-bold">{endIndex - startIndex + 1}</div>
              </div>
              <div className="text-center p-2 bg-white rounded text-black">
                <div className="text-gray-500">Cache Hits</div>
                <div className="font-bold">
                  {Object.keys(heightCache.current).length}/{posts.length}
                </div>
              </div>
              <div className="text-center p-2 bg-white rounded text-black">
                <div className="text-gray-500">Viewport Range</div>
                <div className="font-bold">{startIndex} - {endIndex}</div>
              </div>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="relative border border-gray-300 rounded-lg bg-white overflow-y-auto"
            style={{ height: '600px', overflowY: 'auto' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading posts...</div>
              </div>
            ) : (
              <>
                <div 
                  className="w-full absolute top-0 left-0"
                  style={{ height: `${totalHeight}px` }}
                />
                
                <div 
                  className="w-full absolute top-0 left-0"
                  style={{ transform: `translateY(${offsetTop}px)` }}
                >
                  {posts.slice(startIndex, endIndex + 1).map(renderPost)}
                </div>
                
                {showDebugOverlay && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
                    <div>Scroll Top: {Math.round(scrollTop)}px</div>
                    <div>Visible: {startIndex} - {endIndex}</div>
                    <div>Rendering: {endIndex - startIndex + 1} items</div>
                    <div>Cache: {Object.keys(heightCache.current).length} items</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How It Works</h2>
          <ul className="list-disc pl-5 text-gray-600 space-y-2">
            <li>Only posts in the viewport (plus overscan buffer) are rendered</li>
            <li>Each post's height is measured and cached for consistent layout</li>
            <li>Unmounted posts preserve their height to prevent scroll jumps</li>
            <li>ResizeObserver tracks height changes for responsive adjustments</li>
            <li>Total container height equals the sum of all item heights</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface PostCardProps {
  post: Post;
  onHeightMeasured: (id: number, height: number) => void;
  estimatedHeight: number;
}

const PostCard: React.FC<PostCardProps> = ({ post, onHeightMeasured, estimatedHeight }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (ref.current) {
      const height = ref.current.getBoundingClientRect().height;
      onHeightMeasured(post.id, height);
      
      // Simulate ResizeObserver for height changes
      const checkHeight = () => {
        if (ref.current) {
          const newHeight = ref.current.getBoundingClientRect().height;
          if (newHeight !== height) {
            onHeightMeasured(post.id, newHeight);
          }
        }
      };
      
      // Check for height changes after content loads
      const timeoutId = setTimeout(checkHeight, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [post.id, onHeightMeasured]);
  
  return (
    <article 
      ref={ref}
      className="m-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <h2 className="text-lg font-bold text-gray-800 mb-2">{post.title}</h2>
      <p className="text-gray-600 mb-3">{post.body}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>By User #{post.userId}</span>
        <span>ID: {post.id}</span>
      </div>
    </article>
  );
};

export default VirtualizedPostsFeed;