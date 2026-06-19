import React from 'react';
import './ScrollingMarquee.css';

export default function ScrollingMarquee() {
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
    <div className="scrolling-marquee-container" aria-hidden="true">
      <div className="scrolling-marquee-track">
        {tripleItems.map((item, idx) => (
          <div key={idx} className="scrolling-marquee-item">
            <span>{item}</span>
            <span className="scrolling-marquee-star">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}
