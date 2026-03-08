// ================================================================
// NEXUS MARKET — DATABASE CONNECTION
// ================================================================

import mongoose from 'mongoose'
import { dbConfig } from '@/config'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongoose: MongooseCache | undefined
}

const cached: MongooseCache = global.__mongoose ?? { conn: null, promise: null }
if (!global.__mongoose) global.__mongoose = cached

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      dbName:          dbConfig.dbName,
      bufferCommands:  false,
    }

    cached.promise = mongoose.connect(dbConfig.uri, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}

export default connectDB
