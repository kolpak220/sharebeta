import React, { useEffect, useState } from "react";
import styles from "./User.module.css";
import { User as UserType } from "@/types";
import { useParams } from "react-router-dom";
import getUser from "@/services/getUser";

const User: React.FC = () => {
  const [dataUser, setDataUser] = useState<UserType>();
  const { id } = useParams();

  useEffect(() => {
    (async () => {
      const userId = id ? parseInt(id, 10) : NaN;

      const userData = await getUser.getUserById(userId);
      setDataUser(userData);
    })();
  }, []);

  return (
    <>
      <div className="user-container">

      </div>
    </>
  );
}

export default User;