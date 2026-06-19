import React from 'react';
import './ScrollingMarquee.css';

export default function ScrollingMarquee({ onClose }) {
  const items = [
    "FREE SHIPPING ON ORDERS OVER ₹1999",
    "100% ORIGINAL AUTHENTIC FRAGRANCES",
    "LUXURY NIche & DESIGNER DECANTS",
    "SECURE CHECKOUT & FAST DISPATCH",
    "ORDER 5ML/10ML SAMPLES NOW"
  ];

  // Repeat items to ensure seamless infinite looping
  const tripleItems = [...items, ...items, ...items];

  return (
    <div className="scrolling-marquee-container">
      <div className="scrolling-marquee-track" aria-hidden="true">
        {tripleItems.map((item, idx) => (
          <div key={idx} className="scrolling-marquee-item">
            <span>{item}</span>
            <span className="scrolling-marquee-star">✦</span>
          </div>
        ))}
      </div>
      <button 
        className="scrolling-marquee-close" 
        onClick={onClose} 
        aria-label="Close announcement bar"
        title="Dismiss"
      >
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
