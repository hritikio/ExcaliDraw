import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points: { x: number; y: number }[];
    };

type CleanupFn = () => void;

// ─── Viewport state (mutable, shared with Canvas.tsx via window) ──────────────
export interface Viewport {
  offsetX: number;
  offsetY: number;
  scale: number;
}

const MIN_SCALE = 0.05;
const MAX_SCALE = 20;

/** Convert screen → world coordinates */
function toWorld(sx: number, sy: number, vp: Viewport) {
  return {
    x: (sx - vp.offsetX) / vp.scale,
    y: (sy - vp.offsetY) / vp.scale,
  };
}

/** Zoom around a focal screen point */
function zoomAt(vp: Viewport, focalX: number, focalY: number, delta: number): Viewport {
  const factor = delta > 0 ? 1.1 : 1 / 1.1;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, vp.scale * factor));
  const ratio = newScale / vp.scale;
  return {
    scale: newScale,
    offsetX: focalX - ratio * (focalX - vp.offsetX),
    offsetY: focalY - ratio * (focalY - vp.offsetY),
  };
}

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
): Promise<CleanupFn> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  // ─── Viewport ───────────────────────────────────────────────────────────────
  let vp: Viewport = { offsetX: 0, offsetY: 0, scale: 1 };

  // Expose viewport so Canvas.tsx zoom buttons can read/write it
  // @ts-ignore
  window.__vp = vp;
  // @ts-ignore
  window.__setVp = (next: Viewport) => {
    vp = next;
    // @ts-ignore
    window.__vp = vp;
    renderAll();
    // notify Canvas.tsx to update the scale display
    // @ts-ignore
    window.__onVpChange?.(vp);
  };

  let existingShapes: Shape[] = await getExistingShapes(roomId);
  renderAll();

  // ─── Render ─────────────────────────────────────────────────────────────────
  function renderAll(previewFn?: () => void) {
    ctx!.save();
    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, canvas.width, canvas.height);

    // Infinite dot-grid background
    drawGrid(ctx!, canvas, vp);

    // Apply viewport transform
    ctx!.setTransform(vp.scale, 0, 0, vp.scale, vp.offsetX, vp.offsetY);

    ctx!.strokeStyle = "rgba(255,255,255,0.9)";
    ctx!.lineWidth = 2 / vp.scale;

    existingShapes.forEach((shape) => drawShape(ctx!, shape));

    // Preview (shape being drawn right now)
    previewFn?.();

    ctx!.restore();
  }

  // ─── Incoming WS shapes ─────────────────────────────────────────────────────
  function onMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsed = JSON.parse(message.message);
        if (parsed.shape) {
          existingShapes.push(parsed.shape);
          renderAll();
        }
      }
    } catch {}
  }
  socket.addEventListener("message", onMessage);

  // ─── Pan state ──────────────────────────────────────────────────────────────
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panStartOffset = { x: 0, y: 0 };

  // ─── Drawing state ───────────────────────────────────────────────────────────
  let isDrawing = false;
  let startWorld = { x: 0, y: 0 };
  let pencilPoints: { x: number; y: number }[] = [];

  // ─── Mouse down ─────────────────────────────────────────────────────────────
  function onMouseDown(e: MouseEvent) {
    // @ts-ignore
    const tool = window.selectedTool as string;

    if (tool === "pan" || e.button === 1) {
      // Middle-click or pan tool → start panning
      isPanning = true;
      panStartX = e.clientX;
      panStartY = e.clientY;
      panStartOffset = { x: vp.offsetX, y: vp.offsetY };
      canvas.style.cursor = "grabbing";
      return;
    }

    isDrawing = true;
    startWorld = toWorld(e.clientX, e.clientY, vp);
    if (tool === "pencil") {
      pencilPoints = [{ ...startWorld }];
    }
  }

  // ─── Mouse move ─────────────────────────────────────────────────────────────
  function onMouseMove(e: MouseEvent) {
    if (isPanning) {
      vp = {
        ...vp,
        offsetX: panStartOffset.x + (e.clientX - panStartX),
        offsetY: panStartOffset.y + (e.clientY - panStartY),
      };
      // @ts-ignore
      window.__vp = vp;
      // @ts-ignore
      window.__onVpChange?.(vp);
      renderAll();
      return;
    }

    if (!isDrawing) return;

    // @ts-ignore
    const tool = window.selectedTool as string;
    const cur = toWorld(e.clientX, e.clientY, vp);

    if (tool === "pencil") {
      pencilPoints.push({ ...cur });
    }

    renderAll(() => {
      // Draw live preview in world space (transform already applied)
      ctx!.strokeStyle = "rgba(255,255,255,0.9)";
      ctx!.lineWidth = 2 / vp.scale;

      const w = cur.x - startWorld.x;
      const h = cur.y - startWorld.y;

      if (tool === "rect") {
        ctx!.strokeRect(startWorld.x, startWorld.y, w, h);
      } else if (tool === "circle") {
        const radius = Math.max(Math.abs(w), Math.abs(h)) / 2;
        const cx = startWorld.x + (w > 0 ? radius : -radius);
        const cy = startWorld.y + (h > 0 ? radius : -radius);
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx!.stroke();
      } else if (tool === "pencil") {
        drawPencilPoints(ctx!, pencilPoints, 2 / vp.scale);
      }
    });
  }

  // ─── Mouse up ───────────────────────────────────────────────────────────────
  function onMouseUp(e: MouseEvent) {
    if (isPanning) {
      isPanning = false;
      // @ts-ignore
      canvas.style.cursor = window.selectedTool === "pan" ? "grab" : "crosshair";
      return;
    }

    if (!isDrawing) return;
    isDrawing = false;

    // @ts-ignore
    const tool = window.selectedTool as string;
    const cur = toWorld(e.clientX, e.clientY, vp);
    const w = cur.x - startWorld.x;
    const h = cur.y - startWorld.y;

    let shape: Shape | null = null;
    if (tool === "rect") {
      shape = { type: "rect", x: startWorld.x, y: startWorld.y, width: w, height: h };
    } else if (tool === "circle") {
      const radius = Math.max(Math.abs(w), Math.abs(h)) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: startWorld.x + (w > 0 ? radius : -radius),
        centerY: startWorld.y + (h > 0 ? radius : -radius),
      };
    } else if (tool === "pencil" && pencilPoints.length > 1) {
      shape = { type: "pencil", points: [...pencilPoints] };
      pencilPoints = [];
    }

    if (!shape) return;

    existingShapes.push(shape);
    renderAll();

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "chat", message: JSON.stringify({ shape }), roomId }));
    }
  }

  // ─── Scroll to zoom ─────────────────────────────────────────────────────────
  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const next = zoomAt(vp, e.clientX, e.clientY, -e.deltaY);
    vp = next;
    // @ts-ignore
    window.__vp = vp;
    // @ts-ignore
    window.__onVpChange?.(vp);
    renderAll();
  }

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
    canvas.removeEventListener("wheel", onWheel);
    socket.removeEventListener("message", onMessage);
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
  if (shape.type === "rect") {
    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  } else if (shape.type === "circle") {
    ctx.beginPath();
    ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (shape.type === "pencil") {
    drawPencilPoints(ctx, shape.points, ctx.lineWidth);
  }
}

function drawPencilPoints(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  lineWidth: number
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

/** Infinite dot-grid background that stays fixed relative to viewport */
function drawGrid(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, vp: Viewport) {
  // Grid spacing in world units
  const BASE_SPACING = 40;
  // Adapt spacing for zoom level
  let spacing = BASE_SPACING * vp.scale;
  while (spacing < 20) spacing *= 4;
  while (spacing > 80) spacing /= 2;

  const dotRadius = Math.max(0.8, 1.2 * (vp.scale > 1 ? 1 : vp.scale));

  // Offset so dots move with the canvas pan
  const startX = ((vp.offsetX % spacing) + spacing) % spacing;
  const startY = ((vp.offsetY % spacing) + spacing) % spacing;

  ctx.fillStyle = "rgba(255,255,255,0.12)";

  for (let x = startX - spacing; x < canvas.width + spacing; x += spacing) {
    for (let y = startY - spacing; y < canvas.height + spacing; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

async function getExistingShapes(roomId: string): Promise<Shape[]> {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const messages: { message: string }[] = res.data.messages ?? [];
    return messages
      .map((x) => {
        try {
          return JSON.parse(x.message)?.shape ?? null;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Shape[];
  } catch {
    return [];
  }
}