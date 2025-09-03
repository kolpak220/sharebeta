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
  className?: string;
  version?: number | string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  dataUser,
  userId,
  className,
  version,
}) => {
  const avatar = getAvatarUrl(userId, version);

  return (
    <>
      {dataUser ? (
        dataUser?.hasPhoto ? (
          <img src={avatar} className={className || styles.authorAvatar} />
        ) : dataUser?.hasPhoto ? (
          <Skeleton />
        ) : (
          <>
            <UserRound className={className || styles.authorAvatar} />
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
