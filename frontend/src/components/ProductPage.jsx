import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart, getCart } from '../utils/cartHelper';
import { showToast } from '../utils/toast';
import { collectionsData } from './SignatureCollection/CollectionData';

export default function ProductPage({ product: initialProduct, products = [], onBackToShop }) {
  const { isSignedIn, getToken } = useAuth();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);

  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedBottle, setSelectedBottle] = useState('classic');
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState(getCart());
  const [detectedAspect, setDetectedAspect] = useState('aspect-[1/1]');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState('story');
  const [imageErrors, setImageErrors] = useState({});

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Reviews submission state variables
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Sync prop changes to state
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
    }
  }, [initialProduct]);

  const fetchProductDetails = async () => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('product-')) {
      const slug = hash.replace('product-', '');
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/products/${slug}`);
        if (res.ok) {
          const dbProduct = await res.json();

          // Normalize images: the single-product API returns ProductImage objects
          // [{id, productId, imageUrl, altText, position}], but the list API returns
          // plain URL strings. We normalize here so galleryImages always gets strings.
          const normalizedImages = Array.isArray(dbProduct.images)
            ? dbProduct.images.map(img =>
                typeof img === 'string' ? img : (img.imageUrl || img.url || '')
              ).filter(Boolean)
            : [];
          const normalizedImage = normalizedImages[0] || dbProduct.image || null;

          const staticProd = collectionsData.find(sp => sp.slug === dbProduct.slug || sp.id === dbProduct.id);
          
          let merged = {};
          if (staticProd) {
            merged = {
              ...staticProd,
              ...dbProduct,
              // Always use normalized images; fall back to static if DB has none
              image: normalizedImage || staticProd.image,
              images: normalizedImages.length > 0 ? normalizedImages : staticProd.images,
              sizes: dbProduct.variants && dbProduct.variants.length > 0
                ? dbProduct.variants.map(v => ({
                    size: v.size,
                    price: parseFloat(v.price),
                    label: v.size.includes('2ml') ? 'Perfect for testing' : 
                           v.size.includes('5ml') ? 'Travel friendly' : 
                           v.size.includes('10ml') ? 'Best value' : 'Collector size',
                    stock: v.stock,
                    sku: v.sku,
                    variantId: v.id
                  }))
                : staticProd.sizes
            };
          } else {
            merged = {
              tagline: dbProduct.brand || 'Premium Fragrance',
              notes: [],
              tags: dbProduct.featured ? ['featured'] : [],
              pyramid: {
                top: 'Fresh top notes',
                heart: 'Aromatic heart notes',
                base: 'Long-lasting base notes'
              },
              characteristics: {
                longevity: '8+ Hours',
                sillage: 'Moderate',
                gender: 'Unisex'
              },
              retailPrice: parseFloat(dbProduct.price) * 1.5,
              competitorPrice: parseFloat(dbProduct.price) * 1.25,
              ...dbProduct,
              image: normalizedImage,
              images: normalizedImages,
              sizes: dbProduct.variants ? dbProduct.variants.map(v => ({
                size: v.size,
                price: parseFloat(v.price),
                label: v.size.includes('2ml') ? 'Perfect for testing' : 
                       v.size.includes('5ml') ? 'Travel friendly' : 
                       v.size.includes('10ml') ? 'Best value' : 'Collector size',
                stock: v.stock,
                sku: v.sku,
                variantId: v.id
              })) : []
            };
          }
          setProduct(merged);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch product from backend slug
  useEffect(() => {
    fetchProductDetails();

    const handleHashChange = () => {
      fetchProductDetails();
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [initialProduct]);

  // Reset quantity on option change
  useEffect(() => {
    setQuantity(1);
  }, [product, selectedSizeIndex]);

  // Sync cart items dynamically
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems(getCart());
    };
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSizeIndex(0);
    setActiveImageIndex(0);
    setDetectedAspect('aspect-[1/1]');
    setImageErrors({});
    setIsLightboxOpen(false);
    setIsZoomed(false);
    setIsImageLoading(true);
  }, [product]);

  // Set image loading state to true on active image change
  useEffect(() => {
    setIsImageLoading(true);
  }, [activeImageIndex]);

  // Selected option details
  const selectedOption = useMemo(() => {
    if (!product || !product.sizes || product.sizes.length === 0) return null;
    return product.sizes[selectedSizeIndex] || product.sizes[0];
  }, [product, selectedSizeIndex]);

  const existingCartItem = useMemo(() => {
    if (!product || !selectedOption) return null;
    const sizeLabel = selectedOption.size || 'Default Size';
    return cartItems.find(item => {
      if (item.variantId && selectedOption.variantId && item.variantId === selectedOption.variantId) {
        return true;
      }
      const itemProdId = item.productId || item.id;
      const currProdId = product.id || product.productId;
      return itemProdId === currProdId && item.size === sizeLabel;
    });
  }, [cartItems, product, selectedOption]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [product.image];
  }, [product]);

  // Compute product reviews and average rating
  const reviews = useMemo(() => {
    return product?.reviews || [];
  }, [product]);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  }, [reviews]);

  const getLongevityRating = (val = '') => {
    const text = String(val).toLowerCase();
    if (text.includes('12+') || text.includes('eternal')) return 5;
    if (text.includes('10+')) return 5;
    if (text.includes('9+') || text.includes('8+')) return 4;
    if (text.includes('6+')) return 3;
    if (text.includes('4+')) return 2;
    return 3;
  };

  const getSillageRating = (val = '') => {
    const text = String(val).toLowerCase();
    if (text.includes('heavy') || text.includes('strong')) return 5;
    if (text.includes('moderate')) return 3;
    if (text.includes('soft') || text.includes('intimate')) return 2;
    return 3;
  };

  const bundleProduct = useMemo(() => {
    if (!product || products.length === 0) return null;
    const sameGender = products.filter(p => p.id !== product.id && p.category === 'decants');
    return sameGender[0] || products.find(p => p.id !== product.id);
  }, [product, products]);

  const similarProducts = useMemo(() => {
    if (!product || products.length === 0) return [];
    return products
      .filter(p => p.id !== product.id && (p.category === product.category || p.brand === product.brand || (p.tags && p.tags.includes(product.tags[0]))))
      .slice(0, 5);
  }, [product, products]);

  // Review submission handler
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);
    setIsSubmittingReview(true);

    try {
      const token = await getToken();
      if (!token) {
        setReviewError('You must be signed in to submit a review.');
        setIsSubmittingReview(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });

      if (res.ok) {
        setReviewSuccess(true);
        setReviewTitle('');
        setReviewComment('');
        setReviewRating(5);
        fetchProductDetails();
      } else {
        const data = await res.json();
        setReviewError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleNextImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    setIsZoomed(false);
  };

  const handlePrevImage = () => {
    if (galleryImages.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    setIsZoomed(false);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryImages]);

  // Touch handlers for Lightbox swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNextImage();
    } else if (isRightSwipe) {
      handlePrevImage();
    }
  };

  // Competitor equivalents for different sizes
  const competitorPriceForSize = useMemo(() => {
    if (!product || !selectedOption) return 0;
    // Extract size number
    const sizeMl = parseInt(selectedOption.size) || 2;
    if (product.id === 'baccarat-rouge-540' && sizeMl === 2) {
      return 1750;
    }
    const baseCompetitor = product.competitorPrice || Math.round(product.price * 1.18);
    // Scale competitor price based on ml (traditional decants charge more per ml for smaller sizes)
    const ratio = sizeMl / 2;
    // Apply a sliding scale for larger sizes
    const scaleFactor = ratio > 1 ? Math.pow(ratio, 0.9) : ratio;
    return Math.round((baseCompetitor * scaleFactor) / 10) * 10;
  }, [product, selectedOption]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-body">
        <h3 className="font-heading text-2xl font-bold text-[#0F3D3E] mb-2">Scents Not Loaded</h3>
        <button onClick={onBackToShop} className="px-6 py-2.5 bg-[#0F3D3E] text-white rounded-full text-xs font-bold uppercase tracking-wider">
          Return to Shop
        </button>
      </div>
    );
  }

  // Handle Add to Cart
  const handleAddToCart = async () => {
    setIsAdding(true);
    
    const token = isSignedIn ? await getToken() : null;
    await addToCart(product, selectedOption, quantity, token);

    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 500);
  };

  // Pricing calculations
  const bottleRetailPrice = product.retailPrice || (product.price * 20);
  const selectedSizePrice = selectedOption ? selectedOption.price : product.price;

  const savingsAmount = competitorPriceForSize - selectedSizePrice;
  const savingsPercent = Math.round((savingsAmount / competitorPriceForSize) * 100);

  const renderTrustSection = () => {
    return (
      <div className="mt-16 pt-12 border-t border-black/6 text-[#1C1B18] font-body select-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          <div className="bg-[#FEFCF9] border border-black/5 p-5 flex flex-col items-start gap-3 text-left">
            <i className="fa-solid fa-flask text-lg text-[#B08A50]"></i>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">Sterile Filling</h6>
              <p className="text-[0.68rem] text-black/55 mt-1 leading-relaxed">
                Medical-grade siphoning process.
              </p>
            </div>
          </div>

          <div className="bg-[#FEFCF9] border border-black/5 p-5 flex flex-col items-start gap-3 text-left">
            <i className="fa-solid fa-microscope text-lg text-[#B08A50]"></i>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">Batch Verified</h6>
              <p className="text-[0.68rem] text-black/55 mt-1 leading-relaxed">
                Tracked to original retail source.
              </p>
            </div>
          </div>

          <div className="bg-[#FEFCF9] border border-black/5 p-5 flex flex-col items-start gap-3 text-left">
            <i className="fa-solid fa-magnifying-glass text-lg text-[#B08A50]"></i>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">Hand Inspected</h6>
              <p className="text-[0.68rem] text-black/55 mt-1 leading-relaxed">
                Every bottle checked before dispatch.
              </p>
            </div>
          </div>

          <div className="bg-[#FEFCF9] border border-black/5 p-5 flex flex-col items-start gap-3 text-left">
            <i className="fa-solid fa-shield-halved text-lg text-[#B08A50]"></i>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">Leak Tested</h6>
              <p className="text-[0.68rem] text-black/55 mt-1 leading-relaxed">
                Pressure-tested before shipment.
              </p>
            </div>
          </div>

          <div className="bg-[#FEFCF9] border border-black/5 p-5 flex flex-col items-start gap-3 text-left">
            <i className="fa-solid fa-sun text-lg text-[#B08A50]"></i>
            <div>
              <h6 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">UV Protected</h6>
              <p className="text-[0.68rem] text-black/55 mt-1 leading-relaxed">
                Amber glass preserves fragrance quality.
              </p>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderReviewsSection = () => {
    // Rating distribution
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.rating] !== undefined) counts[r.rating]++;
    });
    
    const distribution = Object.keys(counts).reverse().map(star => {
      const count = counts[star];
      const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
      return { star: parseInt(star), count, percentage };
    });

    return (
      <div className="mt-20 pt-16 border-t border-black/6 text-[#1C1B18] font-body">
        <div className="text-center mb-12">
          <span className="text-[0.62rem] font-bold tracking-[3px] text-[#B08A50] uppercase block mb-2">
            COLLECTOR FEEDBACK
          </span>
          <h3 className="font-heading text-3xl font-light tracking-wide uppercase leading-tight mb-1">
            Product Reviews
          </h3>
          <p className="text-[0.76rem] text-black/45 max-w-md mx-auto">
            Authentic ratings from verified fragrance collectors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
          {/* Left Column: Rating overview & stats */}
          <div className="lg:col-span-4 bg-[#FEFCF9] border border-black/5 p-6 md:p-8">
            <h4 className="text-xs font-bold uppercase tracking-wider mb-6 pb-2 border-b border-black/5 font-heading font-normal">
              Satisfaction Overview
            </h4>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-5xl font-light font-heading tracking-tight text-[#1C1B18]">
                {avgRating > 0 ? avgRating : '0.0'}
              </span>
              <span className="text-[0.62rem] text-black/40 uppercase tracking-widest font-bold">
                out of 5.0
              </span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 text-[#B08A50] text-[10px] mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} className={`fa-star ${i < Math.round(avgRating) ? 'fas' : 'far'}`} />
              ))}
              <span className="text-[0.62rem] text-black/45 ml-2 font-bold tracking-wider uppercase">
                ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
              </span>
            </div>

            {/* Distribution bars */}
            <div className="space-y-3.5 mb-8">
              {distribution.map(dist => (
                <div key={dist.star} className="flex items-center gap-3 text-[10px]">
                  <span className="w-10 font-bold uppercase text-black/40 tracking-wider">
                    {dist.star} Star
                  </span>
                  <div className="flex-1 h-1 bg-black/5 rounded-none overflow-hidden">
                    <div className="h-full bg-[#B08A50] transition-all duration-500" style={{ width: `${dist.percentage}%` }} />
                  </div>
                  <span className="w-6 text-right font-semibold text-black/50">
                    {dist.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Write a Review block */}
            <div className="border-t border-black/5 pt-6">
              <h5 className="text-[0.68rem] font-bold uppercase tracking-wider text-[#B08A50] mb-3">
                Share Feedback
              </h5>
              
              {!isSignedIn ? (
                <div className="text-left">
                  <p className="text-[0.68rem] text-black/55 mb-4 leading-relaxed">
                    Only verified purchasers of Decant Atelier items can submit reviews. Sign in to write a review.
                  </p>
                  <SignInButton mode="modal">
                    <button 
                      className="w-full py-2.5 bg-[#1C1B18] text-white text-[0.62rem] font-bold tracking-widest uppercase hover:bg-[#B08A50] transition-colors cursor-pointer"
                    >
                      Authenticate Account
                    </button>
                  </SignInButton>
                </div>
              ) : reviewSuccess ? (
                <div className="bg-[#FEFCF9] border border-[#B08A50]/20 p-4 text-left">
                  <h6 className="text-[0.65rem] font-bold uppercase tracking-wider text-[#B08A50] mb-1">Feedback Submitted</h6>
                  <p className="text-[0.62rem] text-black/55 leading-relaxed">
                    Thank you. Your review is queued in our moderation pipeline to trace verified purchase history and will display shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
                  {reviewError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[10px] font-semibold leading-relaxed">
                      {reviewError}
                    </div>
                  )}

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[0.58rem] font-bold uppercase tracking-widest mb-1.5 text-black/40">
                      Rating
                    </label>
                    <div className="flex items-center gap-1.5 text-xs text-[#B08A50]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewRating(i + 1)}
                          className="cursor-pointer transition-transform hover:scale-110"
                          aria-label={`Rate ${i + 1} stars`}
                        >
                          <i className={`${i < reviewRating ? 'fas' : 'far'} fa-star`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div>
                    <label className="block text-[0.58rem] font-bold uppercase tracking-widest mb-1.5 text-black/40">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Masterful scent composition"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full bg-[#F7F3ED]/40 border border-black/8 px-3 py-2 text-[11px] text-[#1C1B18] placeholder-black/30 focus:outline-none focus:border-[#B08A50]"
                    />
                  </div>

                  {/* Review Comments */}
                  <div>
                    <label className="block text-[0.58rem] font-bold uppercase tracking-widest mb-1.5 text-black/40">
                      Your Comments
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe your olfactory experience..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-[#F7F3ED]/40 border border-black/8 px-3 py-2 text-[11px] text-[#1C1B18] placeholder-black/30 focus:outline-none focus:border-[#B08A50] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-2.5 bg-[#1C1B18] text-white text-[0.62rem] font-bold tracking-widest uppercase hover:bg-[#B08A50] transition-colors disabled:opacity-50"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Approved Reviews List */}
          <div className="lg:col-span-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider pb-2 border-b border-black/5 font-heading font-normal">
              Collector Feedback
            </h4>

            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-white/20 border border-black/5">
                <p className="text-xs text-black/40 italic font-light">No feedback submitted for this item yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="review-card text-left">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[0.62rem] text-black/40 font-bold uppercase tracking-wider block">
                          {rev.user?.name || 'Collector'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[0.55rem] text-[#B08A50] font-bold tracking-widest uppercase mt-0.5">
                          <i className="fas fa-circle-check text-[8px]"></i> Verified Purchase
                        </span>
                      </div>
                      <span className="text-[0.58rem] text-black/30 font-semibold uppercase tracking-wider">
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-[#B08A50] text-[8px] my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`fa-star ${i < rev.rating ? 'fas' : 'far'}`} />
                      ))}
                    </div>

                    <h5 className="text-[0.72rem] font-bold text-[#1C1B18] mt-1">{rev.title}</h5>
                    <p className="text-xs text-black/65 leading-relaxed font-light mt-1">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-[#F7F3ED] min-h-screen pb-20 font-body select-none">
      <div className="max-w-[1440px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 pt-8 lg:pt-16">
        
        {/* Breadcrumbs Row */}
        <div className="flex justify-between items-center text-[0.6rem] font-bold tracking-[3px] text-[#B08A50] uppercase mb-8 select-none">
          <div className="flex items-center gap-1.5">
            <button 
              onClick={onBackToShop}
              className="flex items-center gap-1 px-3 py-1.5 border border-black/8 hover:border-black/35 hover:bg-black/[0.02] text-black/60 hover:text-black transition-colors rounded-none cursor-pointer"
            >
              <i className="fas fa-arrow-left text-[9px]"></i> Back
            </button>
            <span className="ml-4 text-black/30">SHOP</span>
            <span className="mx-2 text-black/20">&gt;</span>
            <span className="text-black/30">{product.brand}</span>
            <span className="mx-2 text-black/20">&gt;</span>
            <span className="text-[#1C1B18]">{product.name}</span>
          </div>
          <button 
            onClick={() => showToast("Provenance trace standard: authenticated retail stock only.", "info")} 
            className="text-[0.58rem] font-bold tracking-[2px] text-[#B08A50] hover:text-black transition-colors border-b border-[#B08A50]/20 pb-0.5 cursor-pointer"
          >
            Verified Provenance
          </button>
        </div>

        {/* 2-Column Grid Layout: 58% Gallery / 42% Specs & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-[5.8fr_4.2fr] gap-10 xl:gap-16 items-start mb-20">
          
          {/* LEFT COLUMN: Gallery Hero & Thumbnails */}
          <div className="w-full">
            {/* Gallery Frame Card */}
            <div 
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              className={`gallery-card group relative overflow-hidden bg-white border border-black/5 rounded-[24px] select-none transition-all duration-300 ${detectedAspect}`}
            >
              {/* Zoom Hint Icon */}
              <div className="absolute top-6 right-6 z-10 w-9 h-9 rounded-full bg-white/95 border border-black/5 flex items-center justify-center text-[#1C1B18]/60 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-sm">
                <i className="fa-solid fa-magnifying-glass-plus text-[11px]"></i>
              </div>

              {imageErrors[activeImageIndex] ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F7F3ED] text-black/40 p-6 text-center select-none z-10">
                  <i className="fa-solid fa-flask text-3xl text-[#B08A50] mb-4 opacity-50"></i>
                  <span className="text-[0.62rem] font-bold tracking-[3px] text-[#B08A50] uppercase mb-1">{product.brand}</span>
                  <span className="text-[0.8rem] font-light font-heading text-[#1C1B18]/70 max-w-[200px]">{product.name}</span>
                </div>
              ) : (
                <>
                  {isImageLoading && (
                    <div className="absolute inset-0 bg-neutral-50 animate-pulse z-10 flex items-center justify-center">
                      <div className="w-12 h-16 border border-neutral-200/50 opacity-20 relative overflow-hidden" />
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={galleryImages[activeImageIndex]}
                      alt={product.name}
                      loading={activeImageIndex === 0 ? "eager" : "lazy"}
                      decoding="async"
                      initial={{ opacity: 0, scale: 1.01 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 hover:scale-103 cursor-zoom-in z-0"
                      onClick={() => setIsLightboxOpen(true)}
                      onError={() => {
                        setImageErrors((prev) => ({ ...prev, [activeImageIndex]: true }));
                      }}
                      onLoad={(e) => {
                        setIsImageLoading(false);
                        const { naturalWidth, naturalHeight } = e.target;
                        if (naturalWidth && naturalHeight) {
                          const ratio = naturalWidth / naturalHeight;
                          if (ratio > 1.1) {
                            setDetectedAspect('aspect-[4/3]');
                          } else if (ratio < 0.9) {
                            setDetectedAspect('aspect-[4/5]');
                          } else {
                            setDetectedAspect('aspect-[1/1]');
                          }
                        }
                      }}
                    />
                  </AnimatePresence>
                </>
              )}

              {/* Minimal gallery controls */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-sm border border-black/5 hover:scale-105 active:scale-95 transition-all text-[#1C1B18] flex items-center justify-center cursor-pointer select-none z-20"
                    aria-label="Previous image"
                  >
                    <i className="fas fa-chevron-left text-[10px]"></i>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-sm border border-black/5 hover:scale-105 active:scale-95 transition-all text-[#1C1B18] flex items-center justify-center cursor-pointer select-none z-20"
                    aria-label="Next image"
                  >
                    <i className="fas fa-chevron-right text-[10px]"></i>
                  </button>
                </>
              )}
            </div>

            {/* Horizontal thumbnail list directly below the gallery container */}
            {galleryImages.length > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6 select-none overflow-x-auto py-2 scrollbar-none">
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx);
                        setIsZoomed(false);
                      }}
                      className={`relative overflow-hidden rounded-[12px] border w-16 h-16 bg-white flex items-center justify-center cursor-pointer transition-all duration-300 ${
                        isActive
                          ? 'border-[#B08A50] ring-1 ring-[#B08A50] scale-[1.02]'
                          : 'border-black/5 hover:border-black/20 hover:scale-102'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail preview ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Buy Box, Scent Pyramid, Specs Grid */}
          <div className="space-y-8 text-left">
            
            {/* Header Product Details */}
            <div>
              <span className="text-[0.62rem] font-bold tracking-[3px] text-black/45 uppercase block mb-1">
                {product.brand.toUpperCase()}
              </span>
              <div className="flex justify-between items-start gap-4">
                <h1 className="font-heading text-3xl font-light text-[#1C1B18] tracking-wide uppercase leading-tight">
                  {product.name}
                </h1>
                
                <button
                  onClick={() => showToast("Added to your collection wishlist.", "success")}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-black/8 rounded-full text-[0.62rem] font-bold tracking-wider uppercase hover:border-black/30 hover:bg-black/[0.02] transition-all select-none cursor-pointer"
                >
                  <i className="far fa-heart"></i> Wishlist
                </button>
              </div>

              {/* Rating Star Indicator */}
              <div className="flex items-center gap-2 mt-3 text-[#B08A50]">
                <div className="flex items-center gap-1 text-[10px]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <i key={i} className={`fa-star ${i < Math.round(avgRating) ? 'fas' : 'far'}`} />
                  ))}
                </div>
                <span className="text-[0.68rem] text-black/55 font-bold uppercase tracking-wider">
                  {avgRating > 0 ? `${avgRating} Rating (${reviews.length} reviews)` : 'No Reviews Yet'}
                </span>
              </div>

              {/* Concise Scent Story Short Description */}
              {product.description && (
                <p className="mt-4 text-xs text-black/65 font-light leading-relaxed line-clamp-3">
                  {product.description.split('\n\n')[0]}
                </p>
              )}
            </div>

            {/* Price section */}
            <div className="text-2xl font-light text-[#1C1B18] tracking-wide border-b border-black/6 pb-5">
              ₹{selectedSizePrice.toLocaleString('en-IN')}
              <span className="text-[0.58rem] font-bold tracking-wider text-black/40 uppercase block mt-1">
                Tax included. Shipping calculated at checkout.
              </span>
            </div>

            {/* Selection Card (Compact Configuration Card) */}
            <div className="config-card">
              {/* Size Select */}
              <div>
                <h4 className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase mb-2">
                  Select Size (ML)
                </h4>
                <div className="flex flex-wrap gap-4">
                  {product.sizes.map((sz, idx) => {
                    const isSelected = selectedSizeIndex === idx;
                    const isOutOfStock = sz.stock <= 0;
                    const sizeLabel = sz.size
                      .replace(' Decant', '')
                      .replace(' Retail Bottle', '')
                      .toUpperCase();
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedSizeIndex(idx)}
                        className={`text-xs pb-1 tracking-widest uppercase relative cursor-pointer font-medium ${
                          isSelected ? 'text-[#1C1B18]' : 'text-black/35 hover:text-[#1C1B18]'
                        } ${isOutOfStock ? 'opacity-40 line-through' : ''}`}
                      >
                        {sizeLabel} {isOutOfStock && '(Out of stock)'}
                        {isSelected && (
                          <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#1C1B18]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Decant Micro Spray select representation */}
              {product.category === 'decants' && (
                <div>
                  <h4 className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase mb-2">
                    Vial Spray Setup
                  </h4>
                  <div className="p-3 border border-black/8 bg-white flex justify-between items-center text-xs">
                    <span className="font-bold text-[#1C1B18]">Classic Glass Micro-Spray</span>
                    <span className="text-[#B08A50] font-semibold">+₹0</span>
                  </div>
                </div>
              )}

              {/* Quantity Select and Availability */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  <h4 className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase mb-2">
                    Quantity
                  </h4>
                  {selectedOption && selectedOption.stock > 0 ? (
                    <div className="flex items-center border border-black/8 bg-white h-[36px] px-2 w-[120px]">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-6 h-full flex items-center justify-center text-xs text-[#1C1B18]/70 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-[#1C1B18] select-none">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(q => Math.min(selectedOption.stock, q + 1))}
                        className="w-6 h-full flex items-center justify-center text-xs text-[#1C1B18]/70 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-red-600 font-bold uppercase">Sold Out</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase block mb-1">
                    Availability
                  </span>
                  <span className={`text-[0.68rem] font-bold uppercase tracking-wider ${
                    selectedOption && selectedOption.stock > 0 ? 'text-[#B08A50]' : 'text-red-500'
                  }`}>
                    {selectedOption && selectedOption.stock > 0 ? `In Stock (${selectedOption.stock} left)` : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* CTA Action button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || !selectedOption || selectedOption.stock <= 0}
                className={`
                  w-full py-4 text-white text-[0.68rem] font-bold tracking-widest uppercase shadow-sm
                  transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px]
                  ${(!selectedOption || selectedOption.stock <= 0)
                    ? 'bg-neutral-400 border-neutral-400 cursor-not-allowed opacity-60'
                    : 'bg-[#1C1B18] hover:bg-[#B08A50] border border-[#1C1B18] hover:border-[#B08A50] cursor-pointer'
                  }
                `}
              >
                {isAdding ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    <span>Adding to Bag...</span>
                  </>
                ) : !selectedOption || selectedOption.stock <= 0 ? (
                  <span>Out of Stock</span>
                ) : (
                  <span>Add to Bag</span>
                )}
              </button>
            </div>

            {/* Scent Profile Standalone Card */}
            {product.pyramid && (
              <div className="border border-black/6 bg-[#FEFCF9] p-5">
                <h4 className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase mb-3">
                  Olfactory Scent Profile
                </h4>
                <div className="space-y-3 text-[0.72rem]">
                  <div className="flex justify-between items-baseline py-1 border-b border-black/3">
                    <span className="font-bold text-[#B08A50] uppercase tracking-wider text-[0.62rem]">Top Notes</span>
                    <span className="text-black/85 text-right font-light">{product.pyramid.top}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-1 border-b border-black/3">
                    <span className="font-bold text-[#B08A50] uppercase tracking-wider text-[0.62rem]">Heart Notes</span>
                    <span className="text-black/85 text-right font-light">{product.pyramid.heart}</span>
                  </div>
                  <div className="flex justify-between items-baseline py-1">
                    <span className="font-bold text-[#B08A50] uppercase tracking-wider text-[0.62rem]">Base Notes</span>
                    <span className="text-black/85 text-right font-light">{product.pyramid.base}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Specifications Card Grid */}
            <div className="space-y-3">
              <h4 className="text-[0.58rem] font-bold tracking-[2px] text-black/45 uppercase">
                Performance & Specifications
              </h4>
              
              <div className="spec-grid">
                <div className="spec-card">
                  <span className="spec-card-label">Fragrance Family</span>
                  <span className="spec-card-value">{product.family || 'Woody / Amber'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-label">Concentration</span>
                  <span className="spec-card-value">{product.category === 'decants' ? 'Extrait / Parfum' : 'Retail Edition'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-label">Longevity</span>
                  <span className="spec-card-value">{product.characteristics?.longevity || '8-10 Hours'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-label">Projection</span>
                  <span className="spec-card-value">{product.characteristics?.sillage || 'Intimate to Moderate'}</span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-label">Season</span>
                  <span className="spec-card-value">
                    {product.tags?.includes('summer') ? 'Summer / Spring' : product.tags?.includes('winter') ? 'Winter / Autumn' : 'All Seasons'}
                  </span>
                </div>
                <div className="spec-card">
                  <span className="spec-card-label">Occasion</span>
                  <span className="spec-card-value">
                    {product.tags?.includes('datenight') ? 'Date Night / Evening' : product.tags?.includes('office') ? 'Office / Everyday' : 'Versatile'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION 5: Trust & Quality Row */}
        {renderTrustSection()}

        {/* SECTION 6: Reviews & Rating System */}
        {renderReviewsSection()}

        {/* SECTION 7: Unified discovery recommendations */}
        {similarProducts.length > 0 && (
          <div className="mt-20 pt-16 border-t border-black/6">
            <div className="mb-12 text-center">
              <span className="text-[0.62rem] font-bold tracking-[3px] text-[#B08A50] uppercase block mb-2">
                SCENT DISCOVERY
              </span>
              <h3 className="font-heading text-3xl font-light text-[#1C1B18] tracking-wide uppercase">
                Related Fragrances
              </h3>
              <p className="text-[0.76rem] text-black/45 leading-relaxed mt-1">
                Frequently collected with this scent or sharing similar olfactory notes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {similarProducts.map((simProd) => (
                <div
                  key={simProd.id}
                  onClick={() => {
                    window.location.hash = `product-${simProd.slug || simProd.id}`;
                  }}
                  className="group h-full flex flex-col bg-white border border-black/5 hover:border-black/20 shadow-sm transition-all duration-500 ease-out hover:-translate-y-1 overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F3ED]/30 border-b border-black/5">
                    <img
                      src={simProd.image}
                      alt={simProd.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 text-left">
                    <span className="text-[0.55rem] font-bold tracking-[2px] text-black/40 block mb-1 uppercase">
                      {simProd.brand}
                    </span>
                    <h4 className="font-heading text-xs font-normal text-[#1C1B18] mb-1.5 tracking-wide leading-tight group-hover:text-[#B08A50] transition-colors duration-300 line-clamp-2 min-h-[2rem]">
                      {simProd.name}
                    </h4>
                    <div className="text-xs font-semibold text-[#B08A50] mt-auto">
                      ₹{simProd.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
      
      {/* ── Premium Lightbox ── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[9999] select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Backdrop — click to close */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(10, 8, 6, 0.92)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              onClick={() => { setIsLightboxOpen(false); setIsZoomed(false); }}
            />

            {/* ── Top bar: product context + close ── */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 md:px-10 py-5">
              {/* Left: Brand + Name */}
              <div className="flex flex-col gap-0.5">
                <span
                  className="text-[0.52rem] font-bold tracking-[3.5px] uppercase"
                  style={{ color: '#B08A50' }}
                >
                  {product.brand}
                </span>
                <span
                  className="text-[0.78rem] font-light tracking-wide"
                  style={{ color: 'rgba(254,252,249,0.75)', fontFamily: 'var(--font-heading, serif)' }}
                >
                  {product.name}
                </span>
              </div>

              {/* Center: counter */}
              <span
                className="absolute left-1/2 -translate-x-1/2 text-[0.62rem] font-bold tracking-[3px] uppercase"
                style={{ color: 'rgba(254,252,249,0.4)' }}
              >
                {activeImageIndex + 1} / {galleryImages.length}
              </span>

              {/* Right: Close button */}
              <button
                onClick={() => { setIsLightboxOpen(false); setIsZoomed(false); }}
                aria-label="Close gallery"
                className="cursor-pointer transition-all duration-300 group"
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  border: '1px solid rgba(254,252,249,0.15)',
                  background: 'rgba(254,252,249,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(254,252,249,0.7)',
                  fontSize: '0.9rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(176,138,80,0.18)';
                  e.currentTarget.style.borderColor = 'rgba(176,138,80,0.5)';
                  e.currentTarget.style.color = '#B08A50';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(254,252,249,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(254,252,249,0.15)';
                  e.currentTarget.style.color = 'rgba(254,252,249,0.7)';
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* ── Central image area ── */}
            <div className="absolute inset-0 flex items-center justify-center px-16 md:px-24"
              style={{ paddingTop: '90px', paddingBottom: galleryImages.length > 1 ? '110px' : '60px' }}
            >
              {/* Prev arrow */}
              {galleryImages.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 md:left-8 z-20 cursor-pointer transition-all duration-300"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1px solid rgba(254,252,249,0.12)',
                    background: 'rgba(254,252,249,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(254,252,249,0.55)',
                    fontSize: '0.72rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(254,252,249,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(254,252,249,0.3)';
                    e.currentTarget.style.color = 'rgba(254,252,249,0.95)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(254,252,249,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(254,252,249,0.12)';
                    e.currentTarget.style.color = 'rgba(254,252,249,0.55)';
                  }}
                >
                  <i className="fas fa-chevron-left" />
                </button>
              )}

              {/* Image */}
              <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
                {imageErrors[activeImageIndex] ? (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <i className="fa-solid fa-flask text-3xl" style={{ color: '#B08A50', opacity: 0.5 }} />
                    <span className="text-[0.62rem] font-bold tracking-[3px] uppercase" style={{ color: '#B08A50' }}>
                      {product.brand}
                    </span>
                    <span className="text-[0.88rem] font-light" style={{ color: 'rgba(254,252,249,0.6)', fontFamily: 'var(--font-heading,serif)' }}>
                      {product.name}
                    </span>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      src={galleryImages[activeImageIndex]}
                      alt={`${product.name} — view ${activeImageIndex + 1}`}
                      decoding="async"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
                      onClick={() => setIsZoomed(prev => !prev)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                        transform: isZoomed ? 'scale(1.55)' : 'scale(1)',
                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                        borderRadius: 4,
                        userSelect: 'none',
                      }}
                    />
                  </AnimatePresence>
                )}
              </div>

              {/* Next arrow */}
              {galleryImages.length > 1 && (
                <button
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 md:right-8 z-20 cursor-pointer transition-all duration-300"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1px solid rgba(254,252,249,0.12)',
                    background: 'rgba(254,252,249,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(254,252,249,0.55)',
                    fontSize: '0.72rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(254,252,249,0.14)';
                    e.currentTarget.style.borderColor = 'rgba(254,252,249,0.3)';
                    e.currentTarget.style.color = 'rgba(254,252,249,0.95)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(254,252,249,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(254,252,249,0.12)';
                    e.currentTarget.style.color = 'rgba(254,252,249,0.55)';
                  }}
                >
                  <i className="fas fa-chevron-right" />
                </button>
              )}
            </div>

            {/* ── Bottom thumbnail rail ── */}
            {galleryImages.length > 1 && (
              <div
                className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center gap-2.5 px-6 py-5 overflow-x-auto"
                style={{ scrollbarWidth: 'none' }}
                onClick={e => e.stopPropagation()}
              >
                {galleryImages.map((imgUrl, idx) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setActiveImageIndex(idx); setIsZoomed(false); }}
                      aria-label={`View image ${idx + 1}`}
                      className="cursor-pointer flex-shrink-0 transition-all duration-300 overflow-hidden"
                      style={{
                        width: isActive ? 56 : 48,
                        height: isActive ? 56 : 48,
                        borderRadius: 6,
                        border: isActive
                          ? '1.5px solid #B08A50'
                          : '1.5px solid rgba(254,252,249,0.1)',
                        opacity: isActive ? 1 : 0.45,
                        outline: isActive ? '2px solid rgba(176,138,80,0.25)' : 'none',
                        outlineOffset: 2,
                        background: '#111',
                        transform: isActive ? 'scale(1)' : 'scale(0.95)',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '0.85';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.opacity = '0.45';
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }
                      }}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
