import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Next.js 14 App Router 표준 방식
const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler;
