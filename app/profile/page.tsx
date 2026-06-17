import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Status Badge styling helper
const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  CONFIRMED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  PROCESSING: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  SHIPPED: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  DELIVERED: 'bg-green-500/10 text-green-400 border border-green-500/20',
  CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
}


export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get Clerk user profile (for image and membership date)
  const clerkUser = await currentUser()
  if (!clerkUser) {
    redirect('/sign-in')
  }

  // Fetch user data from Neon database using clerkId
  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      addresses: {
        orderBy: { isDefault: 'desc' },
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  // Fallback: If webhook user.created hasn't run yet due to race condition, sync user on the fly
  if (!dbUser) {
    const email = clerkUser.emailAddresses[0]?.emailAddress
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber || null

    if (email) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email,
          name: name,
          phone: phone,
          role: 'USER',
        },
        include: {
          addresses: true,
          orders: true,
        },
      })
    }
  }

  if (!dbUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] flex items-center justify-center font-body">
        <div className="text-center">
          <p className="text-luxuryGold mb-2 font-heading text-xl">Loading Account...</p>
          <p className="text-xs text-[#f0ede8]/50">Syncing with our servers.</p>
        </div>
      </div>
    )
  }

  const memberSince = new Date(clerkUser.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ede8] font-body selection:bg-luxuryGold/30 selection:text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Section 1: Profile Header */}
        <header className="bg-[#141414] border border-luxuryGold/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-radial-gradient(circle,rgba(201,169,110,0.05)_0%,transparent_70%) rounded-full blur-3xl pointer-events-none" />
          
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-luxuryGold/30 shadow-lg flex-shrink-0">
            {clerkUser.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt={dbUser.name || 'Profile Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-luxuryGold font-heading text-3xl font-bold">
                {dbUser.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* User Meta Info */}
          <div className="text-center sm:text-left space-y-2 flex-grow">
            <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-wide text-white">
              {dbUser.name || 'Fragrance Collector'}
            </h1>
            <p className="text-sm text-[#f0ede8]/70 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 justify-center sm:justify-start">
              <span>{dbUser.email}</span>
              {dbUser.phone && (
                <>
                  <span className="hidden sm:inline text-luxuryGold/30">•</span>
                  <span>{dbUser.phone}</span>
                </>
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-3 items-center justify-center sm:justify-start">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[#f0ede8]/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                Member Since {memberSince}
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-luxuryGold bg-luxuryGold/10 border border-luxuryGold/20 px-2.5 py-1 rounded-full">
                {dbUser.role} Account
              </span>
            </div>
          </div>
        </header>

        {/* Responsive Grid for Sections 2 & 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 items-start">

          {/* Section 2: Saved Addresses */}
          <section className="bg-[#141414] border border-luxuryGold/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="border-b border-luxuryGold/10 pb-3 flex justify-between items-center">
              <h2 className="font-heading text-xl font-bold tracking-wide text-white uppercase">
                Saved Addresses
              </h2>
              <span className="text-xs text-luxuryGold font-semibold">
                ({dbUser.addresses.length})
              </span>
            </div>

            {dbUser.addresses.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-[#f0ede8]/10 rounded-xl">
                <p className="text-sm text-[#f0ede8]/40 mb-1">No addresses saved yet.</p>
                <p className="text-[0.68rem] text-luxuryGold/60">Add a shipping address during checkout.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {dbUser.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      addr.isDefault
                        ? 'bg-luxuryGold/[0.02] border-luxuryGold/30 shadow-md shadow-luxuryGold/2'
                        : 'bg-black/20 border-white/5 hover:border-luxuryGold/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {addr.fullName}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[0.55rem] font-bold tracking-widest uppercase bg-luxuryGold/15 text-luxuryGold border border-luxuryGold/20 px-2 py-0.5 rounded-md">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#f0ede8]/70 leading-relaxed font-light">
                      {addr.addressLine1}
                      {addr.addressLine2 && `, ${addr.addressLine2}`}
                      <br />
                      {addr.city}, {addr.state} - {addr.postalCode}
                      <br />
                      <span className="text-luxuryGold/50 font-medium">{addr.country}</span>
                    </p>
                    <p className="text-[0.68rem] text-[#f0ede8]/50 mt-2 flex items-center gap-1 font-mono">
                      <span className="text-[8px] text-luxuryGold/30">📞</span> {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3: Recent Orders */}
          <section className="bg-[#141414] border border-luxuryGold/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
            <div className="border-b border-luxuryGold/10 pb-3 flex justify-between items-center">
              <h2 className="font-heading text-xl font-bold tracking-wide text-white uppercase">
                Recent Orders
              </h2>
              <span className="text-xs text-luxuryGold font-semibold">
                (Last 5)
              </span>
            </div>

            {dbUser.orders.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed border-[#f0ede8]/10 rounded-xl">
                <p className="text-sm text-[#f0ede8]/40 mb-1">No orders found.</p>
                <p className="text-[0.68rem] text-luxuryGold/60">Experience our collection to place your first order.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-luxuryGold/10 text-luxuryGold/70 font-semibold uppercase tracking-wider text-[0.6rem]">
                      <th className="py-3 px-2">Order ID</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {dbUser.orders.map((order) => {
                      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                      const totalFormatted = Number(order.total).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 2,
                      })

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
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  )
}
