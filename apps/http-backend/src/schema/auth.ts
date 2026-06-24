import z  from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(3, "password is too short").max(20),
}).strict();

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3, "password is too short").max(20),
}).strict();

export const createRoomSchema=z.object({
  roomName:z.string().min(3).max(25)
})

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;