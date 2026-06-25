import axios from "axios";
async function getRoomId(slug: string) {
  const response =await axios.get(`${process.env.HTTP_BACKEND_URL}/room/${slug}`);
  return response.data.id
}

export default async function chatRoom({
  params,
}: {
  params: {
    slug: string;
  };
}) {
  const slug = params.slug;
  const roomId=await getRoomId(slug);
}
