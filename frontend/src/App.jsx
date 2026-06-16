import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SignatureCollection from './components/SignatureCollection';
import Gifting from './components/Gifting';
import Pricing from './components/Pricing';
import Authenticity from './components/Authenticity';
import PoliciesPage from './components/Policies';
import Footer from './components/Footer';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import CategoriesPage from './components/CategoriesPage';
import { collectionsData } from './components/SignatureCollection/CollectionData';

function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    const policies = ['authenticity', 'about', 'shipping', 'returns', 'terms', 'privacy'];

    if (policies.includes(hash)) return 'policies';
    if (hash === 'shop' || hash === 'collection') return 'shop';
    if (hash === 'cart') return 'cart';
    if (hash === 'categories') return 'categories';
    if (hash.startsWith('product-')) return 'product';

    return 'home';
  };

  const [activePage, setActivePage] = useState(getPageFromHash);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      const page = getPageFromHash();
      setActivePage(page);

      const hash = window.location.hash.replace('#', '');

      if (hash.startsWith('product-')) {
        const id = hash.replace('product-', '');
        const foundProduct = collectionsData.find(
          (p) => String(p.id) === String(id)
        );

        if (foundProduct) {
          setSelectedProduct(foundProduct);
        }
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  return (
    <div className="flex flex-col gap-0 min-h-screen">
      <Navbar
        onNavigate={setActivePage}
        activePage={activePage}
        onSelectCategory={setActiveCategory}
        activeCategory={activeCategory}
      />

      {activePage === 'home' && (
        <>
          <Hero />
          <Gifting
            onSelectCategory={setActiveCategory}
            onNavigate={setActivePage}
          />
          <Pricing />
          <Authenticity />
        </>
      )}

      {activePage === 'shop' && (
        <SignatureCollection
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
      )}

      {activePage === 'product' && (
        <ProductPage
          product={selectedProduct}
          onBackToShop={() => {
            window.location.hash = 'shop';
          }}
        />
      )}

      {activePage === 'cart' && (
        <CartPage
          onBackToShop={() => {
            window.location.hash = 'shop';
          }}
        />
      )}

      {activePage === 'policies' && <PoliciesPage />}

      {activePage === 'categories' && (
        <CategoriesPage
          onSelectCategory={(categoryKey) => {
            setActiveCategory(categoryKey);
            setActivePage('shop');
            window.location.hash = 'collection';
          }}
        />
      )}

      <Footer onNavigate={setActivePage} />
    </div>
  );
}

export default App;