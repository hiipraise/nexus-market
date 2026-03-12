// src/components/layout/Footer.tsx
import Link from 'next/link'
import { RiInstagramLine, RiTwitterXLine, RiFacebookLine, RiWhatsappLine } from 'react-icons/ri'
import { appConfig } from '@/config'

const footerLinks = {
  Shop: [
    { label: 'All Products', href: '/products'               },
    { label: 'Trending',     href: '/trending'               },
    { label: 'Deals',        href: '/products?deals=true'    },
    { label: 'Black Friday', href: '/products?blackFriday=true' },
    { label: 'New Arrivals', href: '/products?sort=newest'   },
  ],
  Vendors: [
    { label: 'Become a Vendor', href: '/vendor/register' },
    { label: 'Vendor Login',    href: '/login'           },
    { label: 'Browse Vendors',  href: '/vendors'         },
    { label: 'Verification',    href: '/vendor/verification' },
  ],
  Support: [
    { label: 'Help Center',     href: '/help'             },
    { label: 'Contact Us',      href: '/contact'          },
    { label: 'Track Order',     href: '/orders/track'     },
    { label: 'Return Policy',   href: '/returns'          },
    { label: 'Report an Issue', href: '/report'           },
  ],
  Company: [
    { label: 'About Us',       href: '/about'        },
    { label: 'Privacy Policy', href: '/privacy'      },
    { label: 'Terms of Use',   href: '/terms'        },
    { label: 'Cookies',        href: '/cookies'      },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#070212] border-t border-[rgba(200,139,0,0.1)] mt-20">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />

      <div className="page-container pt-16 pb-8">
        {/* Brand + Social */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 mb-12">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                <span className="font-display font-black text-gray-950 text-xl">N</span>
              </div>
              <span className="font-display font-bold text-2xl text-gradient-gold">
                {appConfig.name}
              </span>
            </Link>
            <p className="text-gray-500 text-sm font-body leading-relaxed mb-6">
              {appConfig.description}. Connecting buyers and verified vendors for a premium shopping experience.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: RiInstagramLine, href: '#', label: 'Instagram' },
                { icon: RiTwitterXLine, href: '#', label: 'Twitter'   },
                { icon: RiFacebookLine, href: '#', label: 'Facebook'  },
                { icon: RiWhatsappLine, href: '#', label: 'WhatsApp'  },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-display font-semibold text-gray-200 mb-4 text-sm uppercase tracking-wider">
                  {category}
                </h3>
                <ul className="space-y-2.5">
                  {links.map(link => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-gray-500 hover:text-gold-400 text-sm font-body transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600 font-body">
          <p>© {new Date().getFullYear()} {appConfig.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              All systems operational
            </span>
            <span className="text-gray-700">·</span>
            <span>Payments by Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
