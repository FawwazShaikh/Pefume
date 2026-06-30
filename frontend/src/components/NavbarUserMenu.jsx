import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, SignOutButton, useAuth } from '@clerk/clerk-react';
import { CartStore } from '../utils/store.js';
import { clearCart } from '../utils/cartHelper.js';
import { API_BASE_URL } from '../utils/config.js';

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function NavbarUserMenu({ mode, handleLinkClick, setIsMobileMenuOpen }) {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    if (!authLoaded) return;
    CartStore.setAuthenticated(isSignedIn);
    if (authLoaded && !isSignedIn) {
      clearCart();
    }
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    async function fetchProfile() {
      if (!isSignedIn) {
        setDbUser(null);
        return;
      }
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const profileData = await res.json();
          setDbUser(profileData);
        }
      } catch (err) {
        console.error('NavbarUserMenu failed to fetch user profile:', err);
      }
    }
    fetchProfile();
  }, [isSignedIn, getToken]);

  if (mode === 'desktop') {
    return (
      <>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="nav-icon-btn nav-profile-btn" title="Login" aria-label="Login">
              <UserIcon className="nav-profile-svg" />
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <a href="#profile" onClick={(e) => handleLinkClick(e, 'profile')} className="nav-icon-btn nav-profile-btn" title="My Profile" aria-label="My Profile" style={{ display: 'flex', alignItems: 'center' }}>
            <UserIcon className="nav-profile-svg" />
          </a>
        </SignedIn>
      </>
    );
  }

  // Mobile mode
  return (
    <>
      <SignedIn>
        <div className="mobile-drawer-divider" />
        <span className="mobile-drawer-section-title">My Account</span>
        <li><a href="#profile?tab=profile" onClick={(e) => handleLinkClick(e, 'profile?tab=profile')}>Profile Details</a></li>
        <li><a href="#profile?tab=orders" onClick={(e) => handleLinkClick(e, 'profile?tab=orders')}>My Orders</a></li>
        <li><a href="#profile?tab=addresses" onClick={(e) => handleLinkClick(e, 'profile?tab=addresses')}>Manage Addresses</a></li>
        <li><a href="#profile?tab=security" onClick={(e) => handleLinkClick(e, 'profile?tab=security')}>Account Security</a></li>
        {dbUser?.role === 'ADMIN' && (
          <li><a href="#admin" onClick={(e) => handleLinkClick(e, 'admin')} style={{ color: '#2563eb', fontWeight: 'bold' }}>Admin Console</a></li>
        )}
        <li>
          <SignOutButton redirectUrl="/">
            <a href="#" onClick={() => { CartStore.setAuthenticated(false); clearCart(); setIsMobileMenuOpen(false); }}>Log Out</a>
          </SignOutButton>
        </li>
      </SignedIn>
      <SignedOut>
        <div className="mobile-drawer-divider" />
        <li>
          <SignInButton mode="modal">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); }}>Log In</a>
          </SignInButton>
        </li>
      </SignedOut>
    </>
  );
}
