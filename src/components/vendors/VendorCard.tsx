import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { RiShieldCheckLine, RiStarFill, RiStore2Line } from 'react-icons/ri'

interface VendorCardProps { vendor: any; index?: number }

export default function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  const username = vendor.userId?.username ?? vendor._id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/vendors/${username}`}
        className="card-product group flex flex-col items-center text-center p-6 hover:border-gold-500/30 transition-all"
      >
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-purple flex items-center justify-center mb-4 flex-shrink-0 border-2 border-white/10 group-hover:border-gold-500/40 transition-all">
          {vendor.profilePic ? (
            <Image src={vendor.profilePic} alt={vendor.businessName} width={80} height={80} className="w-full h-full object-cover" />
          ) : (
            <RiStore2Line className="w-8 h-8 text-white/50" />
          )}
        </div>

        {/* Name */}
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-display font-bold text-gray-200 group-hover:text-gold-300 transition-colors truncate max-w-[140px]">
            {vendor.businessName}
          </h3>
          {vendor.badge && <RiShieldCheckLine className="w-4 h-4 text-gold-400 flex-shrink-0" />}
        </div>

        {/* Username */}
        <p className="text-gray-500 text-xs mb-3">@{username}</p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {vendor.ratings?.count > 0 && (
            <span className="flex items-center gap-1">
              <RiStarFill className="w-3 h-3 text-gold-400" />
              {vendor.ratings.average.toFixed(1)}
            </span>
          )}
          <span>{vendor.totalSales?.toLocaleString() ?? 0} sales</span>
        </div>

        {/* Description snippet */}
        {vendor.description && (
          <p className="text-gray-500 text-xs mt-3 line-clamp-2 leading-relaxed">
            {vendor.description}
          </p>
        )}
      </Link>
    </motion.div>
  )
}
