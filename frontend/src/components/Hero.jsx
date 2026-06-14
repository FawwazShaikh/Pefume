import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      {/* Background radial glow */}
      <div className="hero-glow" />
      
      <div className="hero-content">
        {/* Left Side Text Content */}
        <div className="hero-text">
          <div className="hero-monogram">
            <svg width="44" height="44" viewBox="0 0 100 100" fill="none" className="monogram-svg">
              <path d="M50 5 L95 80 L5 80 Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <path d="M50 22 L80 72 L20 72 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <text x="50" y="65" fontSize="24" fontFamily="var(--font-heading)" fill="currentColor" textAnchor="middle" fontWeight="bold">V</text>
            </svg>
          </div>
          
          <h1 className="hero-title">
            Fragrance in <br />
            every bottle
          </h1>
          
          <p className="hero-subtitle">
            Decant Atelier transcends time, offering a timeless charm. Each scent is designed to create a classic feel that remains relevant in every era.
          </p>
          
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
              Explore <span className="btn-arrow">↗</span>
            </button>
            <button className="btn btn-secondary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
              Best Seller
            </button>
          </div>
        </div>

        {/* Right Side Product Showcase */}
        <div className="hero-image">
          <div className="product-stage-wrapper">
            <div className="product-stage-glow"></div>
            <img src="/valentino_hero.png" alt="Valentino Born In Roma" className="stage-product-img" />
          </div>
        </div>
      </div>
    </section>
  );
}
