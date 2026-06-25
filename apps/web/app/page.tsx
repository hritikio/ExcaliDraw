"use client";
import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [roomId, setroomId] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(roomId);
    router.push(`room/${roomId}`);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        height: "100vh",
        width: "100wh",
      }}
    >
      <input
        type="text"
        onChange={(e) => setroomId(e.target.value)}
        placeholder="Join Room"
        style={{ padding: "10px" }}
      />
      <button onClick={handleSubmit} style={{ padding: "10px" }} >Join Room</button>
    </div>
  );
}
