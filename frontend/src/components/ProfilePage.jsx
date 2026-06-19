import { useState, useEffect } from 'react';
import { useAuth, useUser, SignInButton } from '@clerk/clerk-react';

const statusStyles = {
  PENDING: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  PROCESSING: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  SHIPPED: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  DELIVERED: 'bg-green-500/10 text-green-500 border border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-500 border border-red-500/20',
};

export default function ProfilePage() {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Address form modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Fetch addresses and orders from Express API
  const fetchData = async () => {
    try {
      setLoadingData(true);
      const token = await getToken();

      if (!token) return;

      // Fetch addresses
      const addrRes = await fetch('http://localhost:5000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (addrRes.ok) {
        const addrData = await addrRes.json();
        setAddresses(addrData);
      }

      // Fetch orders
      const orderRes = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    } else {
      setLoadingData(false);
    }
  }, [isSignedIn]);

  // Handle address submit
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressError('');
    setSavingAddress(true);

    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const newAddr = await res.json();
        setAddresses([newAddr, ...addresses.map(a => formData.isDefault ? { ...a, isDefault: false } : a)]);
        setShowAddressModal(false);
        setFormData({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          isDefault: false
        });
      } else {
        const errData = await res.json();
        setAddressError(errData.error || 'Failed to save address');
      }
    } catch (err) {
      console.error(err);
      setAddressError('Network error. Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  if (!authLoaded || !userLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-sans">
        <div className="text-center">
          <p className="text-[#E2C275] mb-2 font-serif text-xl tracking-wide animate-pulse">Loading Account...</p>
          <p className="text-xs text-[#f0ede8]/50">Synchronizing with security portal.</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-sans px-4">
        <div className="max-w-md w-full text-center bg-[#141414] border border-[#E2C275]/20 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E2C275] via-[#C8A855] to-[#E2C275]" />
          <h2 className="font-serif text-2xl text-[#E2C275] tracking-wide mb-3 uppercase">My Account</h2>
          <p className="text-sm text-[#f0ede8]/70 mb-6 leading-relaxed">
            Please sign in to view your order history, shipping details, and saved addresses.
          </p>
          <SignInButton mode="modal">
            <button className="w-full py-3 bg-[#E2C275] text-[#120E0D] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#F4E7C5] transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg shadow-[#E2C275]/10 cursor-pointer">
              Sign In / Sign Up
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] font-sans selection:bg-[#E2C275]/30 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Section 1: Profile Header */}
        <header className="bg-[#141414] border border-[#E2C275]/15 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient(circle,rgba(226,194,117,0.04)_0%,transparent_70%) rounded-full blur-3xl pointer-events-none" />
          
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#E2C275]/30 shadow-lg flex-shrink-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-[#E2C275] font-serif text-3xl font-bold">
                {user.firstName?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="text-center sm:text-left space-y-2 flex-grow">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-wide text-white">
              {user.fullName || 'Fragrance Collector'}
            </h1>
            <p className="text-sm text-[#f0ede8]/70 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 justify-center sm:justify-start">
              <span>{user.primaryEmailAddress?.emailAddress}</span>
              {user.primaryPhoneNumber && (
                <>
                  <span className="hidden sm:inline text-[#E2C275]/30">•</span>
                  <span>{user.primaryPhoneNumber.phoneNumber}</span>
                </>
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-3 items-center justify-center sm:justify-start">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#f0ede8]/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                Member Since {memberSince}
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#E2C275] bg-[#E2C275]/10 border border-[#E2C275]/20 px-2.5 py-1 rounded-full">
                Collector Account
              </span>
            </div>
          </div>
        </header>

        {loadingData ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#f0ede8]/50 animate-pulse">Loading saved data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 items-start">

            {/* Section 2: Saved Addresses */}
            <section className="bg-[#141414] border border-[#E2C275]/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
              <div className="border-b border-[#E2C275]/15 pb-3 flex justify-between items-center">
                <h2 className="font-serif text-lg font-bold tracking-wide text-white uppercase">
                  Saved Addresses
                </h2>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-[0.68rem] font-bold tracking-wider uppercase text-[#E2C275] hover:text-[#F4E7C5] transition-colors cursor-pointer"
                >
                  + Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-[#f0ede8]/10 rounded-xl">
                  <p className="text-sm text-[#f0ede8]/40 mb-1">No addresses saved yet.</p>
                  <p className="text-[0.68rem] text-[#E2C275]/60">Save address to speed up checkout.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        addr.isDefault
                          ? 'bg-[#E2C275]/[0.02] border-[#E2C275]/40 shadow-md shadow-[#E2C275]/2'
                          : 'bg-black/20 border-white/5 hover:border-[#E2C275]/20'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[0.55rem] font-bold tracking-widest uppercase bg-[#E2C275]/15 text-[#E2C275] border border-[#E2C275]/20 px-2 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#f0ede8]/70 leading-relaxed font-light font-sans">
                        {addr.addressLine1}
                        {addr.addressLine2 && `, ${addr.addressLine2}`}
                        <br />
                        {addr.city}, {addr.state} - {addr.postalCode}
                        <br />
                        <span className="text-[#E2C275]/70 font-medium">{addr.country}</span>
                      </p>
                      <p className="text-[0.68rem] text-[#f0ede8]/50 mt-2 flex items-center gap-1 font-mono">
                        📞 {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 3: Recent Orders */}
            <section className="bg-[#141414] border border-[#E2C275]/15 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
              <div className="border-b border-[#E2C275]/15 pb-3">
                <h2 className="font-serif text-lg font-bold tracking-wide text-white uppercase">
                  Recent Orders
                </h2>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-[#f0ede8]/10 rounded-xl">
                  <p className="text-sm text-[#f0ede8]/40 mb-1">No orders found.</p>
                  <p className="text-[0.68rem] text-[#E2C275]/60">Explore our signature catalog to make your first purchase.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#E2C275]/15 text-[#E2C275]/70 font-semibold uppercase tracking-wider text-[0.6rem]">
                        <th className="py-3 px-2">Order ID</th>
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {orders.map((order) => {
                        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        });
                        const totalFormatted = Number(order.total).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 2,
                        });

                        return (
                          <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-3.5 px-2 font-mono text-white tracking-wide">
                              #{order.id.slice(-8).toUpperCase()}
                            </td>
                            <td className="py-3.5 px-2 text-[#f0ede8]/70">
                              {orderDate}
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[0.55rem] font-bold uppercase tracking-widest ${
                                statusStyles[order.status] || 'bg-white/10 text-white border border-white/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-2 text-right font-semibold text-white font-mono">
                              {totalFormatted}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

          </div>
        )}

      </div>

      {/* Address Modal Dialog Overlay */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#E2C275]/30 rounded-2xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#E2C275] via-[#C8A855] to-[#E2C275]" />
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-[#E2C275]/10">
              <h3 className="font-serif text-lg font-bold text-[#E2C275] uppercase">Add New Address</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-[#f0ede8]/50 hover:text-white transition-colors text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            {addressError && (
              <p className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2.5 rounded-lg mb-4 text-center">
                {addressError}
              </p>
            )}

            <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">Postal Code</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">Address Line 1</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">Address Line 2 (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">City</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-[#E2C275] mb-1">State</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-black/40 border border-[#E2C275]/15 rounded-lg p-2.5 text-[#f0ede8] focus:border-[#E2C275] focus:outline-none"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="defaultAddressCheckbox"
                  className="accent-[#E2C275] scale-110 cursor-pointer"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                <label htmlFor="defaultAddressCheckbox" className="text-[0.68rem] text-[#f0ede8]/80 cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <button
                type="submit"
                disabled={savingAddress}
                className="w-full mt-4 py-3 bg-[#E2C275] text-[#120E0D] font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#F4E7C5] transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
