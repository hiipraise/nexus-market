// ================================================================
// NEXUS MARKET — PAYSTACK INTEGRATION
// ================================================================

import { paystackConfig, platformConfig } from '@/config'

const HEADERS = {
  Authorization: `Bearer ${paystackConfig.secretKey}`,
  'Content-Type': 'application/json',
}

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${paystackConfig.baseUrl}${path}`, {
    ...options,
    headers: { ...HEADERS, ...options.headers },
  })
  const json = await res.json()
  if (!json.status) throw new Error(json.message ?? 'Paystack error')
  return json.data as T
}

// ── Initialize transaction ────────────────────────────────────────

export interface InitializePaymentInput {
  email:      string
  amountKobo: number
  reference:  string
  metadata?:  Record<string, unknown>
  callbackUrl?: string
}

export interface InitializePaymentResult {
  authorization_url: string
  access_code:       string
  reference:         string
}

export async function initializePayment(
  input: InitializePaymentInput
): Promise<InitializePaymentResult> {
  return paystackFetch<InitializePaymentResult>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email:        input.email,
      amount:       input.amountKobo,
      reference:    input.reference,
      metadata:     input.metadata ?? {},
      callback_url: input.callbackUrl
        ?? `${paystackConfig.baseUrl}${paystackConfig.callbackPath}`,
    }),
  })
}

// ── Verify transaction ────────────────────────────────────────────

export interface VerifyPaymentResult {
  id:        number
  reference: string
  status:    'success' | 'failed' | 'abandoned'
  amount:    number
  currency:  string
  metadata:  Record<string, unknown>
  customer:  { email: string; first_name?: string; last_name?: string }
}

export async function verifyPayment(reference: string): Promise<VerifyPaymentResult> {
  return paystackFetch<VerifyPaymentResult>(`/transaction/verify/${reference}`)
}

// ── Create transfer recipient ─────────────────────────────────────

export interface CreateRecipientInput {
  accountName:   string
  accountNumber: string
  bankCode:      string
  currency?:     string
}

export async function createTransferRecipient(input: CreateRecipientInput) {
  return paystackFetch('/transferrecipient', {
    method: 'POST',
    body: JSON.stringify({
      type:           'nuban',
      name:           input.accountName,
      account_number: input.accountNumber,
      bank_code:      input.bankCode,
      currency:       input.currency ?? platformConfig.currency,
    }),
  })
}

// ── Initiate transfer ─────────────────────────────────────────────

export interface InitiateTransferInput {
  amountKobo:   number
  recipientCode: string
  reference:    string
  reason?:      string
}

export async function initiateTransfer(input: InitiateTransferInput) {
  return paystackFetch('/transfer', {
    method: 'POST',
    body: JSON.stringify({
      source:    'balance',
      amount:    input.amountKobo,
      recipient: input.recipientCode,
      reference: input.reference,
      reason:    input.reason ?? 'Vendor payout',
    }),
  })
}

// ── List banks ────────────────────────────────────────────────────

export async function listBanks() {
  return paystackFetch<{ name: string; code: string }[]>(
    `/bank?currency=${platformConfig.currency}&use_cursor=false`
  )
}

// ── Platform fee calculation ──────────────────────────────────────

export function calculatePlatformFee(amountKobo: number): {
  platformFee:  number
  vendorAmount: number
  total:        number
} {
  const percentageFee = Math.floor(
    (amountKobo * platformConfig.feePercentage) / 100
  )
  const platformFee  = percentageFee + platformConfig.feeFlatKobo
  const vendorAmount = amountKobo - platformFee
  return { platformFee, vendorAmount, total: amountKobo }
}

// ── Verify webhook signature ──────────────────────────────────────

import { createHmac } from 'crypto'

export function verifyWebhookSignature(
  payload:   string,
  signature: string
): boolean {
  const hash = createHmac('sha512', paystackConfig.secretKey)
    .update(payload)
    .digest('hex')
  return hash === signature
}
