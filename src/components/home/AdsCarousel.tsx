// src/components/home/AdsCarousel.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri'
import { useCallback } from 'react'

export default function AdsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })])

  const { data: ads } = useQuery({
    queryKey: ['ads', 'carousel'],
    queryFn:  () => axios.get('/api/ads?type=carousel&active=true').then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (!ads?.length) return null

  return (
    <section className="py-8 bg-[#0d0520] border-y border-[rgba(200,139,0,0.08)]">
      <div className="page-container">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {ads.map((ad: any) => (
                <div key={ad._id} className="flex-none w-full">
                  <Link href={ad.linkUrl ?? '#'} onClick={() => axios.patch(`/api/ads/${ad._id}/click`)}>
                    <div className="relative h-48 sm:h-64 lg:h-80 rounded-2xl overflow-hidden">
                      <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <h3 className="font-display font-bold text-white text-xl">{ad.title}</h3>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {ads.length > 1 && (
            <>
              <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:text-gold-400 transition-colors shadow-lg">
                <RiArrowLeftLine className="w-4 h-4" />
              </button>
              <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 glass rounded-full flex items-center justify-center text-white hover:text-gold-400 transition-colors shadow-lg">
                <RiArrowRightLine className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
