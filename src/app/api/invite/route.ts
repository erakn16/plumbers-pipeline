import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { Resend } = await import("resend");
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set. Invite email will not be sent.");
      return NextResponse.json({ error: "Email service not configured. Set RESEND_API_KEY environment variable." }, { status: 503 });
    }
    const resend = new Resend(apiKey);
    const { email, role, inviterName, token } = await req.json();

    if (!email || !role || !token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
    const inviteLink = `${baseUrl}/signup?invite=${token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Plumbers Pipeline <onboarding@resend.dev>",
      to: [email],
      subject: `${inviterName || "Someone"} invited you to join Plumbers Pipeline`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
            <!-- Header -->
            <div style="background:#09090b;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                Plumbers<span style="color:#0066FF;">Pipeline</span>
              </h1>
            </div>
            <!-- Content -->
            <div style="padding:40px;">
              <h2 style="margin:0 0 8px;color:#09090b;font-size:24px;font-weight:700;">You have been invited!</h2>
              <p style="margin:0 0 24px;color:#71717a;font-size:15px;line-height:1.6;">
                <strong style="color:#09090b;">${inviterName || "An account owner"}</strong> has invited you to join their workspace on Plumbers Pipeline as a <strong style="color:#09090b;">${role}</strong>.
              </p>
              <a href="${inviteLink}" style="display:inline-block;background:#0066FF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
                Accept Invitation
              </a>
              <p style="margin:24px 0 0;color:#a1a1aa;font-size:13px;line-height:1.5;">
                This invitation expires in 48 hours. If you did not expect this email, you can safely ignore it.
              </p>
              <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />
              <p style="margin:0;color:#a1a1aa;font-size:12px;line-height:1.5;">
                If the button does not work, copy and paste this link into your browser:<br/>
                <a href="${inviteLink}" style="color:#0066FF;word-break:break-all;">${inviteLink}</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("Invite API error:", err);
    return NextResponse.json({ error: "Failed to send invitation" }, { status: 500 });
  }
}
