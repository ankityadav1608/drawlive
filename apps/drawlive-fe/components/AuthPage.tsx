"use client"

import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/AuthContext"

const AuthPage = ({ isSignIn }: { isSignIn: boolean }) => {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const { login } = useAuth()
  async function handleSignIn() {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/signin`, {
        username,
        password
      })
      login(response.data.token)
      router.push("/rooms")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "Sign in failed")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp() {
    try {
      setLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_HTTP_URL}/signup`, {
        username,
        name,
        password
      })
      alert(response.data.message)
      router.push("/signin")
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message ?? "Sign up failed")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-black text-white flex items-center justify-center px-6"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="w-full max-w-sm">
        <Link href="/" className="font-mono text-sm text-white/40 hover:text-white transition-colors block text-center mb-8">
          drawlive
        </Link>

        <div className="relative border border-white/15 rounded-sm p-8 bg-black/40">
          <span className="pointer-events-none absolute -top-px -left-px w-4 h-4 border-t border-l border-white/40" />
          <span className="pointer-events-none absolute -top-px -right-px w-4 h-4 border-t border-r border-white/40" />
          <span className="pointer-events-none absolute -bottom-px -left-px w-4 h-4 border-b border-l border-white/40" />
          <span className="pointer-events-none absolute -bottom-px -right-px w-4 h-4 border-b border-r border-white/40" />

          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-2">
            {isSignIn ? "welcome back" : "get started"}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-8">
            {isSignIn ? "Sign in" : "Create an account"}
          </h1>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-white/40">username</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-md px-4 py-2.5 text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/25"
                type="text"
                placeholder="yourname"
              />
            </div>

            {!isSignIn && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono text-white/40">name</label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/15 rounded-md px-4 py-2.5 text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/25"
                  type="text"
                  placeholder="Your Name"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-white/40">password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-md px-4 py-2.5 text-sm outline-none focus:border-white/40 transition-colors placeholder:text-white/25"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <button
              onClick={isSignIn ? handleSignIn : handleSignUp}
              disabled={loading}
              className="mt-2 bg-white text-black rounded-md py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : isSignIn ? "Sign in" : "Sign up"}
            </button>
          </div>

          <div className="flex justify-center items-center text-sm mt-6 pt-6 border-t border-white/10">
            {isSignIn ? (
              <p className="text-white/40">
                New to drawlive?{" "}
                <Link className="text-white hover:text-white/70 transition-colors" href="/signup">
                  Sign up
                </Link>
              </p>
            ) : (
              <p className="text-white/40">
                Already have an account?{" "}
                <Link className="text-white hover:text-white/70 transition-colors" href="/signin">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage