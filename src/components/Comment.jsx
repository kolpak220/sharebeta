import React, { useEffect, useCallback, useState } from "react";
import "./Comment.css";
const Comment = ({ comment, index }) => {
    return (
      <div 
        className="comment" 
        style={{ 
          animationDelay: `${index * 0.1}s` 
        }}
      >
        <strong className="author">@{comment.authorUserName}</strong>
        <p className="main-text">{comment.text}</p>
        <span className="date">{new Date(comment.createAt).toLocaleString()}</span>
      </div>
    );
  };
  
  export default Comment;
  