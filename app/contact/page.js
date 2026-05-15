"use client";
// app/contact/page.js
import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 text-[#c8dce8]">
      <h1 className="text-3xl font-bold text-[#f1f5f9] mb-3">Contact</h1>
      <p className="text-[#94a3b8] mb-8 leading-relaxed">
        Questions, feedback, bug reports, or just want to say hello? Send a message below and it will land in Mark&apos;s inbox.
        Your message is sent directly via email and is not stored anywhere on this site.
      </p>

      {status === "success" ? (
        <div className="bg-[#0d1f2d] border border-[#1D9E75] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#1D9E75] text-2xl">✓</span>
            <h2 className="text-xl font-semibold text-[#f1f5f9]">Message sent</h2>
          </div>
          <p className="text-[#94a3b8] leading-relaxed mb-4">
            Thanks for reaching out. You&apos;ll hear back at the email you provided. In the meantime, you might enjoy reading the <Link href="/about" className="text-[#60c8d4] hover:underline">About page</Link> or browsing recent <Link href="/articles" className="text-[#60c8d4] hover:underline">signals</Link>.
          </p>
          <button
            onClick={() => setStatus("idle")}
            className="text-sm text-[#60c8d4] hover:underline"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm text-[#94a3b8] mb-2">Your name</label>
            <input
              id="name"
              type="text"
              required
              maxLength={100}
              value={form.name}
              onChange={handleChange("name")}
              className="w-full bg-[#0d1520] border border-[#1a2535] rounded-lg px-4 py-3 text-[#f1f5f9] focus:border-[#60c8d4] focus:outline-none transition-colors"
              placeholder="Jane Doe"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-[#94a3b8] mb-2">Your email</label>
            <input
              id="email"
              type="email"
              required
              maxLength={200}
              value={form.email}
              onChange={handleChange("email")}
              className="w-full bg-[#0d1520] border border-[#1a2535] rounded-lg px-4 py-3 text-[#f1f5f9] focus:border-[#60c8d4] focus:outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm text-[#94a3b8] mb-2">Subject</label>
            <input
              id="subject"
              type="text"
              required
              maxLength={150}
              value={form.subject}
              onChange={handleChange("subject")}
              className="w-full bg-[#0d1520] border border-[#1a2535] rounded-lg px-4 py-3 text-[#f1f5f9] focus:border-[#60c8d4] focus:outline-none transition-colors"
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm text-[#94a3b8] mb-2">Message</label>
            <textarea
              id="message"
              required
              maxLength={5000}
              rows={7}
              value={form.message}
              onChange={handleChange("message")}
              className="w-full bg-[#0d1520] border border-[#1a2535] rounded-lg px-4 py-3 text-[#f1f5f9] focus:border-[#60c8d4] focus:outline-none transition-colors resize-vertical"
              placeholder="Your message..."
            />
            <div className="text-xs text-[#3a6070] mt-1 text-right">
              {form.message.length} / 5000
            </div>
          </div>

          {status === "error" && (
            <div className="bg-[#2a1818] border border-[#5a2a2a] rounded-lg p-3 text-sm text-[#ff6b6b]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full bg-[#60c8d4] hover:bg-[#7fd4de] disabled:bg-[#3a6070] disabled:cursor-not-allowed text-[#080d14] font-semibold py-3 rounded-lg transition-colors"
          >
            {status === "sending" ? "Sending..." : "Send message"}
          </button>

          <p className="text-xs text-[#3a6070] text-center">
            By submitting, you agree to our <Link href="/privacy" className="text-[#60c8d4] hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}