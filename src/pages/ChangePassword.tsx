import React from "react";
import ChangePasswordForm, {
  ChangePwFormData,
} from "@/components/ChangePassworfForm";
import userActions from "@/services/userActions";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { message } from "antd";

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (formData: ChangePwFormData) => {
    try {
      message.loading("Changing password...");
      const res = await userActions.PutChangePw(formData);
      if (res) {
        message.success("Password changed successfully");
      }
      // PutChangePw clears cookies and reloads; this is a fallback
      navigate("/auth");
    } catch (err) {
      message.error("An error occurred");
    }
  };

  return (
    <div className="flex justify-center items-center h-full w-full absolute top-0 left-0">
      <div className="w-full max-w-[700px] h-[100vh] bg-[#000] flex flex-col z-10">
        <div className="w-full flex h-[70px] gap-5 items-center justify-start">
          <button onClick={() => navigate(-1)} className="ml-3">
            <ChevronLeft size={30} />
          </button>
          <span className="text-xl">Change Password</span>
        </div>
        <div className="w-full flex flex-col p-4 items-center justify-center">
          <ChangePasswordForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
