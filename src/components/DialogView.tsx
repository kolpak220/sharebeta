import React from "react";
import { Button } from "./ui/button";

export interface DialogProps {
  text?: string;
  title?: string;
  description?: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  captcha?: any;
  buttonFunc?: () => void;
  buttonText?: string;
}

export const DialogView: React.FC<DialogProps> = ({
  text,
  title,
  description,
  setOpen,
  captcha,
  buttonFunc,
  buttonText,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="glass-dark w-[90%] max-w-[400px] h-[200px] rounded-xl flex flex-col items-center justify-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          onClick={() => setOpen(false)}
          aria-label="Close dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="space-y-4 flex mt-5">
          {title && (
            <h2 className="text-xl font-bold text-white text-center">
              {title}
            </h2>
          )}

          {description && (
            <p className="text-gray-300 text-center">{description}</p>
          )}

          {text && <p className="text-gray-400 text-sm text-center">{text}</p>}
        </div>
        {buttonFunc && (
          <Button className="text-sm w-[150px] mt-5" onClick={buttonFunc}>
            {buttonText}
          </Button>
        )}
        {captcha && captcha}
      </div>
    </div>
  );
};
