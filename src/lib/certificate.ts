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


type Ctx = CanvasRenderingContext2D;
type Fonts = { display: string; body: string };

/** recolours a (black ink) signature image */
function tint(img: HTMLImageElement, color: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  return c;
}

/** signs on a line: the ink sits on the line like a real pen signature */
function signOnLine(ctx: Ctx, sig: HTMLImageElement | null, cx: number, lineY: number, h: number, color: string | null) {
  if (!sig) return;
  const w = (sig.width / sig.height) * h;
  const src: CanvasImageSource = color ? tint(sig, color) : sig;
  ctx.save();
  ctx.globalCompositeOperation = color ? "source-over" : "multiply";
  ctx.globalAlpha = 0.92;
  ctx.drawImage(src, cx - w / 2 + 10, lineY - h + 3, w, h);
  ctx.restore();
}

function hash(t: string) {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h << 5) + h + t.charCodeAt(i)) | 0;
  return h;
}


/** formal design: ivory paper, serif type, one calm accent */
function drawExecutive(ctx: Ctx, f: Fonts, c: CertInput, logo: HTMLImageElement | null, sig: HTMLImageElement | null) {
  const ink = "#1f2430";
  const soft = "#5b6270";
  const bronze = "#9a7b3c";
  const serif = 'Georgia, "Times New Roman", serif';
  ctx.fillStyle = "#fbf9f4";
  ctx.fillRect(0, 0, W, H);
  // subtle paper vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, 350, W / 2, H / 2, 950);
  vg.addColorStop(0, "rgba(255,255,255,0)");
  vg.addColorStop(1, "rgba(154,123,60,0.10)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  // borders
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.strokeStyle = bronze;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(58, 58, W - 116, H - 116);
  // corner brackets
  ctx.strokeStyle = bronze;
  ctx.lineWidth = 4;
  const L = 60, o = 78;
  for (const [x, y, dx, dy] of [[o, o, 1, 1], [W - o, o, -1, 1], [o, H - o, 1, -1], [W - o, H - o, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * L, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * L);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if (logo) {
    const h = 120;
    const w = (logo.width / logo.height) * h;
    ctx.drawImage(logo, W / 2 - w / 2, 92, w, h);
  }
  ctx.fillStyle = soft;
  ctx.font = `600 22px ${f.body}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("TEAMBULL FUEL HOUSE", W / 2, 252);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = ink;
  fit(ctx, "Certificate of Achievement", serif, 92, W - 340, 700);
  ctx.fillText("Certificate of Achievement", W / 2, 360);
  // rule with diamond
  ctx.strokeStyle = bronze;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 300, 392);
  ctx.lineTo(W / 2 - 20, 392);
  ctx.moveTo(W / 2 + 20, 392);
  ctx.lineTo(W / 2 + 300, 392);
  ctx.stroke();
  ctx.fillStyle = bronze;
  ctx.beginPath();
  ctx.moveTo(W / 2, 380);
  ctx.lineTo(W / 2 + 12, 392);
  ctx.lineTo(W / 2, 404);
  ctx.lineTo(W / 2 - 12, 392);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = soft;
  ctx.font = `italic 30px ${serif}`;
  ctx.fillText("This certificate is proudly awarded to", W / 2, 458);
  let size = 120;
  ctx.fillStyle = ink;
  do {
    ctx.font = `italic 700 ${size}px ${serif}`;
    size -= 6;
  } while (ctx.measureText(c.name).width > W - 380 && size > 50);
  ctx.fillText(c.name, W / 2, 575);
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 360, 604);
  ctx.lineTo(W / 2 + 360, 604);
  ctx.stroke();
  ctx.fillStyle = soft;
  ctx.font = `28px ${serif}`;
  ctx.fillText("in recognition of outstanding performance in", W / 2, 662);
  ctx.fillStyle = "#b91c1c";
  fit(ctx, c.game.toUpperCase(), serif, 56, W - 420, 700);
  ctx.letterSpacing = "4px";
  ctx.fillText(c.game.toUpperCase(), W / 2, 730);
  ctx.letterSpacing = "0px";
  ctx.fillStyle = soft;
  ctx.font = `28px ${serif}`;
  ctx.fillText(`achieving a score of ${c.score} and earning the ${c.medal} Medal.`, W / 2, 776);
  // footer: date | seal | signature
  const ly = 960;
  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(180, ly);
  ctx.lineTo(480, ly);
  ctx.moveTo(W - 480, ly);
  ctx.lineTo(W - 180, ly);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.font = `28px ${serif}`;
  ctx.fillText(c.date, 330, ly - 14);
  ctx.fillStyle = soft;
  ctx.font = `600 18px ${f.body}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("DATE", 330, ly + 30);
  ctx.fillText("FOUNDER, TEAMBULL", W - 330, ly + 60);
  ctx.letterSpacing = "0px";
  signOnLine(ctx, sig, W - 330, ly - 16, 140, "#10122a");
  ctx.fillStyle = ink;
  ctx.font = `700 26px ${serif}`;
  ctx.fillText("Vishwam D", W - 330, ly + 32);
  // seal
  const sx = W / 2, sy = 900;
  const medalCol = c.medal === "Gold" ? ["#e7c76a", "#a8801f"] : c.medal === "Silver" ? ["#e3e8ee", "#7b8794"] : ["#dcab72", "#8a5a2b"];
  ctx.save();
  ctx.translate(sx, sy);
  // ribbon tails
  ctx.fillStyle = "#b91c1c";
  ctx.beginPath();
  ctx.moveTo(-48, 40);
  ctx.lineTo(-64, 104);
  ctx.lineTo(-44, 92);
  ctx.lineTo(-26, 108);
  ctx.lineTo(-10, 50);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(48, 40);
  ctx.lineTo(64, 104);
  ctx.lineTo(44, 92);
  ctx.lineTo(26, 108);
  ctx.lineTo(10, 50);
  ctx.closePath();
  ctx.fill();
  const sg = ctx.createLinearGradient(-90, -90, 90, 90);
  sg.addColorStop(0, medalCol[0]);
  sg.addColorStop(1, medalCol[1]);
  ctx.fillStyle = sg;
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const a = (Math.PI * 2 * i) / 48;
    const r = i % 2 === 0 ? 92 : 84;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 66, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#2a2412";
  starPath(ctx, 0, -6, 38);
  ctx.fill();
  ctx.font = `700 17px ${f.body}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(c.medal.toUpperCase(), 1.5, 56);
  ctx.restore();
  // footer line
  ctx.fillStyle = soft;
  ctx.font = `18px ${f.body}`;
  ctx.fillText(`Certificate No. TB-${String(Math.abs(hash(c.name + c.game + c.date)) % 900000 + 100000)}   ·   teambullfuelhouse.com   ·   Puducherry`, W / 2, 1046);
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
  const f: Fonts = { display, body: '"Helvetica Neue", Arial, sans-serif' };

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const [logo, sig] = await Promise.all([loadImage("/images/teambull-logo.png"), loadImage("/images/signature.png")]);

  drawExecutive(ctx, f, c, logo, sig);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no image"))), "image/png"));
}
