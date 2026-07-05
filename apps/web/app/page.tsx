"use client"

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";



export default function Home() {
  //user react forms or react hook forms for storing form data;
  const [slug, setSlug] = useState("");
  const router = useRouter()

  return (
    <div>
     <input type="text" placeholder="Enter room slug" value={slug} onChange={(e) => {
      setSlug(e.target.value);
     }}/>

     <button onClick={() => {
      router.push(`/chats/${slug}`)
     }}>Join Room</button>
    </div>
  );
}
