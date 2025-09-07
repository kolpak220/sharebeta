import { UIContext } from "@/contexts/UIContext";
import getUser from "@/services/getUser";
import { message } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Typography from "antd/es/typography/Typography";
import React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

const TextContent: React.FC<{ text: string }> = ({ text }) => {
  const navigate = useNavigate();
  const ui = useContext(UIContext);

  const handleLinkClick = (link: string) => {
    copyToClipboard(link);
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      await message.info("Link copied!");
    } catch (err) {
      console.error(err);

      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  const loadOverlayByTag = async (user: string) => {
    const res = await getUser.getIdbyUser(user);
    if (!res) {
      message.error(`No user found: ${user}`);
      return;
    }
    navigate("/user/" + res.id);
  };

  const handleTagClick = (tag: string) => {
    if (tag.startsWith("#")) {
      ui?.toggleSearchOpen();
      ui?.setSearch(tag);
      // Navigate to hashtag page
    } else if (tag.startsWith("@")) {
      const formatted = tag.slice(1, tag.length);
      loadOverlayByTag(formatted);
    }
  };

  return (
    <>
      <Paragraph
        style={{ color: "#fff" }}
        ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
        
      >
        {text &&
          text
            .split(
              /([#@][а-яёa-z0-9_]+|https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)/gi
            )
            .map((part, index) => {
              if (!part) return null;

              if (part.startsWith("#") && /^#[а-яёa-z0-9_]+$/i.test(part)) {
                return (
                  <span
                    key={index}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => handleTagClick(part)}
                  >
                    {part}
                  </span>
                );
              } else if (part.startsWith("@") && /^@[a-z0-9_]+$/i.test(part)) {
                return (
                  <span
                    key={index}
                    className="text-blue-600 font-bold cursor-pointer hover:underline"
                    onClick={() => handleTagClick(part)}
                  >
                    {part}
                  </span>
                );
              } else if (/^(https?:\/\/|www\.)[^\s]+$/.test(part)) {
                return (
                  <a
                    key={index}
                    href={part}
                    className="text-links text-blue-500 underline cursor-pointer hover:text-blue-600"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      handleLinkClick(part);
                    }}
                  >
                    {part}
                  </a>
                );
              }
              return <React.Fragment key={index}>{part}</React.Fragment>;
            })}
      </Paragraph>
    </>
  );
};

export default TextContent;
