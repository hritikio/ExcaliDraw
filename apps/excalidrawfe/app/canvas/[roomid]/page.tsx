import RoomCanvas from "@/components/RoomCanvas";

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ roomid: string }>;
}) {
  const { roomid } = await params;
  return <RoomCanvas roomId={roomid} />;
}