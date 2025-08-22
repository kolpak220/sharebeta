import React, { useEffect, useRef, useState } from "react";
import { X, Image } from "lucide-react";
import styles from "./NewPost.module.css";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

const MAX_FILES = 10;

interface MediaFile {
  file: File;
  type: "image" | "video";
  preview: string;
}

// Получение значения куки по имени
const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
};

const NewPost: React.FC = () => {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  const handleAttachClick = () => {
    if (mediaFiles.length >= MAX_FILES) {
      alert(`You can attach maximum of ${MAX_FILES} files`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: MediaFile[] = Array.from(e.target.files)
        .filter(
          (file) =>
            file.type.startsWith("image/") || file.type.startsWith("video/")
        )
        .map((file) => ({
          file,
          type: file.type.startsWith("image/") ? "image" : "video",
          preview: URL.createObjectURL(file),
        }));

      setMediaFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
      e.target.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeployPost = async () => {
    message.loading("Uploading...");

    if (isSending) return;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const token = getCookie("token");
    const userId = getCookie("id");

    if (!token || !userId) {
      window.location.reload();
      return;
    }

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("Token", token);
      formData.append("UserId", userId);
      formData.append("Text", textarea.value);

      // Добавляем каждый файл с ключом "Medias" (без скобок)
      mediaFiles.forEach((m, index) => {
        formData.append(`Medias`, m.file); // или "Medias[]" если сервер ожидает такой формат
      });

      const response = await fetch("/api/createpost/create-form", {
        method: "POST",
        body: formData,
        // Не устанавливаем Content-Type вручную - браузер сделает это сам с boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error ${response.status}`);
      }

      const result = await response.json();

      // Очистка после успешной отправки
      textarea.value = "";
      setMediaFiles([]);
      setIsSending(false);
      navigate("/");
    } catch (err: any) {
      setIsSending(false);

      // Extract only the first part of the error message
      let errorMessage = "An error occurred";

      if (err.message) {
        // Split by "code:" and take the first part, then clean it up
        const parts = err.message.split(" code:");
        errorMessage = parts[0].replace("Error: Server error: ", "").trim();
      }

      // Or simpler approach - just get the first meaningful part
      if (err.message) {
        // Remove "Error: Server error: " prefix and take everything before " code:"
        const match = err.message.match(
          /Error: Server error: (.*?)(?: code:|$)/
        );
        if (match && match[1]) {
          errorMessage = match[1].trim();
        }
      }
      if (errorMessage.includes("429")) {
        errorMessage = "Error: too many requests, try in one minute";
      }
      message.error(errorMessage);
    }
  };

  return (
    <>
      <div className={styles.newPage}>
        <h2 className={styles.title}>Create new post</h2>

        <textarea
          ref={textareaRef}
          className={styles.Input}
          placeholder="What's interesting with you?"
          rows={1}
          onInput={handleInput}
        />

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleAttachClick}
            className={styles.attachButton}
            disabled={mediaFiles.length >= MAX_FILES || isSending}
          >
            <Image size={18} />
            {mediaFiles.length >= MAX_FILES ? "Max reached" : "Attach"}
          </button>
          <button className={styles.createButton} onClick={handleDeployPost}>
            {isSending ? "Sending..." : "Deploy post"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFilesChange}
        />

        {mediaFiles.length > 0 && (
          <div className={styles.previewWrapper}>
            <div className={styles.previewContainer}>
              {mediaFiles.map((m, idx) => (
                <div key={idx} className={styles.previewItem}>
                  {m.type === "image" ? (
                    <img
                      src={m.preview}
                      alt={m.file.name}
                      className={styles.previewImg}
                    />
                  ) : (
                    <video
                      src={m.preview}
                      className={styles.previewImg}
                      muted
                    />
                  )}
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveFile(idx)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NewPost;
