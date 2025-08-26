import { formatNumber } from "@/lib/utils";
import formatTimeAgo from "@/services/formatTimeAgo";
import Paragraph from "antd/es/typography/Paragraph";

import { Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./SearchModal.module.css";
import { Post } from "@/redux/slices/postsSlice/types";

const MiniPostCard: React.FC<{ item: Post }> = ({ item }) => {
  const navigate = useNavigate();

  return (
    // <Link to={"/post/" + item.idPost}>
    // {/* <a href={"/post/" + item.idPost}> */}
    <div
      onClick={() => {
        navigate("/post/" + item.idPost);
      }}
      className={styles["search-item"]}
      key={item.idPost}
    >
      <div className="w-full flex justify-between items-center">
        <span className={styles["search-result"]}>{item.authorUserName}</span>
        <span>{formatTimeAgo(item.createAt)}</span>
      </div>

      <span className={styles["search-meta"]}></span>
      <Paragraph className={styles["search-meta"]} ellipsis>
        {item.text}
      </Paragraph>
      <div className="w-full flex items-center gap-3">
        <div className="flex gap-1">
          <Heart className="mt-[2px]" size={16} />
          {formatNumber(item.likesCount)}
        </div>
      </div>
    </div>
    // {/* </a> */}
    // </Link>
  );
};

export default MiniPostCard;
