import { v2 as cloudinary } from 'cloudinary'
import { cloudinaryConfig } from '@/config'

cloudinary.config({
  cloud_name: cloudinaryConfig.cloudName,
  api_key:    cloudinaryConfig.apiKey,
  api_secret: cloudinaryConfig.apiSecret,
  secure:     true,
})

export interface UploadResult {
  url:      string
  publicId: string
  width?:   number
  height?:  number
  format?:  string
}

export async function uploadImage(
  source: string | Buffer,
  folder: string,
  options: Record<string, unknown> = {}
): Promise<UploadResult> {
  let uploadSource: string
  if (Buffer.isBuffer(source)) {
    uploadSource = `data:image/jpeg;base64,${source.toString('base64')}`
  } else {
    uploadSource = source
  }

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    resource_type: 'image',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    ...options,
  })

  return {
    url:      result.secure_url,
    publicId: result.public_id,
    width:    result.width,
    height:   result.height,
    format:   result.format,
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(
  publicId: string,
  options: {
    width?:   number
    height?:  number
    quality?: number | 'auto'
    format?:  string
    crop?:    string
  } = {}
): string {
  return cloudinary.url(publicId, {
    secure:        true,
    fetch_format:  options.format  ?? 'auto',
    quality:       options.quality ?? 'auto',
    width:         options.width,
    height:        options.height,
    crop:          options.crop    ?? 'fill',
  })
}

export default cloudinary
