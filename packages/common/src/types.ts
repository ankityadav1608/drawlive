import { z } from "zod";

export const CreateUserSchema = z.object({ 
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(50),
    name: z.string().max(20),
    photo: z.string().max(50).optional()
})

export const SignInSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6).max(50)
})

export const CreateRoomSchema = z.object({
    slug: z.string().min(3).max(20)
})