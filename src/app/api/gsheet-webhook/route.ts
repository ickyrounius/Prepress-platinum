import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In a real scenario, this URL would be your actual Google Apps Script Web App URL
    // e.g., published from Kode.gs
    const GSHEET_WEBHOOK_URL = process.env.GSHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycby-XXX/exec";

    const response = await fetch(GSHEET_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`GSheet Webhook failed with status ${response.status}`);
    }

    return NextResponse.json({ success: true, message: "Data synced to GSheet successfully" });
  } catch (error: unknown) {
    console.error("GSheet Sync Error:", error);
    const errObj = error as Error;
    return NextResponse.json({ success: false, error: errObj.message }, { status: 500 });
  }
}
