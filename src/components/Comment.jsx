import React, { useState } from "react";
import { Heart } from "lucide-react";
import "./Comment.css";

const Comment = ({ comment, index }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const commentDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - commentDate) / 1000);

    if (diffInSeconds < 60) {
      return "только что";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${getMinutesForm(diffInMinutes)} назад`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${getHoursForm(diffInHours)} назад`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${getDaysForm(diffInDays)} назад`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} ${getWeeksForm(diffInWeeks)} назад`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} ${getMonthsForm(diffInMonths)} назад`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${getYearsForm(diffInYears)} назад`;
  };

  const getMinutesForm = (minutes) => {
    if (minutes === 1) return "минуту";
    if (minutes >= 2 && minutes <= 4) return "минуты";
    return "минут";
  };

  const getHoursForm = (hours) => {
    if (hours === 1) return "час";
    if (hours >= 2 && hours <= 4) return "часа";
    return "часов";
  };

  const getDaysForm = (days) => {
    if (days === 1) return "день";
    if (days >= 2 && days <= 4) return "дня";
    return "дней";
  };

  const getWeeksForm = (weeks) => {
    if (weeks === 1) return "неделю";
    if (weeks >= 2 && weeks <= 4) return "недели";
    return "недель";
  };

  const getMonthsForm = (months) => {
    if (months === 1) return "месяц";
    if (months >= 2 && months <= 4) return "месяца";
    return "месяцев";
  };

  const getYearsForm = (years) => {
    if (years === 1) return "год";
    if (years >= 2 && years <= 4) return "года";
    return "лет";
  };

  return (
    <div 
      className="comment" 
      style={{ 
        animationDelay: `${index * 0.1}s` 
      }}
    >
      <div className="comment-header">
        <strong className="author">@{comment.authorUserName}</strong>
        <span className="date">{formatTimeAgo(comment.createAt)}</span>
      </div>
      <p className="main-text">{comment.text}</p>
      <div className="comment-actions">
        <button 
          className={`comment-like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          <Heart 
            size={16} 
            fill={isLiked ? "currentColor" : "none"}
          />
          <span className="like-count">{formatNumber(likesCount)}</span>
        </button>
      </div>
    </div>
  );
};

export default Comment;
  