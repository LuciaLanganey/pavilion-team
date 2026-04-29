import { useState } from "react";
import { useQuery } from "convex/react";
import jsPDF from "jspdf";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type Props = {
  conversationId: Id<"conversations">;
  conversationTitle?: string;
};

type Message = {
  _id: Id<"messages">;
  senderId: Id<"users">;
  content: string;
  contentType: "text" | "image" | "file" | "system";
  createdAt: number;
  isDeleted: boolean;
  source?: "app" | "email";
  senderEmail?: string;
};

type Member = {
  userId: Id<"users">;
  role: "admin" | "member";
  user: {
    _id: Id<"users">;
    name: string;
    email: string;
  } | null;
};

// ── PDF generation ────────────────────────────────────────────────────────────

function formatTs(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    // Hard-break very long words (e.g. URLs)
    if (word.length > maxChars) {
      if (current) { lines.push(current.trimEnd()); current = ""; }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      lines.push(current.trimEnd());
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current.trimEnd());
  return lines;
}

function generatePdf(
  messages: Message[],
  members: Member[],
  conversationTitle: string,
  conversationId: string,
): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const PAGE_W = 210;
  const MARGIN = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const PAGE_H = 297;
  const FOOTER_H = 14;
  const CONTENT_BOTTOM = PAGE_H - FOOTER_H - 5;

  const WRAP_CHARS = 88; // approximate characters per line at 10pt

  let y = MARGIN;
  let pageNum = 1;

  const addFooter = () => {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.line(MARGIN, PAGE_H - FOOTER_H, PAGE_W - MARGIN, PAGE_H - FOOTER_H);
    doc.text(
      "Procurement Communication Record — Confidential",
      MARGIN,
      PAGE_H - FOOTER_H + 5,
    );
    doc.text(
      `Page ${pageNum}`,
      PAGE_W - MARGIN,
      PAGE_H - FOOTER_H + 5,
      { align: "right" },
    );
    doc.setTextColor(0, 0, 0);
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > CONTENT_BOTTOM) {
      addFooter();
      doc.addPage();
      pageNum++;
      y = MARGIN;
    }
  };

  // ── Cover / header ──────────────────────────────────────────────────────────

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Procurement Communication Record", PAGE_W / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(conversationTitle, PAGE_W / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(100, 100, 220);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);

  // ── Metadata block ──────────────────────────────────────────────────────────

  const metaLeft = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${label}:`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, MARGIN + 40, y);
    y += 5.5;
  };

  const nonDeleted = messages.filter((m) => !m.isDeleted && m.contentType === "text");
  const firstTs = nonDeleted[0]?.createdAt;
  const lastTs = nonDeleted[nonDeleted.length - 1]?.createdAt;

  metaLeft("Conversation ID", conversationId);
  metaLeft(
    "Date range",
    firstTs && lastTs
      ? `${formatDate(firstTs)} – ${formatDate(lastTs)}`
      : "No messages",
  );
  metaLeft("Generated", formatDate(Date.now()));
  metaLeft("Total messages", String(nonDeleted.length));
  y += 2;

  // Participants list
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Participants:", MARGIN, y);
  y += 5;

  for (const m of members) {
    if (!m.user) continue;
    doc.setFont("helvetica", "normal");
    const role = m.role === "admin" ? "Admin" : "Member";
    doc.text(`• ${m.user.name} (${role})  <${m.user.email}>`, MARGIN + 4, y);
    y += 5;
  }
  y += 4;

  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 8;

  // ── Section title ───────────────────────────────────────────────────────────

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Message Log", MARGIN, y);
  y += 8;

  // ── Messages ────────────────────────────────────────────────────────────────

  const memberMap = new Map(
    members
      .filter((m) => m.user)
      .map((m) => [m.userId as string, m.user!]),
  );

  for (const msg of messages) {
    if (msg.isDeleted) continue;
    if (msg.contentType !== "text") continue;

    const sender = memberMap.get(msg.senderId as string);
    const senderName = sender?.name ?? msg.senderEmail ?? "Unknown";
    const sourceLabel = msg.source === "email" ? " [via email]" : "";
    const header = `${formatTs(msg.createdAt)}  ·  ${senderName}${sourceLabel}`;

    const bodyLines = wrapText(msg.content, WRAP_CHARS);
    const blockHeight = 5 + bodyLines.length * 4.5 + 6;

    checkPageBreak(blockHeight);

    // Message header row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 180);
    doc.text(header, MARGIN, y);
    doc.setTextColor(0, 0, 0);
    y += 5;

    // Message body
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    for (const line of bodyLines) {
      checkPageBreak(5);
      doc.text(line, MARGIN, y);
      y += 4.5;
    }

    y += 3;
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    doc.setDrawColor(0, 0, 0);
    y += 5;
  }

  addFooter();

  const safeTitle = conversationTitle.replace(/[^a-z0-9_-]/gi, "_").slice(0, 40);
  doc.save(`procurement-record_${safeTitle}_${Date.now()}.pdf`);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExportPdfButton({ conversationId, conversationTitle }: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messages = useQuery(
    api.functions.messages.queries.exportMessages,
    { conversationId },
  );

  const members = useQuery(
    api.functions.conversations.queries.getConversationMembers,
    { conversationId },
  );

  const handleExport = () => {
    if (!messages || !members) return;
    setExporting(true);
    setError(null);

    try {
      generatePdf(
        messages as Message[],
        members as Member[],
        conversationTitle ?? "Procurement Conversation",
        conversationId,
      );
    } catch (err) {
      console.error("PDF export failed:", err);
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const isLoading = messages === undefined || members === undefined;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <button
        type="button"
        onClick={handleExport}
        disabled={isLoading || exporting}
        title="Export full conversation as PDF for procurement records"
        style={{
          padding: "5px 12px",
          fontSize: "12px",
          fontWeight: 600,
          borderRadius: "6px",
          border: "1px solid #c7d2fe",
          background: exporting ? "#e0e7ff" : "#f5f3ff",
          color: "#4338ca",
          cursor: isLoading || exporting ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.6 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {exporting ? "Generating…" : "Export PDF"}
      </button>
      {error && (
        <span style={{ fontSize: "11px", color: "#dc2626" }}>{error}</span>
      )}
    </span>
  );
}
