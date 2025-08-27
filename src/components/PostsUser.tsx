import React, { useEffect, useState } from "react";
import styles from "../pages/User.module.css";
import MiniPostCard from "./MiniPostCard";
import getUser, { postsData } from "@/services/getUser";

interface PostsUserProps {
  userId: number;
  setPostCount: (value: number) => void;
}

const PostsUser: React.FC<PostsUserProps> = ({ userId, setPostCount }) => {
  const [posts, setPosts] = useState<postsData>();
  
  useEffect(() => {
    (async () => {
      const posts = await getUser.getPostsById(userId);
      const postscount = await getUser.getPosts(userId);

      if (!posts || !postscount) {
        return;
      }
      const postsforming = {
        ...postscount,
        posts,
      };
      setPosts(postsforming);
      setPostCount(posts.length)
    })();
  }, [userId]);

  return (
    <>
      {posts?.posts.map((item) => (
        <MiniPostCard key={item.idPost} item={item} />
      ))}
    </>
  );
}

export default PostsUser;