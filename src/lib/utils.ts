import { clsx, type ClassValue } from "clsx";
import Cookies from "js-cookie";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAuth() {
  const id = Cookies.get("id");
  const token = Cookies.get("token");
  return { id, token };
}

// Convert file to base64 before calling
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

export const convertFilesToMediaFormat = (files: File[]) => {
  return Promise.all(
    files.map(async (file) => {
      // Read file as base64
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = () => {
          if (reader.result) {
            // Extract base64 data (remove data URL prefix)
            const base64Data = reader.result.toString().split(",")[1];

            resolve({
              Type: file.type,
              Content: base64Data,
            });
          } else {
            reject(new Error("Failed to read file"));
          }
        };

        reader.onerror = () => {
          reject(new Error("Error reading file"));
        };

        reader.readAsDataURL(file); // This reads the file as a data URL
      });
    })
  );
};

export const getAvatarUrl = (userId: number) => {
  const timestamp = `&v=${Math.floor(Date.now() / 60000)}`;
  return `/api/avatar/${userId}?size=96&q=30${timestamp}`;
};
