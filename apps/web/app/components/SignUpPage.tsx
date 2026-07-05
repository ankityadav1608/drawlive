"use client"

import axios from "axios"
import { useState } from "react"


const SignUpPage = () => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")

    async function handleSignUp() {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/signup`, {
            username,
            password,
            name
        })

        console.log(response.data.message)
    }
  return (
    <div>
        <input type="text" placeholder="username" onChange={(e) => {
            setUsername(e.target.value)
        }}/>
        <input type="text" placeholder="name" onChange={(e) => {
            setName(e.target.value)
        }}/>
        <input type="password" placeholder="password" onChange={(e) => {
            setPassword(e.target.value)
        }}/>

        <button onClick={handleSignUp}>Sign Up</button>
    </div>
  )
}

export default SignUpPage