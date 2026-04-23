import { NextResponse } from 'next/server';

// Ganti URL ini setelah Anda men-deploy Google Apps Script (Kode.gs) sebagai Web App As "Anyone"
const GOOGLE_SCRIPT_WEBAPP_URL = "https://script.google.com/macros/s/AKfycb.../exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Asynchronously call google script (Fire and Forget)
    fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    }).catch(e => console.error("GSheet Sync failed in background", e));
    
    return NextResponse.json({ success: true, message: "Sync requested" }, { status: 200 });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
