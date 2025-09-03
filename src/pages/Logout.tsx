import React from "react";
import Cookies from "js-cookie";
import styles from "./User.module.css";
import { ChevronLeft, Pencil } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doesAnyHistoryEntryExist = location.key !== "default";

  const handleLogOut = () => {
    Cookies.set("id", "");
    Cookies.set("token", "");
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="flex justify-center items-center h-full w-full absolute top-0 left-0">
      <div className="w-full max-w-[700px] h-[100vh] bg-[#000] flex flex-col z-10">
        <div className="w-full flex h-[70px] gap-5 items-center justify-start">
          <button
            onClick={() => {
              if (doesAnyHistoryEntryExist) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="ml-3"
          >
            <ChevronLeft size={30} />
          </button>
          <span className="text-xl">Log out</span>
        </div>

        <div className="w-full flex flex-col p-8 items-start">
          <div className="text-lg">Alternative options</div>
          <div
            onClick={() => navigate("/change-password")}
            className="flex w-full justify-between cursor-pointer"
          >
            <div className="flex justify-center align-center w-[10%] px-1 py-5">
              <Pencil size={25} />
            </div>
            <div className="flex flex-col w-[90%] p-2">
              <div className="text-lg">Change password</div>
              <div className="text-sm text-accent">
                Change your current password
              </div>
            </div>
          </div>
          <div className={styles.line}></div>
          <div
            onClick={handleLogOut}
            className="text-red-500 text-lg cursor-pointer"
          >
            Log out
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
