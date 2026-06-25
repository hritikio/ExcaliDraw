import axios from "axios";

async function getChats(roomId:string){
    const response = await axios.get(`${process.env.HTTP_BACKEND_URL}/chats/${roomId}`)
    return response.data.messages

}

export default async function chatRooom({id}:{id:string}){

    const messages = await getChats(id);
    
    

}