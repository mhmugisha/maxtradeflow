// app/api/contact/route.js
// Backend route for the /contact form. Receives form submissions and emails them via Resend.

import { NextResponse } from "next/server";
import { Resend } from "resend";

const TO_EMAIL = "mhmugisha@gmail.com";
const FROM_EMAIL = "MaxTradeFlow Contact <onboarding@resend.dev>";

// Simple in-memory rate limit: max 5 submissions per IP per hour
const submissions = new Map(); // ip -> [timestamps]
const MAX_PER_HOUR = 5;
const ONE_HOUR_MS = 60 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (submissions.get(ip) || []).filter((t) => now - t < ONE_HOUR_MS);
  if (recent.length >= MAX_PER_HOUR) return true;
  recent.push(now);
  submissions.set(ip, recent);
  return false;
}

function sanitize(str, max) {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, max);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req) {
  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please try again later." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const name = sanitize(body.name, 100);
    const email = sanitize(body.email, 200);
    const subject = sanitize(body.subject, 150);
    const message = sanitize(body.message, 5000);

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // Basic email shape check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);

    const html = `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;">
        <h2 style="color:#0d1f2d;margin:0 0 24px;">New contact form message</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:8px 0;color:#666;width:100px;">From:</td><td style="padding:8px 0;"><strong>${escapeHtml(name)}</strong></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email:</td><td style="padding:8px 0;"><a href="mailto:${escapeHtml(email)}" style="color:#0066cc;">${escapeHtml(email)}</a></td></tr>
          <tr><td style="padding:8px 0;color:#666;">Subject:</td><td style="padding:8px 0;">${escapeHtml(subject)}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">IP:</td><td style="padding:8px 0;font-family:monospace;font-size:12px;color:#999;">${escapeHtml(ip)}</td></tr>
        </table>
        <div style="border-top:1px solid #eee;padding-top:20px;">
          <p style="color:#666;font-size:12px;margin:0 0 8px;">Message:</p>
          <div style="background:#f7f9fb;border-radius:8px;padding:16px;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</div>
        </div>
        <p style="color:#999;font-size:11px;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
          Sent via maxtradeflow.com contact form.<br>
          Reply directly to this email to respond to ${escapeHtml(name)}.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[MaxTradeFlow] ${subject}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}