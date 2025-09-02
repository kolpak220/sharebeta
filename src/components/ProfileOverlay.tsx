import { ChevronDown, Lock, LogOut, Shield, UserRound, X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Divider } from "antd";
import ReceiptText from "@/assets/media/ReceiptText";
import { useContext, useState } from "react";
import { UIContext } from "@/contexts/UIContext";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";

type Props = {};

export default function ProfileOverlay(props: Props) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const ui = useContext(UIContext);
  const navigate = useNavigate();

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const skeleton = true;

  return (
    <>
      <div
        onClick={() => ui?.toggleProfileOverlay()}
        className={`fixed w-full h-[100vh] top-0 z-40 bg-black/20 max-w-[700px] flex ${
          ui?.profileOverlay ? "scale-100" : "scale-0"
        }`}
      ></div>

      <div
        onClick={() => ui?.toggleProfileOverlay()}
        className={`fixed w-full h-[100vh] top-0 z-50 max-w-[700px] flex transition-all duration-300 ease-in-out ${
          ui?.profileOverlay ? "translate-x-0" : "-translate-x-full opacity-0"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[80%] bg-black flex flex-col p-4 gap-y-2 relative"
        >
          <button
            onClick={() => ui?.toggleProfileOverlay()}
            className="absolute top-5 right-5"
          >
            <X />
          </button>
          {skeleton && (
            <>
              <Skeleton className="rounded-full w-15 h-15 mb-4" />
              <Skeleton className="w-50 h-5" />
              <Skeleton className="w-48 h-4" />
              <span className="flex gap-x-2 items-center">
                <Skeleton className="w-7 h-5" />
                <Skeleton className="w-14 h-4" />
                <Skeleton className="w-7 h-5" />
                <Skeleton className="w-14 h-4" />
              </span>
            </>
          )}

          <Divider style={{ borderColor: "#333333" }} variant="solid" />
          <span
            onClick={() => {
              ui?.toggleProfileOverlay();
              navigate("/profile");
            }}
            className="flex items-center gap-x-[19px]"
          >
            <UserRound size={24} />
            <span className="font-semibold text-[20px]">Profile</span>
          </span>
          <Divider style={{ borderColor: "#333333" }} variant="solid" />
          <span
            onClick={() => {
              ui?.toggleProfileOverlay();
              navigate("/terms-of-service");
            }}
            className="flex items-center gap-x-[19px] mb-2"
          >
            <ReceiptText />
            <span className="font-semibold text-[20px]">Terms of service</span>
          </span>
          <span
            onClick={() => {
              ui?.toggleProfileOverlay();
              navigate("/privacy-policy");
            }}
            className="flex items-center gap-x-[19px]"
          >
            <Shield size={24} />
            <span className="font-semibold text-[20px]">Privacy policy</span>
          </span>
          <Divider style={{ borderColor: "#333333" }} variant="solid" />

          {/* Settings Section */}
          <span
            className="flex justify-between relative items-center cursor-pointer"
            onClick={toggleSettings}
          >
            <span className="font-medium text-white text-[16px]">Settings</span>
            <ChevronDown
              className={`transition-transform duration-100 ${
                isSettingsOpen ? "rotate-180" : ""
              }`}
            />
          </span>

          {/* Sub Options with Transform Animation */}
          <div
            className={`overflow-hidden transition-all duration-100 ease-in-out ${
              isSettingsOpen
                ? "max-h-60 scale-y-100 origin-top"
                : "max-h-0 scale-y-0 origin-top"
            }`}
          >
            <div className="mt-2 space-y-4">
              <span className="flex items-center gap-x-[19px]">
                <Lock size={24} />
                <span className="font-regular text-[#CDCDCD] text-[14px] ">
                  Change password
                </span>
              </span>
              <span className="flex items-center gap-x-[19px]">
                <LogOut color="#FF0000" size={24} />
                <span className="font-regular text-[#FF0000] text-[14px] ">
                  Log out
                </span>
              </span>
            </div>
          </div>
          <span></span>
        </div>
      </div>
    </>
  );
}
