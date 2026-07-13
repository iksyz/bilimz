import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Check if request is originating from localhost / 127.0.0.1
  const isLocal =
    hostname.startsWith("localhost:") ||
    hostname === "localhost" ||
    hostname.startsWith("127.0.0.1:") ||
    hostname === "127.0.0.1";

  if (!isLocal) {
    // Return structured JSON for API routes
    if (url.pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ 
          ok: false, 
          message: "Erişim Engellendi: Bu işleme sadece yerel ağdan (localhost) izin verilmektedir." 
        }),
        { 
          status: 403, 
          headers: { "Content-Type": "application/json; charset=utf-8" } 
        }
      );
    }
    
    // Return styled HTML message for page navigation attempts
    return new NextResponse(
      `<html>
        <head>
          <title>Erişim Engellendi</title>
          <meta charset="utf-8">
        </head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; background:#01120e; color:#a7f3d0; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; padding:20px; text-align:center;">
          <div style="border: 1px solid rgba(16, 185, 129, 0.2); background: rgba(16, 185, 129, 0.05); padding: 30px; rounded-width: 12px; border-radius: 12px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <h2 style="color:#ffffff; margin-top:0; font-size: 22px;">Erişim Engellendi (403)</h2>
            <p style="font-size:14px; color:#a7f3d0; opacity:0.8; line-height:1.6;">
              ScienceOne Yönetim Paneline ve ilgili veri yazma servislerine güvenlik amacıyla sadece yerel bilgisayarınızdan (<strong>localhost</strong>) erişim sağlanabilir.
            </p>
            <div style="margin-top: 20px; font-size: 11px; font-family: monospace; color: #10b981; border: 1px solid rgba(16, 185, 129, 0.1); background: #011410; padding: 10px; border-radius: 6px;">
              İstemci Sunucusu: ${hostname}
            </div>
          </div>
        </body>
      </html>`,
      { 
        status: 403, 
        headers: { "Content-Type": "text/html; charset=utf-8" } 
      }
    );
  }

  return NextResponse.next();
}

// Config to target all admin and API posts endpoints
export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*", 
    "/api/posts/:path*"
  ],
};
