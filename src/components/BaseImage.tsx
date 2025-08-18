import React, { useState, useEffect } from "react";
import { UserRound } from "lucide-react";

interface Base64ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  base64String: string;
  mimeType?: string; // Deprecated, not used in new loading logic
  debug?: boolean;
  className?: string;
  fallbackSrc?: string;
}

const Base64Image: React.FC<Base64ImageProps> = ({
  base64String,
  mimeType, // No longer used in the loading logic
  debug = false,
  fallbackSrc = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYWFhIj5JbWFnZSBFcnJvcjwvdGV4dD48L3N2Zz4=",
  className = "",
  alt = "Base64 image",
  ...props
}) => {
  const [src, setSrc] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [currentMimeType, setCurrentMimeType] = useState<
    "image/png" | "image/jpeg"
  >("image/png");

  // Reset state when base64 string changes
  useEffect(() => {
    if (debug)
      console.log("[Base64Image] Base64 string changed - resetting loader");
    setCurrentMimeType("image/png");
    setError(false);
  }, [base64String, debug]);

  // Generate image source
  useEffect(() => {
    if (!base64String) {
      if (debug) console.warn("Empty base64String - showing fallback");
      setError(true);
      return;
    }

    try {
      let imageSrc = base64String;
      const hasDataPrefix = base64String.startsWith("data:");

      if (!hasDataPrefix) {
        imageSrc = `data:${currentMimeType};base64,${base64String}`;
        if (debug)
          console.log(
            `Generated source with ${currentMimeType}`,
            imageSrc.substring(0, 30)
          );
      } else {
        if (debug)
          console.log("Using existing data URI", imageSrc.substring(0, 30));
      }

      setSrc(imageSrc);
      setError(false);
    } catch (e) {
      if (debug) console.error("Base64 processing error", e);
      setError(true);
    }
  }, [base64String, currentMimeType, debug]);

  // Debug logging
  useEffect(() => {
    if (!debug) return;

    console.groupCollapsed("[Base64Image] Debug Info");
    console.log("Current MIME type:", currentMimeType);
    console.log(
      "Base64 string:",
      base64String ? `${base64String.substring(0, 30)}...` : "EMPTY"
    );
    console.log("Generated src:", src ? `${src.substring(0, 30)}...` : "EMPTY");
    console.log("Error state:", error);

    if (base64String) {
      const sizeKB = Math.round((base64String.length * 3) / 4 / 1024);
      console.log("Approx. size:", `${sizeKB} KB`);
    }
    console.groupEnd();
  }, [base64String, debug, src, error, currentMimeType]);

  // Handle image loading errors
  const handleImageError = () => {
    if (debug) console.error(`Image load failed for ${currentMimeType}`);

    const hasDataPrefix = base64String.startsWith("data:");

    if (hasDataPrefix) {
      // Can't retry if we already have a data URI
      setError(true);
    } else {
      if (currentMimeType === "image/png") {
        if (debug) console.log("Trying JPEG fallback");
        setCurrentMimeType("image/jpeg");
      } else {
        setError(true);
      }
    }
  };

  const displaySrc = error ? fallbackSrc : src;

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={`${className} ${error ? "base64-image-error" : ""}`}
      onError={handleImageError}
      {...props}
    />
  );
};

export default Base64Image;
