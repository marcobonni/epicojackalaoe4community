"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

type DownloadSummaryMode = {
  label: string;
  rating: number | null;
  maxRating: number | null;
  rank: number | null;
  winRate: number | null;
  games: number | null;
  wins: number | null;
  losses: number | null;
  streak: number | null;
};

type DownloadSummaryCiv = {
  name: string;
  games: number | null;
  winRate: number | null;
  pickRate: number | null;
};

type PlayerSummaryDownloadButtonProps = {
  playerName: string;
  country: string | null;
  rankLevel: string;
  currentRank: number | null;
  currentRating: number | null;
  totalGames: number | null;
  streak: number | null;
  lastGameAt: string | null;
  peakRating: number | null;
  rows: DownloadSummaryMode[];
  topCivs: DownloadSummaryCiv[];
};

const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 980;

function formatNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return new Intl.NumberFormat("it-IT").format(value);
}

function formatPercent(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value.toFixed(1)}%`;
}

function formatSignedNumber(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `${value > 0 ? "+" : ""}${formatNumber(value)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.arcTo(
    x + width,
    y + height,
    x + width - safeRadius,
    y + height,
    safeRadius
  );
  ctx.lineTo(x + safeRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.arcTo(x, y, x + safeRadius, y, safeRadius);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string | CanvasGradient
) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth = 1
) {
  ctx.save();
  roundedRect(ctx, x, y, width, height, radius);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function drawFittedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxFontSize: number,
  minFontSize: number,
  color: string,
  weight = 700
) {
  let fontSize = maxFontSize;

  while (fontSize > minFontSize) {
    ctx.font = `${weight} ${fontSize}px sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    fontSize -= 2;
  }

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function getModeAccent(label: string) {
  switch (label) {
    case "1v1":
      return "#f59e0b";
    case "2v2":
      return "#3b82f6";
    case "3v3":
      return "#22c55e";
    case "4v4":
      return "#ec4899";
    default:
      return "#94a3b8";
  }
}

async function waitForFonts() {
  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }
}

export default function PlayerSummaryDownloadButton({
  playerName,
  country,
  rankLevel,
  currentRank,
  currentRating,
  totalGames,
  streak,
  lastGameAt,
  peakRating,
  rows,
  topCivs,
}: PlayerSummaryDownloadButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleDownload() {
    setIsExporting(true);

    try {
      await waitForFonts();

      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas non disponibile.");
      }

      ctx.textBaseline = "top";

      const background = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      background.addColorStop(0, "#090e1d");
      background.addColorStop(0.55, "#131b33");
      background.addColorStop(1, "#25140f");
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const glow = ctx.createRadialGradient(1320, 120, 60, 1320, 120, 420);
      glow.addColorStop(0, "rgba(245,158,11,0.22)");
      glow.addColorStop(1, "rgba(245,158,11,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      fillRoundedRect(ctx, 40, 40, 1520, 210, 36, "rgba(9, 12, 26, 0.74)");
      strokeRoundedRect(ctx, 40, 40, 1520, 210, 36, "rgba(245, 158, 11, 0.2)");

      fillRoundedRect(ctx, 76, 82, 96, 96, 28, "rgba(245, 158, 11, 0.14)");
      ctx.fillStyle = "#f8fafc";
      ctx.font = "700 34px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(getInitials(playerName), 124, 108);
      ctx.textAlign = "left";

      ctx.fillStyle = "#facc15";
      ctx.font = "700 20px sans-serif";
      ctx.fillText("AOE4 PLAYER REPORT", 198, 76);

      drawFittedText(ctx, playerName, 198, 112, 620, 62, 38, "#ffffff", 800);

      const pills = [
        rankLevel,
        `Rank #${formatNumber(currentRank)}`,
        `1v1 ELO ${formatNumber(currentRating)}`,
        country ? country.toUpperCase() : null,
      ].filter((value): value is string => Boolean(value));

      let pillX = 198;
      let pillY = 188;
      pills.forEach((pill) => {
        ctx.font = "600 20px sans-serif";
        const width = ctx.measureText(pill).width + 34;
        if (pillX + width > 760) {
          pillX = 198;
          pillY += 48;
        }
        fillRoundedRect(ctx, pillX, pillY, width, 40, 20, "rgba(17,24,39,0.88)");
        strokeRoundedRect(ctx, pillX, pillY, width, 40, 20, "rgba(59,130,246,0.35)");
        ctx.fillStyle = "#dbeafe";
        ctx.font = "600 20px sans-serif";
        ctx.fillText(pill, pillX + 17, pillY + 9);
        pillX += width + 12;
      });

      const metricCards = [
        { label: "Streak", value: typeof streak === "number" ? formatSignedNumber(streak) : "--", tone: streak && streak > 0 ? "#4ade80" : "#f8fafc" },
        { label: "Partite 1v1", value: formatNumber(totalGames), tone: "#facc15" },
        { label: "Ultima partita", value: formatDate(lastGameAt), tone: "#f8fafc" },
        { label: "Peak ELO", value: formatNumber(peakRating), tone: "#facc15" },
      ];

      metricCards.forEach((card, index) => {
        const x = 840 + index * 170;
        fillRoundedRect(ctx, x, 84, 148, 122, 26, "rgba(2, 6, 23, 0.9)");
        strokeRoundedRect(ctx, x, 84, 148, 122, 26, "rgba(59,130,246,0.22)");
        ctx.fillStyle = card.tone;
        ctx.font = "700 24px sans-serif";
        drawFittedText(ctx, card.value, x + 16, 108, 116, 24, 16, card.tone, 700);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 16px sans-serif";
        ctx.fillText(card.label, x + 16, 160);
      });

      ctx.fillStyle = "#facc15";
      ctx.font = "700 18px sans-serif";
      ctx.fillText("MODE OVERVIEW", 60, 300);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 40px sans-serif";
      ctx.fillText("Statistiche principali", 60, 328);

      rows.slice(0, 4).forEach((row, index) => {
        const cardWidth = 360;
        const cardHeight = 252;
        const gap = 24;
        const x = 60 + (index % 2) * (cardWidth + gap);
        const y = 394 + Math.floor(index / 2) * (cardHeight + gap);
        const accent = getModeAccent(row.label);

        fillRoundedRect(ctx, x, y, cardWidth, cardHeight, 28, "rgba(2, 6, 23, 0.9)");
        strokeRoundedRect(ctx, x, y, cardWidth, cardHeight, 28, "rgba(51, 65, 85, 0.9)");

        ctx.fillStyle = "#ffffff";
        ctx.font = "800 32px sans-serif";
        ctx.fillText(row.label, x + 24, y + 24);

        fillRoundedRect(ctx, x + 250, y + 20, 86, 36, 18, "rgba(17,24,39,0.9)");
        strokeRoundedRect(ctx, x + 250, y + 20, 86, 36, 18, "rgba(59,130,246,0.35)");
        ctx.fillStyle = "#dbeafe";
        ctx.font = "700 18px sans-serif";
        ctx.fillText(formatPercent(row.winRate), x + 268, y + 30);

        const statBlocks = [
          { label: "ELO", value: formatNumber(row.rating) },
          { label: "RANK", value: `#${formatNumber(row.rank)}` },
          { label: "PEAK", value: formatNumber(row.maxRating) },
          { label: "MATCH", value: formatNumber(row.games) },
        ];

        statBlocks.forEach((block, blockIndex) => {
          const bx = x + 24 + (blockIndex % 2) * 156;
          const by = y + 76 + Math.floor(blockIndex / 2) * 74;
          fillRoundedRect(ctx, bx, by, 132, 60, 20, "rgba(15, 23, 42, 0.95)");
          strokeRoundedRect(ctx, bx, by, 132, 60, 20, "rgba(51,65,85,0.9)");
          ctx.fillStyle = "#64748b";
          ctx.font = "500 15px sans-serif";
          ctx.fillText(block.label, bx + 16, by + 12);
          ctx.fillStyle = "#ffffff";
          ctx.font = "700 20px sans-serif";
          ctx.fillText(block.value, bx + 16, by + 30);
        });

        const totalTracked =
          typeof row.wins === "number" && typeof row.losses === "number"
            ? row.wins + row.losses
            : 0;

        if (totalTracked > 0 && row.wins !== null && row.losses !== null) {
          const winWidth = (row.wins / totalTracked) * 312;
          const barY = y + 218;
          const labelY = y + 236;

          fillRoundedRect(ctx, x + 24, barY, 312, 16, 8, "rgba(15, 23, 42, 0.95)");
          fillRoundedRect(ctx, x + 24, barY, winWidth, 16, 8, "#10b981");
          fillRoundedRect(
            ctx,
            x + 24 + winWidth,
            barY,
            Math.max(312 - winWidth, 0),
            16,
            8,
            "#f43f5e"
          );
          ctx.fillStyle = accent;
          ctx.font = "600 15px sans-serif";
          ctx.fillText(
            `${formatNumber(row.wins)}W / ${formatNumber(row.losses)}L`,
            x + 24,
            labelY
          );
        }
      });

      fillRoundedRect(ctx, 828, 280, 732, 560, 32, "rgba(2, 6, 23, 0.9)");
      strokeRoundedRect(ctx, 828, 280, 732, 560, 32, "rgba(51,65,85,0.9)");

      ctx.fillStyle = "#facc15";
      ctx.font = "700 18px sans-serif";
      ctx.fillText("TOP CIVS", 860, 314);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 40px sans-serif";
      ctx.fillText("Civilizzazioni e resa", 860, 342);

      topCivs.slice(0, 5).forEach((civ, index) => {
        const rowY = 402 + index * 86;
        fillRoundedRect(ctx, 860, rowY, 668, 68, 22, "rgba(15, 23, 42, 0.95)");
        strokeRoundedRect(ctx, 860, rowY, 668, 68, 22, "rgba(51,65,85,0.9)");

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 24px sans-serif";
        drawFittedText(ctx, civ.name, 886, rowY + 16, 220, 24, 18, "#ffffff", 700);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 16px sans-serif";
        ctx.fillText(`${formatNumber(civ.games)} partite`, 886, rowY + 42);

        const pickText = `Pick ${formatPercent(civ.pickRate)}`;
        const wrText = `WR ${formatPercent(civ.winRate)}`;
        ctx.fillStyle = "#dbeafe";
        ctx.font = "600 18px sans-serif";
        ctx.fillText(pickText, 1130, rowY + 18);
        ctx.fillText(wrText, 1130, rowY + 42);

        const winValue =
          typeof civ.winRate === "number" && Number.isFinite(civ.winRate)
            ? civ.winRate
            : 0;
        fillRoundedRect(ctx, 1288, rowY + 22, 210, 14, 7, "rgba(15,23,42,0.9)");
        fillRoundedRect(
          ctx,
          1288,
          rowY + 22,
          (winValue / 100) * 210,
          14,
          7,
          "rgba(245,158,11,0.95)"
        );
      });

      ctx.fillStyle = "rgba(148,163,184,0.9)";
      ctx.font = "500 16px sans-serif";
      ctx.fillText(
        `Generato da aoe4community il ${new Intl.DateTimeFormat("it-IT", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date())}`,
        60,
        CANVAS_HEIGHT - 44
      );

      const link = document.createElement("a");
      link.download = `aoe4-player-${slugify(playerName || "player")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isExporting}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Esporto PNG...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Scarica PNG
        </>
      )}
    </button>
  );
}
