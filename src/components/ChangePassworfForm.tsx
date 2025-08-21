import React, { useState } from "react";

interface FormData {
  current: string;
  new: string;
  confirm: string;
}

export type ChangePwFormData = FormData;

interface FormErrors {
  current?: string;
  new?: string;
  confirm?: string;
}

interface ChangePasswordFormProps {
  onSubmit?: (FormData: FormData) => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
}) => {
  const [formData, setFormData] = useState<FormData>({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    errors[name as keyof FormErrors] &&
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) =>
    setFocused((prev) => ({ ...prev, [e.target.name]: true }));
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) =>
    setFocused((prev) => ({ ...prev, [e.target.name]: false }));
  const togglePassword = (field: keyof FormData) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.current) newErrors.current = "Required";
    if (!formData.new) newErrors.new = "Required";
    else if (formData.new.length < 6) newErrors.new = "Min 6 chars";
    if (formData.new !== formData.confirm) newErrors.confirm = "No match";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    Object.keys(newErrors).length > 0
      ? setErrors(newErrors)
      : onSubmit?.(formData);
  };

  const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-400"
    >
      {isVisible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );

  const renderInput = (name: keyof FormData, label: string) => (
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
        <input
          type={showPassword[name] ? "text" : "password"}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`flex-1 px-2 py-1 text-sm bg-transparent border-b border-gray-300 focus:border-white outline-none transition-all ${
            errors[name] ? "text-red-500 border-red-500" : ""
          }`}
        />
        <button
          type="button"
          onClick={() => togglePassword(name)}
          className="ml-2 bg-transparent border-none cursor-pointer p-0"
        >
          <EyeIcon isVisible={showPassword[name]} />
        </button>
      </div>

      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10 w-full max-w-xs">
      <div className="relative !overflow-visible mt-10">
        {renderInput("current", "Current Password")}
      </div>
      <div className="relative !overflow-visible">
        {renderInput("new", "New Password")}
      </div>
      <div className="relative !overflow-visible">
        {renderInput("confirm", "Confirm New Password")}
      </div>
      <button
        type="submit"
        className="font-bold w-[50%] bg-white text-gray-800 p-3 rounded text-sm transition-colors mt-4"
      >
        Change Password
      </button>
    </form>
  );
};

export default ChangePasswordForm;
