import type { Metadata } from 'next'
import HeroSection from '@/components/home/HeroSection'
import AdsCarousel from '@/components/home/AdsCarousel'
import CategoryGrid from '@/components/home/CategoryGrid'
import TrendingProducts from '@/components/home/TrendingProducts'
import FeaturedVendors from '@/components/home/FeaturedVendors'
import BlackFridayBanner from '@/components/home/BlackFridayBanner'
import { appConfig } from '@/config'

export const metadata: Metadata = {
  title:       `${appConfig.name} — Premium Multi-Vendor Shopping`,
  description: `Discover thousands of products from verified vendors. Shop fashion, accessories, and more with secure Paystack payments.`,
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AdsCarousel />
      <CategoryGrid />
      <BlackFridayBanner />
      <TrendingProducts />
      <FeaturedVendors />
    </>
  )
}
