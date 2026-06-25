import { useEffect, useState } from "react";

export function useSocket(){
    const [Loading, setLoading]=useState(true);
    const [socket,setSocket]=useState<WebSocket>();

    
      useEffect(() => {
        const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_BACKEND_URL as string );
        ws.onopen=()=>{
            setLoading(false);
            setSocket(ws);
        }
      }, []);

      return {
        socket,Loading
      }

}