import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectDB } from '@/lib/db/connect'
import { Cart, Product } from '@/models'
import { getSession } from '@/lib/auth/helpers'
import { generateShareId } from '@/lib/utils'
import User from '@/models/User'

// ── GET /api/cart ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session  = await getSession()
    const shareId  = req.nextUrl.searchParams.get('shareId')

    await connectDB()

    let cart
    if (shareId) {
      cart = await Cart.findOne({ shareId, isDeleted: false })
        .populate({
          path:     'items.productId',
          select:   'name images basePrice discountPrice variants status',
          populate: { path: 'vendorId', select: 'businessName badge' },
        })
        .lean()
    } else if (session) {
      cart = await Cart.findOne({ userId: session.user.id, isDeleted: false })
        .populate({
          path:     'items.productId',
          select:   'name images basePrice discountPrice variants status',
          populate: { path: 'vendorId', select: 'businessName badge' },
        })
        .lean()
    }

    return NextResponse.json({ success: true, data: cart ?? { items: [] } })
  } catch (err) {
    console.error('[CART_GET]', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch cart' }, { status: 500 })
  }
}

// ── POST /api/cart — add item ─────────────────────────────────────
const AddItemSchema = z.object({
  productId: z.string(),
  size:      z.string(),
  quantity:  z.number().int().positive(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Login required to add to cart' }, { status: 401 })
    }

    const body  = await req.json()
    const parse = AddItemSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const { productId, size, quantity } = parse.data
    await connectDB()

    const product = await Product.findOne({ _id: productId, status: 'active', isDeleted: false }).lean()
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const variant = product.variants.find(v => v.size === size)
    if (!variant) {
      return NextResponse.json({ success: false, error: 'Size not available' }, { status: 400 })
    }
    if (variant.quantity < quantity) {
      return NextResponse.json({ success: false, error: 'Insufficient stock' }, { status: 400 })
    }

    let cart = await Cart.findOne({ userId: session.user.id, isDeleted: false })
    if (!cart) {
      cart = await Cart.create({ userId: session.user.id, items: [] })
    }

    const existingIdx = cart.items.findIndex(
      i => String(i.productId) === productId && i.size === size
    )
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity
    } else {
      cart.items.push({ productId: productId as any, size, quantity })
    }

    await cart.save()
    return NextResponse.json({ success: true, data: cart, message: 'Item added to cart' })
  } catch (err) {
    console.error('[CART_POST]', err)
    return NextResponse.json({ success: false, error: 'Failed to update cart' }, { status: 500 })
  }
}

// ── DELETE /api/cart — remove item or clear ────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body      = await req.json()
    const productId = body.productId as string | undefined
    const size      = body.size as string | undefined
    const clearAll  = body.clearAll as boolean | undefined

    await connectDB()

    const cart = await Cart.findOne({ userId: session.user.id, isDeleted: false })
    if (!cart) return NextResponse.json({ success: true, message: 'Cart is already empty' })

    if (clearAll) {
      cart.items = []
    } else if (productId && size) {
      cart.items = cart.items.filter(
        i => !(String(i.productId) === productId && i.size === size)
      )
    }

    await cart.save()
    return NextResponse.json({ success: true, data: cart })
  } catch (err) {
    console.error('[CART_DELETE]', err)
    return NextResponse.json({ success: false, error: 'Failed to update cart' }, { status: 500 })
  }
}

// ── PATCH /api/cart — share cart ──────────────────────────────────
const ShareCartSchema = z.object({
  targetUsername: z.string(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body  = await req.json()
    const parse = ShareCartSchema.safeParse(body)
    if (!parse.success) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 })
    }

    await connectDB()

    const target = await User.findOne({
      username:        parse.data.targetUsername.toLowerCase(),
      isUsernamePublic: true,
    }).lean()

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'User not found or their username is private' },
        { status: 404 }
      )
    }

    const cart = await Cart.findOne({ userId: session.user.id, isDeleted: false }).lean()
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Your cart is empty' }, { status: 400 })
    }

    // Create a shared copy of the cart
    const shareId     = generateShareId()
    const sharedCart  = await Cart.create({
      shareId,
      items:     cart.items,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    })

    // Notify target user
    const { Notification } = await import('@/models')
    await Notification.create({
      userId:  target._id,
      type:    'cart_shared',
      title:   'Someone shared a cart with you!',
      message: `@${session.user.username} shared their cart with you.`,
      data:    { shareId, sharedBy: session.user.username },
    })

    return NextResponse.json({
      success: true,
      data:    { shareId, shareUrl: `/cart?shareId=${shareId}` },
      message: `Cart shared with @${target.username}`,
    })
  } catch (err) {
    console.error('[CART_SHARE]', err)
    return NextResponse.json({ success: false, error: 'Failed to share cart' }, { status: 500 })
  }
}
