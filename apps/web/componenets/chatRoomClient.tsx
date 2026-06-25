"use client"

import { useEffect, useState } from "react"
import { useSocket } from "../hooks/useSocket";

export function ChatRoomClient({messages,id}:{
    messages:{message:String}[],
    id:String
}){
    const {socket,Loading}=useSocket()


    useEffect(()=>{

    },[socket,Loading])

}