import React, { useState } from "react";
import classes from "./StarRating.module.css";

export function StarRating({ 
  value = 0, 
  onRate, 
  interactive = true,
  size = "medium" 
}) {
  const [hoveredStar, setHoveredStar] = useState(0);

  function handleStarClick(starValue) {
    if (interactive && onRate) {
      onRate(starValue);
    }
  }

  function handleStarHover(starValue) {
    if (interactive) {
      setHoveredStar(starValue);
    }
  }

  function handleMouseLeave() {
    if (interactive) {
      setHoveredStar(0);
    }
  }

  const displayValue = hoveredStar || value;

  return (
    <div 
      className={`${classes.starRating} ${classes[size]}`}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${classes.star} ${interactive ? classes.interactive : ""}`}
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          disabled={!interactive}
          aria-label={`${star} 星`}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill={star <= displayValue ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

