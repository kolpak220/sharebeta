import getUser from "@/services/getUser";
import { ProfileData } from "@/types";
import { Check, ChevronLeft, Save } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import UserAvatar from "@/components/UserAvatar";
import userActions from "@/services/userActions";
import { fileToBase64 } from "@/lib/utils";
import { message } from "antd";

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dataUser, setDataUser] = useState<ProfileData>();
  const userId = Number(Cookies.get("id"));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    about: "",
  });
  const [initialData, setInitialData] = useState({
    userName: "",
    name: "",
    about: "",
  });
  const [errors, setErrors] = useState<{
    userName?: string;
    name?: string;
    about?: string;
  }>({});

  useEffect(() => {
    (async () => {
      const data = await getUser.getUserById(userId);

      setDataUser(data);
    })();
  }, []);

  useEffect(() => {
    if (dataUser) {
      const init = {
        userName: dataUser.userName || "",
        name: dataUser.name || "",
        about: dataUser.about || "",
      };
      setInitialData(init);
      setFormData(init);
      setErrors({});
    }
  }, [dataUser]);

  const isDirty =
    formData.userName !== initialData.userName ||
    formData.name !== initialData.name ||
    formData.about !== initialData.about;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as { name: string; value: string };
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!formData.userName) {
      newErrors.userName = "Required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Min 3 chars";
    } else if (formData.userName.length > 20) {
      newErrors.userName = "Max 20 chars";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.userName)) {
      newErrors.userName = "Only Latin letters and numbers";
    }

    if (!formData.name) {
      newErrors.name = "Required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.name)) {
      newErrors.name = "Only Latin letters and numbers";
    }

    if (formData.about.length >= 40) {
      newErrors.about = "Max length 40 chars";
    }

    return newErrors;
  };

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!isDirty) return;

    try {
      message.loading("Saving changes..");
      const changed: any = {};
      if (formData.userName !== initialData.userName)
        changed.userName = formData.userName;
      if (formData.name !== initialData.name) changed.name = formData.name;
      if (formData.about !== initialData.about) changed.about = formData.about;

      const res = await userActions.PutEditProfile(changed as any);
      if (res) {
        const refreshed = await getUser.getUserById(userId);
        if (refreshed) {
          setDataUser(refreshed);
        }
        message.success("Profile updated successfully");
      }
    } catch (err) {
      message.error("Failed to save changes");
    }
  };
  const doesAnyHistoryEntryExist = location.key !== "default";
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    message.loading("Updating avatar...");
    if (file) {
      const base64 = await fileToBase64(file);
      const res = await userActions.UpdateUserAvatar(base64);
      if (res) {
        const data = await getUser.getUserById(userId);

        setDataUser(data);
        message.success("Avatar updated successfully");
      } else {
        message.error("Failed to update avatar");
      }
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
  };
  if (!dataUser) return;

  return (
    <div className="w-full max-w-[700px] flex flex-col items-center h-[100vh] overflow-y-auto">
      <div className="mb-5 w-full flex p-4 gap-x-5 relative border-b border-b-[#333]">
        <button
          onClick={() => {
            if (doesAnyHistoryEntryExist) {
              navigate(-1);
            } else {
              navigate("/");
            }
          }}
        >
          <ChevronLeft size={30} />
        </button>
        <span className="text-xl">Edit Profile</span>
        {isDirty && (
          <button
            onClick={() => formRef.current?.requestSubmit()}
            className="absolute right-4"
          >
            <Check size={30} />
          </button>
        )}
      </div>
      <div className="w-full flex flex-col items-center justify-center gap-y-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <UserAvatar
          className="w-30 h-30 rounded-full"
          dataUser={dataUser}
          userId={userId}
        />
        <button
          onClick={handleUpload}
          className="text-lg text-white rounded-full px-3 py-1 bg-[#222]"
        >
          Change avatar
        </button>
        <form
          ref={formRef}
          onSubmit={onFormSubmit}
          className="w-full max-w-xs mt-6 space-y-8"
        >
          <div className="flex flex-col relative !overflow-visible">
            <label className="text-lg text-gray-[#666] mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-2 py-2 bg-transparent border-b border-[#333] focus:border-white outline-none text-sm ${
                errors.name ? "text-red-500 border-red-500" : ""
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div className="flex flex-col relative !overflow-visible">
            <label className="text-lg text-gray-[#666] mb-1">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className={`w-full px-2 py-2 bg-transparent border-b border-[#333] focus:border-white outline-none text-sm ${
                errors.userName ? "text-red-500 border-red-500" : ""
              }`}
            />
            {errors.userName && (
              <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
            )}
          </div>

          <div className="flex flex-col relative !overflow-visible">
            <label className="text-lg text-gray-[#666] mb-1">About</label>
            <span className="absolute right-0 top-1 text-xs text-gray-[#666]">
              {formData.about.length}/40
            </span>
            <textarea
              rows={3}
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              className={`w-full px-2 py-2 bg-transparent outline-none resize-none text-sm ${
                errors.about ? "text-red-500" : ""
              }`}
            />
            {errors.about && (
              <p className="text-red-500 text-xs mt-1">{errors.about}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
