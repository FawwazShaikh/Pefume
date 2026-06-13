import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import './Navbar.css';

// SVG outline matching the exact custom tapered shopping bag from user's mockup
const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {/* Tapered and rounded bag body */}
    <path d="M 6.5,5.5 H 17.5 A 2,2 0 0,1 19.5,7.5 L 21,17.5 A 3.5,3.5 0 0,1 17.5,21 H 6.5 A 3.5,3.5 0 0,1 3,17.5 L 4.5,7.5 A 2,2 0 0,1 6.5,5.5 Z" />
    {/* Hanging handle */}
    <path d="M 8.5,5.5 A 3.5,3.5 0 0,0 15.5,5.5" />
  </svg>
);

export default function Navbar({ onNavigate, activePage, onSelectCategory, activeCategory }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(true);

  // Sync theme with HTML body attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', isThemeDark ? 'dark' : 'light');
  }, [isThemeDark]);

  const handleLinkClick = (e, hash) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    const policies = ['authenticity', 'about', 'shipping', 'returns', 'terms', 'privacy'];
    if (policies.includes(hash)) {
      window.location.hash = hash;
      if (onNavigate) onNavigate('policies');
    } else {
      window.location.hash = hash;
      if (onNavigate) onNavigate('home');
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

  const handleCategoryClick = (e, filterKey) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    if (onSelectCategory) {
      onSelectCategory(filterKey);
    }
    
    if (onNavigate) {
      onNavigate('home');
    }
    window.location.hash = 'collection';

    setTimeout(() => {
      const element = document.getElementById('collection');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
            <a href="#collection" className="nav-link">
              SHOP <i className="fas fa-chevron-down nav-chevron"></i>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'all')}>Shop All</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'decants')}>Decants</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'fullbottles')}>Full Bottles</a></li>
              <li className="dropdown-divider-item"></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'brands')}>Brands</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'families')}>Fragrance Families</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'newarrivals')}>New Arrivals</a></li>
            </ul>
          </li>

          <li className="nav-item dropdown">
            <a href="#collection" className="nav-link">
              CATEGORIES <i className="fas fa-chevron-down nav-chevron"></i>
            </a>
            <ul className="dropdown-menu">
              <li className="all-categories-link">
                <a href="#collection" onClick={(e) => handleCategoryClick(e, 'all')}>All Categories</a>
              </li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'summer')}>Summer Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'winter')}>Winter Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'office')}>Office Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'gym')}>Gym Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'datenight')}>Date Night Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'party')}>Party Perfumes</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'her')}>For Her</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'him')}>For Him</a></li>
            </ul>
          </li>

          {/* Gifting Dropdown */}
          <li className="nav-item dropdown">
            <a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')} className="nav-link">
              GIFTING <i className="fas fa-chevron-down"></i>
            </a>
            <ul className="dropdown-menu">
              <li><a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')}>Shop For Him</a></li>
              <li><a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')}>Shop For Her</a></li>
            </ul>
          </li>

          <li className="nav-item">
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')} className="nav-link">
              CREATORS
            </a>
          </li>

          <li className="nav-item">
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')} className="nav-link">
              TRACK ORDER
            </a>
          </li>
        </ul>

        {/* Right Nav Icons / Search */}
        <div className="nav-right">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input type="text" className="search-input" placeholder="Search perfumes, brands, notes..." />
          </div>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="nav-login-btn">LOGIN</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          
          <a href="#" className="nav-icon cart-icon" onClick={(e) => e.preventDefault()}>
            <ShoppingBagIcon className="w-5 h-5 nav-bag-icon" />
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
              CREATORS
            </a>
          </li>
          <li>
            <a href="#collection" onClick={(e) => handleLinkClick(e, 'collection')}>
              TRACK ORDER
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
