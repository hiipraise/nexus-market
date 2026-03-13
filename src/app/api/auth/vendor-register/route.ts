import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { Vendor } from "@/models";
import { hashPassword, hashAnswer } from "@/lib/utils";
import { secretQuestions } from "@/config";

const VendorRegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/i),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  phone: z.string().min(10).max(15),
  whatsapp: z.string().min(10).max(15).optional(),
  businessName: z.string().min(2).max(100),
  description: z.string().min(20).max(1000),
  secretQuestion: z.enum([...secretQuestions] as [string, ...string[]]),
  secretAnswer: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = VendorRegisterSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parse.error.flatten(),
        },
        { status: 400 },
      );
    }

    const {
      username,
      email,
      password,
      phone,
      whatsapp,
      businessName,
      description,
      secretQuestion,
      secretAnswer,
    } = parse.data;

    // WhatsApp defaults to phone if not provided
    const whatsappNumber = whatsapp ?? phone;

    await connectDB();

    const existing = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    }).setOptions({ includeDeleted: true });

    if (existing) {
      const field =
        existing.username === username.toLowerCase() ? "username" : "email";
      return NextResponse.json(
        { success: false, error: `This ${field} is already taken` },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const hashedAnswer = await hashAnswer(secretAnswer);

    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "vendor",
      profile: {
        phoneNumber: phone,
        whatsapp: whatsappNumber,
      },
      security: {
        secretQuestion,
        secretAnswer: hashedAnswer,
      },
    });

    await Vendor.create({
      userId: user._id,
      businessName: businessName.trim(),
      description: description.trim(),
      phone,
      whatsapp: whatsappNumber,
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Vendor account created. Submit verification to start selling.",
        data: {
          id: String(user._id),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[VENDOR_REGISTER]", err);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
