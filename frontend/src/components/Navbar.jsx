import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ onNavigate, activePage }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(true);

  // Sync theme with HTML body attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', isThemeDark ? 'dark' : 'light');
  }, [isThemeDark]);

  const handleLinkClick = (e, hash) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Check if the hash corresponds to a policy page
    const policies = ['authenticity', 'about', 'shipping', 'returns', 'terms', 'privacy'];
    if (policies.includes(hash)) {
      window.location.hash = hash;
      if (onNavigate) onNavigate('policies');
    } else {
      window.location.hash = hash;
      if (onNavigate) onNavigate('home');
      // Scroll to target if on homepage
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (hash === '') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <div className="logo-container" onClick={(e) => handleLinkClick(e, '')}>
          <span className="brand-name">DECANT ATELIER</span>
        </div>

        {/* Desktop Menu */}
        <ul className="nav-menu">
          <li className="nav-item dropdown">
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')} className="nav-link">
              SHOP <i className="fas fa-chevron-down"></i>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>All Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Best Sellers</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>New Arrivals</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Limited Edition</a></li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')} className="nav-link">
              CATEGORIES <i className="fas fa-chevron-down"></i>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Eau de Parfum</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Eau de Toilette</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Luxury Fragrances</a></li>
              <li><a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>Niche Collections</a></li>
            </ul>
          </li>

          {/* Gifting added right after Categories */}
          <li className="nav-item">
            <a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')} className="nav-link">
              GIFTING
            </a>
          </li>

          <li className="nav-item">
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')} className="nav-link">
              TRACK ORDER
            </a>
          </li>

          <li className="nav-item">
            <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')} className="nav-link">
              CONTACT US
            </a>
          </li>
        </ul>

        {/* Right Nav Icons */}
        <div className="nav-right">
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Search perfumes, brands, notes..." />
            <button className="search-btn"><i class="fas fa-search"></i></button>
          </div>
          
          <a href="#" className="nav-icon" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-user"></i> LOGIN
          </a>
          
          <a href="#" className="nav-icon cart-icon" onClick={(e) => e.preventDefault()}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-count">0</span>
          </a>

          <button 
            className="theme-toggle" 
            onClick={() => setIsThemeDark(!isThemeDark)} 
            title="Toggle theme"
          >
            <i className={isThemeDark ? "fas fa-sun" : "fas fa-moon"}></i>
          </button>
        </div>

        {/* Hamburger Menu Icon */}
        <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-list">
          <li>
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>
              SHOP ALL
            </a>
          </li>
          <li>
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>
              CATEGORIES
            </a>
          </li>
          <li>
            <a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')}>
              GIFTING
            </a>
          </li>
          <li>
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>
              TRACK ORDER
            </a>
          </li>
          <li>
            <a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>
              CONTACT US
            </a>
          </li>
          <li>
            <hr className="mobile-divider" />
          </li>
          <li>
            <div className="mobile-search">
              <input type="text" placeholder="Search..." />
              <button><i className="fas fa-search"></i></button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
