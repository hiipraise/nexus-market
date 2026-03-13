// src/app/api/auth/forgot-username/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db/connect";
import User from "@/models/User";
import { compareAnswer, maskEmail } from "@/lib/utils";
import type { IUser } from "@/types";

// Step 1: Get secret question for an email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 },
    );
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase() }).lean<IUser>();

  if (!user) {
    // Don't reveal whether email exists
    return NextResponse.json({
      success: true,
      data: {
        question: null,
        message: "If this email exists, a question will be shown.",
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      question: user.security.secretQuestion,
      maskedEmail: maskEmail(user.email),
    },
  });
}

// Step 2: Verify answer and reveal username
const AnswerSchema = z.object({
  email: z.string().email(),
  answer: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = AnswerSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input" },
        { status: 400 },
      );
    }

    const { email, answer } = parse.data;
    await connectDB();

    type UserWithAnswer = IUser & {
      security: IUser["security"] & { secretAnswer: string };
    };

    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+security.secretAnswer")
      .lean<UserWithAnswer>();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Incorrect answer. Please try again." },
        { status: 401 },
      );
    }

    const isCorrect = await compareAnswer(answer, user.security.secretAnswer);
    if (!isCorrect) {
      return NextResponse.json(
        { success: false, error: "Incorrect answer. Please try again." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { username: user.username },
      message: "Username recovered successfully.",
    });
  } catch (err) {
    console.error("[FORGOT_USERNAME]", err);
    return NextResponse.json(
      { success: false, error: "Recovery failed. Please try again." },
      { status: 500 },
    );
  }
}
