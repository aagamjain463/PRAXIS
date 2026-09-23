import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/env";

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!);

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const admin = createAdminClient();
    const { data: reminders, error } = await admin.rpc("claim_due_reminders", { batch_size: 100 });
    if (error) throw error;
    let emails = 0;
    for (const reminder of reminders || []) {
      const { data: preferences } = await admin.from("user_preferences").select("in_app_notifications,email_reminders").eq("user_id", reminder.reminder_user_id).single();
      if (preferences?.in_app_notifications) await admin.from("notifications").insert({ user_id: reminder.reminder_user_id, category: "action_due", title: "Action due", body: reminder.action_title, href: `/actions/${reminder.action_id}` });
      if (reminder.channel === "email" && preferences?.email_reminders && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
        const { data: authUser } = await admin.auth.admin.getUserById(reminder.reminder_user_id);
        if (authUser.user?.email) {
          const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: authUser.user.email, subject: `Praxis reminder: ${reminder.action_title}`, html: `<div style="font-family:system-ui;max-width:560px;margin:auto"><h1 style="color:#214d3c">An idea you chose to apply is due.</h1><p>${escapeHtml(reminder.action_title)}</p><p><a href="${siteUrl()}/actions/${reminder.action_id}">Open action in Praxis</a></p><small>Manage reminder preferences in Praxis Settings.</small></div>` }) });
          if (response.ok) emails += 1;
        }
      }
    }
    return NextResponse.json({ processed: reminders?.length || 0, emails });
  } catch {
    return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
  }
}
