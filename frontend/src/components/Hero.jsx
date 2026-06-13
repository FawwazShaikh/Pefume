import './Hero.css';

export default function Hero() {
  return (
    <section id="hero" className="hero">
      {/* Background radial glow */}
      <div className="hero-glow" />
      
      <div className="hero-content">
        {/* Left Side Text Content */}
        <div className="hero-text">
          <p className="hero-tagline">Est. 2026 &nbsp;·&nbsp; Luxury Fragrances</p>
          <h1 className="hero-title">
            Rare Fragrances
            <span>Perfectly Yours</span>
          </h1>
          <p className="hero-subtitle">
            Discover our curated collection of niche and luxury fragrances — each bottle a story, each note a memory waiting to be made.
          </p>
          <div className="hero-divider"></div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Verified Originals</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5 / 8 / 10 ml</span>
              <span className="stat-label">Trial Sizes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Pan-India</span>
              <span className="stat-label">Delivery</span>
            </div>
          </div>
          
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-shopping-bag" style={{ marginRight: '0.5rem' }}></i>Shop Now
            </button>
            <button className="btn btn-secondary" onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}>
              <i className="fas fa-play-circle" style={{ marginRight: '0.5rem' }}></i>Explore
            </button>
          </div>
        </div>

        {/* Right Side Video/Image Content */}
        <div className="hero-image">
          <div className="video-wrapper">
            <div className="video-frame">
              <video className="hero-video" autoPlay muted loop playsInline>
                <source src="/F1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Badge inside video */}
              <div className="video-badge">
                <span className="badge-dot"></span>
                <div className="badge-text">
                  <strong>New Arrivals</strong>
                  Summer 2026 Collection
                </div>
              </div>
            </div>
            
            {/* Side floating tag */}
            <div className="video-tag">Premium &nbsp; Niche</div>
          </div>
        </div>
      </div>
    </section>
  );
}
