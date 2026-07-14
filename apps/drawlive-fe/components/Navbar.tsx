"use client"

import { useAuth } from "@/app/context/AuthContext"
import { useRouter } from "next/navigation"



const Navbar = () => {
    const { logout, isAuthenticated } = useAuth()
    const router = useRouter()

    function handleLogOut() {
        logout();
        router.push("/");
    }
  return (
    <nav className="max-w-6xl mx-auto px-8 py-6 flex items-center justify-between">
                <span className="font-mono text-sm tracking-tight">drawlive</span>
                <div className="flex items-center gap-6 text-sm">
                    <button onClick={() => router.push("/rooms")} className="text-white/60 hover:text-white transition-colors">
                        Rooms
                    </button>
                    {isAuthenticated ? (
                        <button onClick={handleLogOut} className="text-white font-semibold px-3 py-1 rounded-md bg-red-400 hover:bg-red-600 cursor-pointer transition-colors">
                            Log out
                        </button>
                    ) : (
                        <>
                        <button onClick={() => router.push("/signin")} className="text-white/60 hover:text-white transition-colors">
                            Sign in
                        </button>

                        <button
                            onClick={() => router.push("/signup")}
                            className="border border-white/30 rounded-md px-4 py-1.5 hover:bg-white hover:text-black transition-colors duration-150"
                        >
                            Get started
                        </button>
                        </>
                    )}
                    
                </div>
            </nav>
  )
}

export default Navbar