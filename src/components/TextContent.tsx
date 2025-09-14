import { UIContext } from "@/contexts/UIContext";
import getUser from "@/services/getUser";
import { message } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
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

  const formatText = () => {
    if (!text) return null;
    const textWithLineBreaks = text.replace(/<br\s*\/?>/gi, '\n');
    
    const lines = textWithLineBreaks.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (!line) return <br key={lineIndex} />;
      
      const formattedLine = line
        .split(/([#@][а-яёa-z0-9_]+|https?:\/\/[^\s]+|www\.[^\s]+\.[^\s]+)/gi)
        .map((part, partIndex) => {
          if (!part) return null;

          if (part.startsWith("#") && /^#[а-яёa-z0-9_]+$/i.test(part)) {
            return (
              <span
                key={`${lineIndex}-${partIndex}`}
                className="text-blue-600 font-bold cursor-pointer hover:underline"
                onClick={() => handleTagClick(part)}
              >
                {part}
              </span>
            );
          } else if (part.startsWith("@") && /^@[a-z0-9_]+$/i.test(part)) {
            return (
              <span
                key={`${lineIndex}-${partIndex}`}
                className="text-blue-600 font-bold cursor-pointer hover:underline"
                onClick={() => handleTagClick(part)}
              >
                {part}
              </span>
            );
          } else if (/^(https?:\/\/|www\.)[^\s]+$/.test(part)) {
            return (
              <a
                key={`${lineIndex}-${partIndex}`}
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
          return <React.Fragment key={`${lineIndex}-${partIndex}`}>{part}</React.Fragment>;
        });

      return (
        <React.Fragment key={lineIndex}>
          {formattedLine}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div style={{ 
      color: "#fff",
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      lineHeight: '1.5'
    }}>
      <Paragraph
        ellipsis={{rows: 3, expandable: true, symbol: "more" }}
        style={{ 
          margin: 0,
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
      >
        {formatText()}
      </Paragraph>
    </div>
  );
};

export default TextContent;