import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // If Firebase Admin isn't configured, acknowledge and return
    if (!adminDb) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    const { type, call } = body;

    if (!call?.id) {
      return NextResponse.json({ ok: true });
    }

    const callId = call.id;

    if (type === "end-of-call-report") {
      // Find the session with this vapi call id
      const sessionsSnap = await adminDb
        .collection("sessions")
        .where("vapiCallId", "==", callId)
        .limit(1)
        .get();

      if (!sessionsSnap.empty) {
        const sessionDoc = sessionsSnap.docs[0];
        const transcript = call.artifact?.transcript || "";

        // Parse Vapi transcript format into our format
        const messages = (call.artifact?.messages || []).map(
          (msg: { role: string; message: string; time?: number }, i: number) => ({
            id: `msg-${i}`,
            speaker: msg.role === "assistant" ? "ai" : "user",
            text: msg.message || "",
            timestamp: msg.time || 0,
            isFinal: true,
          })
        );

        await sessionDoc.ref.update({
          status: "completed",
          feedbackStatus: "pending",
          transcript: messages,
          rawTranscript: transcript,
          durationSeconds: call.artifact?.durationSeconds || 0,
          endedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (type === "status-update" && call.status === "in-progress") {
      // Mark session as started
      const sessionsSnap = await adminDb
        .collection("sessions")
        .where("vapiCallId", "==", callId)
        .limit(1)
        .get();

      if (!sessionsSnap.empty) {
        await sessionsSnap.docs[0].ref.update({
          status: "in_progress",
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vapi webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to Vapi
  }
}
