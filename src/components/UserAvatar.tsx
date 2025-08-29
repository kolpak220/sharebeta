import { Skeleton } from "antd";
import { ProfileData } from "@/types";
import { UserRound } from "lucide-react";
import { SkeletonOverlay } from "./ui/skeletonOverlay";
import { useEffect, useState } from "react";
import getUser from "@/services/getUser";
import { getAvatarUrl } from "@/lib/utils";
import styles from "../pages/User.module.css";

interface UserAvatarProps {
  dataUser: ProfileData;
  userId: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({dataUser, userId}) => {
  const [avatar, setAvatar] = useState();

  useEffect(() => {
    (async () => {
      const avatar = await getUser.getAvatar(userId);
      setAvatar(avatar);
    })()
  })

  return (
    <>
      {dataUser ? (
        avatar ? (
          <img src={getAvatarUrl(userId)} className={styles.authorAvatar} />
        ) : dataUser?.hasPhoto ? (
          <Skeleton />
        ) : (
          <>
            <UserRound className={styles.authorAvatar} />
          </>
        )
      ) : (
        <>
          <SkeletonOverlay />
        </>
      )}
    </>
  );
};

export default UserAvatar;