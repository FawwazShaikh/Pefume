import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collectionsData } from './SignatureCollection/CollectionData';
import './Navbar.css';

const ShoppingBagIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const collectionsMenuItems = [
  { id: 'all', label: 'All Collections', type: 'categories', filter: 'categories' },
  { id: 'summer', label: 'Summer', type: 'collection', filter: 'summer' },
  { id: 'winter', label: 'Winter', type: 'collection', filter: 'winter' },
  { id: 'office', label: 'Office', type: 'collection', filter: 'office' },
  { id: 'datenight', label: 'Date Night', type: 'collection', filter: 'datenight' },
  { id: 'her', label: 'For Her', type: 'collection', filter: 'her' },
  { id: 'him', label: 'For Him', type: 'collection', filter: 'him' }
];

export default function Navbar({ onNavigate, activePage, onSelectCategory, activeCategory }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeDark, setIsThemeDark] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isMobileCollectionsOpen, setIsMobileCollectionsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Luxury Collections Dropdown States & Handlers
  const [isCollectionsHovered, setIsCollectionsHovered] = useState(false);
  const [hoveredCollectionIndex, setHoveredCollectionIndex] = useState(null);
  const [focusedCollectionIndex, setFocusedCollectionIndex] = useState(-1);

  const handlePointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCollectionsKeyDown = (e) => {
    if (!isCollectionsHovered) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsCollectionsHovered(true);
        setFocusedCollectionIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCollectionIndex((prev) => (prev + 1) % collectionsMenuItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCollectionIndex((prev) => (prev - 1 + collectionsMenuItems.length) % collectionsMenuItems.length);
        break;
      case 'Escape':
        e.preventDefault();
        setIsCollectionsHovered(false);
        setFocusedCollectionIndex(-1);
        document.getElementById('nav-collections-trigger')?.focus();
        break;
      case 'Tab':
        setIsCollectionsHovered(false);
        setFocusedCollectionIndex(-1);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (focusedCollectionIndex >= 0 && isCollectionsHovered) {
      const el = document.querySelector(`.lux-dropdown-item[data-index="${focusedCollectionIndex}"]`);
      if (el) el.focus();
    }
  }, [focusedCollectionIndex, isCollectionsHovered]);

  useEffect(() => {
    document.body.setAttribute('data-theme', isThemeDark ? 'dark' : 'light');
  }, [isThemeDark]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const syncCart = () => {
      const count = parseInt(localStorage.getItem('cartCount') || '0');
      setCartCount(count);
    };
    syncCart();
    window.addEventListener('cart-updated', syncCart);
    return () => window.removeEventListener('cart-updated', syncCart);
  }, []);

  const handleLinkClick = (e, hash) => {
    if (e) e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    const policies = ['authenticity', 'about', 'shipping', 'returns', 'terms', 'privacy', 'reviews'];
    if (hash === 'cart') {
      window.location.hash = 'cart';
      if (onNavigate) onNavigate('cart');
    } else if (hash === 'categories') {
      window.location.hash = 'categories';
      if (onNavigate) onNavigate('categories');
    } else if (policies.includes(hash)) {
      window.location.hash = hash;
      if (onNavigate) onNavigate('policies');
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.location.hash = hash;
      if (onNavigate) {
        if (hash === 'collection' || hash === 'shop') onNavigate('shop');
        else onNavigate('home');
      }
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else if (hash === '') window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleCategoryClick = (e, filterKey) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    if (onSelectCategory) onSelectCategory(filterKey);
    if (onNavigate) onNavigate('shop');
    window.location.hash = 'collection';
    setTimeout(() => {
      const el = document.getElementById('collection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSearchProductClick = (product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (onSelectCategory) onSelectCategory('all');
    if (onNavigate) onNavigate('shop');
    window.location.hash = 'collection';
    setTimeout(() => {
      const el = document.getElementById('collection');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredProducts = collectionsData.filter(product => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      product.notes.some(n => n.toLowerCase().includes(q))
    );
  });

  return (
    <header className={`navbar-wrapper ${activePage === 'home' ? 'on-home' : ''} ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="nav-container">

          {/* Left: Hamburger (mobile) + Desktop menu */}
          <div className="nav-left">
            <button
              className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span /><span /><span />
            </button>

            <ul className="nav-menu">
              <li className="nav-item dropdown">
                <a href="#collection" className="nav-link" onClick={(e) => handleLinkClick(e, 'shop')}>
                  Shop <i className="fas fa-chevron-down nav-chevron" />
                </a>
                <ul className="dropdown-menu">
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'all')}>Shop All</a></li>
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'decants')}>Decants</a></li>
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'fullbottles')}>Full Bottles</a></li>
                  <li className="dropdown-divider" />
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'brands')}>Brands</a></li>
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'families')}>Fragrance Families</a></li>
                  <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'newarrivals')}>New Arrivals</a></li>
                </ul>
              </li>

              <li 
                className="nav-item dropdown"
                onMouseEnter={() => setIsCollectionsHovered(true)}
                onMouseLeave={() => { setIsCollectionsHovered(false); setFocusedCollectionIndex(-1); }}
                onKeyDown={handleCollectionsKeyDown}
              >
                <a 
                  id="nav-collections-trigger"
                  href="#categories" 
                  className="nav-link" 
                  onClick={(e) => handleLinkClick(e, 'categories')}
                  aria-haspopup="true"
                  aria-expanded={isCollectionsHovered}
                >
                  Collections <i className="fas fa-chevron-down nav-chevron" />
                </a>
                
                <AnimatePresence>
                  {isCollectionsHovered && (
                    <motion.div
                      className="lux-dropdown"
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      onPointerMove={handlePointerMove}
                      role="menu"
                      aria-label="Collections Submenu"
                    >
                      <div className="lux-dropdown-inner">
                        {/* Signature gold accent line */}
                        <div className="lux-gold-line" />

                        {/* Left column: categories list */}
                        <div className="lux-dropdown-list">
                          <span className="lux-dropdown-title">Collections</span>
                          <div className="lux-dropdown-items">
                            {collectionsMenuItems.map((item, idx) => {
                              const isHovered = hoveredCollectionIndex === idx;
                              return (
                                <a
                                  key={item.id}
                                  href={`#${item.filter}`}
                                  data-index={idx}
                                  className={`lux-dropdown-item ${isHovered ? 'hovered' : ''}`}
                                  onClick={(e) => {
                                    if (item.type === 'categories') {
                                      handleLinkClick(e, 'categories');
                                    } else {
                                      handleCategoryClick(e, item.filter);
                                    }
                                    setIsCollectionsHovered(false);
                                  }}
                                  onMouseEnter={() => {
                                    setHoveredCollectionIndex(idx);
                                    setFocusedCollectionIndex(idx);
                                  }}
                                  onMouseLeave={() => setHoveredCollectionIndex(null)}
                                  role="menuitem"
                                >
                                  <span className="item-label">{item.label}</span>
                                  <span className="item-arrow">→</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>

                        {/* Right column: luxury mini-mega menu storytelling preview */}
                        <div className="lux-dropdown-preview">
                          <div className="preview-content">
                            <span className="preview-subtitle">Curated Fragrance Journeys</span>
                            <p className="preview-tagline">
                              Discover fragrances crafted for every season, mood, and occasion.
                            </p>
                            <div className="preview-accent-flower" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>

              <li className="nav-item">
                <a href="#gifting" className="nav-link" onClick={(e) => handleLinkClick(e, 'gifting')}>Gifting</a>
              </li>

              <li className="nav-item">
                <a href="#collection" className="nav-link" onClick={(e) => handleCategoryClick(e, 'sets')}>Discovery Sets</a>
              </li>
            </ul>
          </div>

          {/* Center: Brand Logo */}
          <div className="logo-container" onClick={(e) => handleLinkClick(e, '')}>
            <span className="brand-name">DECANT ATELIER</span>
          </div>

          {/* Right: Action icons */}
          <div className="nav-right">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="nav-icon-btn" title="Login" aria-label="Login">
                  <i className="far fa-user-circle" />
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>

            <button className="nav-icon-btn" onClick={() => setIsSearchOpen(true)} title="Search" aria-label="Search">
              <i className="fas fa-search" />
            </button>

            <a href="#cart" className="nav-icon-btn cart-icon" onClick={(e) => handleLinkClick(e, 'cart')} aria-label="Cart">
              <ShoppingBagIcon className="nav-bag-icon" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </a>

            <button className="nav-icon-btn theme-toggle" onClick={() => setIsThemeDark(!isThemeDark)} title="Toggle theme" aria-label="Toggle theme">
              <i className={isThemeDark ? 'fas fa-sun' : 'fas fa-moon'} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen drawer */}
      <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <span className="brand-name">DECANT ATELIER</span>
          <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            <i className="fas fa-times" />
          </button>
        </div>
        <ul className="mobile-nav-list">
          <li>
            <button className={`mobile-accordion ${isMobileShopOpen ? 'expanded' : ''}`} onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}>
              Shop <i className="fas fa-chevron-down" />
            </button>
            <ul className={`mobile-sub ${isMobileShopOpen ? 'open' : ''}`}>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'all')}>Shop All</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'decants')}>Decants</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'fullbottles')}>Full Bottles</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'brands')}>Brands</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'newarrivals')}>New Arrivals</a></li>
            </ul>
          </li>
          <li>
            <button className={`mobile-accordion ${isMobileCollectionsOpen ? 'expanded' : ''}`} onClick={() => setIsMobileCollectionsOpen(!isMobileCollectionsOpen)}>
              Collections <i className="fas fa-chevron-down" />
            </button>
            <ul className={`mobile-sub ${isMobileCollectionsOpen ? 'open' : ''}`}>
              <li><a href="#categories" onClick={(e) => handleLinkClick(e, 'categories')}>All Collections</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'summer')}>Summer</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'winter')}>Winter</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'office')}>Office</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'datenight')}>Date Night</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'her')}>For Her</a></li>
              <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'him')}>For Him</a></li>
            </ul>
          </li>
          <li><a href="#gifting" onClick={(e) => handleLinkClick(e, 'gifting')}>Gifting</a></li>
          <li><a href="#collection" onClick={(e) => handleCategoryClick(e, 'sets')}>Discovery Sets</a></li>
          <li><a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About</a></li>
          <li><a href="#reviews" onClick={(e) => handleLinkClick(e, 'reviews')}>Reviews</a></li>
          <li><a href="#contact" onClick={(e) => handleLinkClick(e, 'contact')}>Contact</a></li>
        </ul>
      </div>

      {/* Search Drawer */}
      <div className={`search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <div className="search-container">
          <div className="search-header">
            <i className="fas fa-search search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search fragrances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={isSearchOpen}
            />
            <button className="search-close" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
              <i className="fas fa-times" />
            </button>
          </div>
          <div className="search-body">
            <div className="search-section">
              <h4 className="search-section-title">Trending</h4>
              <div className="search-pills">
                {['9 PM', 'Rare', 'Supremacy', 'Peach', 'Fruit'].map(p => (
                  <button key={p} className="search-pill" onClick={() => setSearchQuery(p)}>{p}</button>
                ))}
              </div>
            </div>
            <div className="search-section">
              <h4 className="search-section-title">Products</h4>
              <div className="search-grid">
                {filteredProducts.slice(0, 6).map(product => (
                  <div key={product.id} className="search-card" onClick={() => handleSearchProductClick(product)}>
                    <div className="search-card-img">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <span className="search-card-name">{product.name}</span>
                    <span className="search-card-price">₹ {(parseFloat(product.price) * 20).toLocaleString('en-IN')}.00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
