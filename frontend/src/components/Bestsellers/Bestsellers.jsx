import { useState } from "react";
import "./Bestsellers.css";
import { BestsellersData } from "./BestsellersData";

function Bestsellers() {
  return (
    <section id="collection" className="collection">
      <div className="bestsellers-header">
        <span className="bestsellers-eyebrow">★ Most Loved ★</span>
        <h2 className="section-title">Bestsellers</h2>
        <p className="section-subtitle">
          Discover our most-loved fragrances, crafted for those who appreciate luxury and lasting impressions.
        </p>
        <div className="bestsellers-divider"></div>
      </div>
      <div className="collection-grid">
        {BestsellersData.map((product) => (
          <BestsellersCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function BestsellersCard({ product }) {
  const [selectedSize, setSelectedSize] = useState("5ML");

  return (
    <div className="collection-card">
      <span className="card-badge">{product.badge}</span>
      <div className="card-image-wrap">
        <img src={product.image} alt={product.name} className="card-img" />
      </div>
      <p className="card-collection-label">{product.collectionLabel}</p>
      <h3 className="card-title">{product.name}</h3>
      <p className="card-description">{product.description}</p>
      <p className="card-price">₹{product.price}</p>
      <div className="card-sizes">
        {product.sizes.map((size) => (
          <button
            key={size}
            className={`size-pill ${selectedSize === size ? "active" : ""}`}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <button className="cta-btn">ADD TO CART</button>
    </div>
  );
}

export default Bestsellers;
