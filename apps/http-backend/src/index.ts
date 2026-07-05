import express from "express";
import jwt from "jsonwebtoken"
import { middleware } from "./middleware";
import { CreateRoomSchema, CreateUserSchema, SignInSchema } from "@repo/common/types";
import { prisma } from "@repo/db/prisma"
import bcrypt from "bcrypt"
import { JWT_SECRET } from "@repo/backend-common/config";
import cors from "cors";

const app = express();
app.use(express.json())

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

app.get("/", (req, res) => {
    res.send("hi from http-backend")
})

app.post("/signup",async (req, res) => {
   
    try {
         const parsed = CreateUserSchema.safeParse(req.body)

        if(!parsed.success) {
            res.status(400).json({
                message: "incorrect inputs"
            })
            return
        }

        const { username, password, name, photo} = parsed.data;

        const uniqueUsername = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if(uniqueUsername) {
            res.status(409).json({
                success: false,
                message: "username already exists"
            })
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                photo: photo ?? ""
            }
        })


        return res.status(200).json({
            userId: user.id,
            username: user.name,
            name: user.name,
            message: "sign up successful"
        })
    } catch(e) {
        console.error(e)
        return res.status(500).json({
            message: "internal server error"
        })
    }

})

app.post("/signin",async (req, res) => {

    try {
        const parsed = SignInSchema.safeParse(req.body);

        if(!parsed.success) {
            res.status(401).json({
                success: false,
                message: "incorrect input"
            })
            return
        }

        const { username, password} = parsed.data;

        const user = await prisma.user.findUnique({
            where: {
                username
            }
        })

        if(!user) {
            res.status(404).json({
                success: false,
                message: "user not found"
            })
            return
        }

        const passwordCompare = await bcrypt.compare(password, user.password)

        if(!passwordCompare) {
            res.status(401).json({
                success: false,
                message: "incorrect input"
            })
            return
        }

        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET!, { expiresIn: "7d"})

        return res.status(200).json({
           message: "signin successfull",
           token
        })
    }catch(e){
        console.error(e)
        return res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }
})


app.post("/room",middleware,async (req, res) => {
   try {
    const parsed = CreateRoomSchema.safeParse(req.body);

    if(!parsed.success) {
        res.status(401).json({
            success: false,
            message: "incorrect input"
        })
        return
    }

    const { slug } = parsed.data;

    const room = await prisma.room.findUnique({
        where: {
            slug
        }
    })

    if(room){
        res.status(409).json({
            success: false,
            message: "room name already exists"
        })
        return
    }

    if (!req.userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    const createRoom = await prisma.room.create({
        data: {
            slug,
            adminId: req.userId
        }
    })

    return res.status(200).json({
        success: true,
        message: "room created successfully",
        roomId: createRoom.id,
        roomName: createRoom.slug
    })

   } catch(e) {
    console.error(e);
    return res.status(500).json({
        success: false,
        message: "internal server error"
    })
   }
})

app.get("/chats/:slug",middleware, async (req, res) =>{
    try {

        const slug = req.params.slug;

        if (!slug || Array.isArray(slug)) {
        return res.status(400).json({
            success: false,
            message: "Invalid room slug"
        });
        }

        const room = await prisma.room.findUnique({
            where: {
                slug
            },
            include: {
                chats: true
            }
        })

        if(!room) { 
            res.status(404).json({
                success: false,
                message: "room does not exist"
            })
            return
        }

        return res.status(200).json({
            success: true,
            chats: room.chats
        })
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: "internal server error"
        })
    }


})

app.get("/room/:slug",async (req, res) => {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({
        where: {
            slug
        }
    })

    if(!room) {
        res.json({
            message: "room does not exist"
        })
        return
    }
    res.json({
        roomId: room.id
    })
})

app.listen(3001, () => {
    console.log("listening on port 3001")
})