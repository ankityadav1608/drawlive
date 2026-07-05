"use client"

import axios from "axios";
import { useState } from "react";

const SignInPage = () => {
    const [username, setusername] = useState("")
    const [password, setPassword] = useState("");

    async function handleSignIn() {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/signin`, {
            username,
            password
        })
        console.log("token at signin " + response.data.token)
        localStorage.setItem("token", response.data.token)
    }

  return (
    <div>
        <input type="text" placeholder="username" onChange={(e) => {
            setusername(e.target.value)
        }}/>
        <input type="text" onChange={(e) => {
            setPassword(e.target.value)
        }}/>
        <button onClick={handleSignIn}>Sign In</button>
    </div>
  )
}

export default SignInPage