import { NextResponse } from "next/server";

/**
 * Viewing requests. Validates, drops honeypot submissions and forwards to
 * VISIT_WEBHOOK_URL (a CRM, Zapier/Make hook, Slack workflow, …) when set.
 * Without a webhook it logs non-personal fields only, so the demo works.
 */

const TYPES = ["Show apartment", "Video call", "Site tour"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s()-]{7,20}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // bots fill every field; people never see this one
  if (typeof body.company === "string" && body.company.trim()) return NextResponse.json({ ok: true, ref: "NGZ-000000" });

  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  const data = {
    type: str("type", 40),
    day: str("day", 40),
    time: str("time", 10),
    home: str("home", 12),
    name: str("name", 120),
    phone: str("phone", 30),
    email: str("email", 160),
    message: str("message", 2000),
  };

  const errors: Record<string, string> = {};
  if (!TYPES.includes(data.type)) errors.type = "Choose how you'd like to view.";
  if (!data.day || !data.time) errors.when = "Pick a day and a time.";
  if (data.name.length < 2) errors.name = "Please tell us your name.";
  if (!data.phone && !data.email) errors.phone = "Add a phone number or an email so we can confirm.";
  if (data.phone && !PHONE.test(data.phone)) errors.phone = "That number doesn't look right.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "That email doesn't look right.";
  if (Object.keys(errors).length) return NextResponse.json({ ok: false, errors }, { status: 422 });

  const ref = `NGZ-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const hook = process.env.VISIT_WEBHOOK_URL;
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, ref, source: "ngazi-website", receivedAt: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error(String(r.status));
    } catch {
      return NextResponse.json({ ok: false, error: "We couldn't send that just now." }, { status: 502 });
    }
  } else {
    console.info("[visit]", ref, data.type, data.day, data.time, data.home || "-");
  }
  return NextResponse.json({ ok: true, ref });
}
