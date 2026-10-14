// Draws the "Certificate of Achievement" image in the browser (no server needed).

export type CertInput = { name: string; game: string; score: string; medal: "Gold" | "Silver" | "Bronze"; date: string };

const W = 1600;
const H = 1130;

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function starPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const x = cx + rad * Math.cos(ang);
    const y = cy + rad * Math.sin(ang);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** sets a font that is shrunk until the text fits the width */
function fit(ctx: CanvasRenderingContext2D, text: string, family: string, start: number, maxW: number, weight = 700) {
  let size = start;
  do {
    ctx.font = `${weight} ${size}px ${family}`;
    size -= 4;
  } while (ctx.measureText(text).width > maxW && size > 30);
}

export async function makeCertificate(c: CertInput): Promise<Blob> {
  try {
    await document.fonts.ready;
  } catch {
    // fonts not ready: fall back to system fonts
  }
  const display =
    (document.querySelector(".font-display") && getComputedStyle(document.querySelector(".font-display")!).fontFamily) ||
    "Impact, Arial Black, sans-serif";
  const body = '"Helvetica Neue", Arial, sans-serif';

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const gold = c.medal === "Gold";
  const medalA = gold ? "#f5c542" : c.medal === "Silver" ? "#dfe5ec" : "#d9a066";
  const medalB = gold ? "#b8860b" : c.medal === "Silver" ? "#7b8794" : "#8a5a2b";

  // background
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 900);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(220,38,38,0.07)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // borders
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 26;
  ctx.strokeRect(13, 13, W - 26, H - 26);
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 5;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // logo
  const logo = await loadImage("/images/teambull-logo.png");
  if (logo) {
    const h = 170;
    const w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, W / 2 - w / 2, 95, w, h);
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `600 30px ${body}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("TEAMBULL FUEL HOUSE", W / 2, 325);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#dc2626";
  fit(ctx, "CERTIFICATE OF ACHIEVEMENT", display, 104, W - 300);
  ctx.fillText("CERTIFICATE OF ACHIEVEMENT", W / 2, 440);

  ctx.fillStyle = "#5f6368";
  ctx.font = `italic 34px Georgia, serif`;
  ctx.fillText("This is proudly presented to", W / 2, 520);

  // name (shrinks to fit)
  let size = 130;
  ctx.fillStyle = "#1a1a1a";
  do {
    ctx.font = `700 ${size}px ${display}`;
    size -= 6;
  } while (ctx.measureText(c.name).width > W - 360 && size > 50);
  ctx.fillText(c.name, W / 2, 650);
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 380, 685);
  ctx.lineTo(W / 2 + 380, 685);
  ctx.stroke();

  ctx.fillStyle = "#5f6368";
  ctx.font = `italic 34px Georgia, serif`;
  ctx.fillText(`for winning the ${c.medal} medal in`, W / 2, 755);

  ctx.fillStyle = "#dc2626";
  fit(ctx, c.game.toUpperCase(), display, 78, W - 500);
  ctx.fillText(c.game.toUpperCase(), W / 2, 845);

  ctx.fillStyle = "#1a1a1a";
  ctx.font = `600 38px ${body}`;
  ctx.fillText(`Score: ${c.score}`, W / 2, 905);

  // medal seal (bottom left)
  const mx = 270;
  const my = 930;
  const mg = ctx.createLinearGradient(mx - 90, my - 90, mx + 90, my + 90);
  mg.addColorStop(0, medalA);
  mg.addColorStop(1, medalB);
  ctx.fillStyle = mg;
  ctx.beginPath();
  ctx.arc(mx, my, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mx, my, 76, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1a1a1a";
  starPath(ctx, mx, my - 6, 46);
  ctx.fill();
  ctx.font = `700 22px ${body}`;
  ctx.fillText(c.medal.toUpperCase(), mx, my + 62);

  // date (bottom right)
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `600 32px ${body}`;
  ctx.fillText(c.date, W - 270, 940);
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W - 400, 955);
  ctx.lineTo(W - 140, 955);
  ctx.stroke();
  ctx.fillStyle = "#5f6368";
  ctx.font = `24px ${body}`;
  ctx.fillText("Date", W - 270, 990);

  // footer
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `700 34px ${display}`;
  ctx.fillText("FUEL YOUR GAINS", W / 2, 985);
  ctx.fillStyle = "#5f6368";
  ctx.font = `24px ${body}`;
  ctx.fillText("teambullfuelhouse.com  ·  Puducherry", W / 2, 1025);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"));
}
