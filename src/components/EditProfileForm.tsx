import React, { useState } from "react";

export interface EditProfileData {
  userName: string;
  name: string;
  about: string;
}

interface FormErrors {
  userName?: string;
  name?: string;
  about?: string;
}

interface EditProfileFormProps {
  initialData: EditProfileData;
  onSubmit?: (Formdata: EditProfileData) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<EditProfileData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<Record<string, boolean>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    errors[name as keyof FormErrors] &&
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFocused((prev) => ({ ...prev, [e.target.name]: true }));
    // Select all text on focus
    e.target.select();
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFocused((prev) => ({ ...prev, [e.target.name]: false }));
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.userName) {
      newErrors.userName = "Required";
    } else if (formData.userName.length < 3) {
      newErrors.userName = "Min 3 chars";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.userName)) {
      newErrors.userName = "Only Latin letters and numbers";
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = "Required";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.name)) {
      newErrors.name = "Only Latin letters and numbers";
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    Object.keys(newErrors).length > 0
      ? setErrors(newErrors)
      : onSubmit?.(formData);
  };

  const renderInput = (
    name: keyof EditProfileData,
    label: string,
    type: string = "text",
    isTextarea: boolean = false
  ) => {
    const Component = isTextarea ? "textarea" : "input";

    return (
      <div className="relative !overflow-visible">
        <label
          className={`absolute left-2 pointer-events-none transition-all duration-200 ease-in-out ${
            focused[name] || formData[name]
              ? "text-xs -translate-y-5 text-white"
              : "text-sm text-gray-400"
          }`}
        >
          {label}
        </label>
        <div className="flex items-center">
          <Component
            {...(isTextarea ? { rows: 3 } : { type })}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`flex-1 px-2 py-1 text-sm bg-transparent border-b border-gray-300 focus:border-white outline-none transition-all resize-none ${
              errors[name] ? "text-red-500 border-red-500" : ""
            }`}
          />
        </div>

        {errors[name] && (
          <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-xs">
      <div className="relative !overflow-visible mt-10">
        {renderInput("userName", "Username")}
      </div>
      <div className="relative !overflow-visible">
        {renderInput("name", "Full Name")}
      </div>
      <div className="relative !overflow-visible">
        {renderInput("about", "About", "text", true)}
      </div>
      <button
        type="submit"
        className="font-bold w-[50%] bg-white text-gray-800 p-3 rounded text-sm transition-colors mt-4"
      >
        Save Changes
      </button>
    </form>
  );
};

export default EditProfileForm;
