"use client"
import Image, { type ImageProps } from "next/image";
import styles from "./page.module.css";
import React, { useState } from "react";
import {  useRouter } from "next/navigation";



export default function Home() {
  const [roomId,setroomId]= useState("");
  const router = useRouter()

  const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault()
    console.log(roomId);
    router.push(`room/${roomId}`)
    
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Join Room
        <input type="text" onChange={(e) => setroomId(e.target.value)} />
      </label>
      <button>Join Room</button>
    </form>
  );
}
