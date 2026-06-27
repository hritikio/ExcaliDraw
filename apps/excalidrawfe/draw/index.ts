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

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
): Promise<CleanupFn> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let existingShapes: Shape[] = await getExistingShapes(roomId);

  clearCanvas(existingShapes, canvas, ctx);

  // Listen for incoming shapes from other users
  function onMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        if (parsedShape.shape) {
          existingShapes.push(parsedShape.shape);
          clearCanvas(existingShapes, canvas, ctx!);
        }
      }
    } catch {
      // Ignore non-JSON messages (e.g. echo confirmation from ws backend)
    }
  }

  socket.addEventListener("message", onMessage);

  let clicked = false;
  let startX = 0;
  let startY = 0;
  // For pencil: accumulate points while dragging
  let pencilPoints: { x: number; y: number }[] = [];

  function onMouseDown(e: MouseEvent) {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
    // @ts-ignore
    if (window.selectedTool === "pencil") {
      pencilPoints = [{ x: e.clientX, y: e.clientY }];
    }
  }

  function onMouseUp(e: MouseEvent) {
    clicked = false;
    // @ts-ignore
    const selectedTool = window.selectedTool as string;
    let shape: Shape | null = null;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    if (selectedTool === "rect") {
      shape = { type: "rect", x: startX, y: startY, width, height };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      shape = {
        type: "circle",
        radius,
        centerX: startX + (width > 0 ? radius : -radius),
        centerY: startY + (height > 0 ? radius : -radius),
      };
    } else if (selectedTool === "pencil" && pencilPoints.length > 1) {
      shape = { type: "pencil", points: [...pencilPoints] };
      pencilPoints = [];
    }

    if (!shape) return;

    existingShapes.push(shape);
    clearCanvas(existingShapes, canvas, ctx!);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          roomId,
        })
      );
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!clicked) return;
    // @ts-ignore
    const selectedTool = window.selectedTool as string;
    const width = e.clientX - startX;
    const height = e.clientY - startY;

    clearCanvas(existingShapes, canvas, ctx!);
    ctx!.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx!.lineWidth = 2;

    if (selectedTool === "rect") {
      ctx!.strokeRect(startX, startY, width, height);
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      const centerX = startX + (width > 0 ? radius : -radius);
      const centerY = startY + (height > 0 ? radius : -radius);
      ctx!.beginPath();
      ctx!.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.closePath();
    } else if (selectedTool === "pencil") {
      pencilPoints.push({ x: e.clientX, y: e.clientY });
      drawPencilPoints(ctx!, pencilPoints);
    }
  }

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);

  // Return cleanup function
  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
    socket.removeEventListener("message", onMessage);
  };
}

function drawPencilPoints(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[]
) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.closePath();
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  existingShapes.forEach((shape) => {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    } else if (shape.type === "circle") {
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    } else if (shape.type === "pencil") {
      drawPencilPoints(ctx, shape.points);
    }
  });
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
    // If fetching history fails (e.g. network error), start with empty canvas
    return [];
  }
}