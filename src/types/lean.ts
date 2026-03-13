import { Types } from 'mongoose'
import type { ICart, IDiscount, IOrder, IOrderItem, IProduct, IVendor } from '@/types'

type ObjectIdLike = Types.ObjectId | string

type ReplaceObjectId<T> = {
  [K in keyof T]: T[K] extends ObjectIdLike
    ? string
    : T[K] extends ObjectIdLike | undefined
      ? string | undefined
      : T[K] extends Date
        ? Date
        : T[K] extends (...args: never[]) => unknown
          ? T[K]
      : T[K] extends Array<infer U>
        ? Array<ReplaceObjectId<U>>
        : T[K] extends object
          ? ReplaceObjectId<T[K]>
          : T[K]
}

export type LeanVendor = ReplaceObjectId<IVendor>
export type LeanProduct = ReplaceObjectId<IProduct>
export type LeanOrderItem = ReplaceObjectId<IOrderItem>
export type LeanOrder = ReplaceObjectId<IOrder>
export type LeanDiscount = ReplaceObjectId<IDiscount>
export type LeanCart = ReplaceObjectId<ICart>

export type LeanProductWithVendorId = Omit<LeanProduct, 'vendorId'> & {
  vendorId: { _id: string }
}
