"use client"

import Button from "./ui/button"



const AuthPage = ({ isSignIn }: { isSignIn: boolean}) => {
  return (
    <div>
        <input type="text" placeholder="username"/>
        {isSignIn ? null : <input type="text" placeholder="name"/>}
        <input type="password" placeholder="password"/>
        <Button color={"white"} size={"medium"} >{isSignIn ? "Sign In" : "Sign Up"}</Button>
    </div>
  )
}

export default AuthPage