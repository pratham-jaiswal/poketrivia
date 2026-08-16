"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing sign-in...");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const createUser = async () => {
      try {
        const res = await fetch("/api/auth/create-user", {
          method: "POST",
          credentials: "same-origin",
        });

        if (!mounted) return;

        if (!res.ok) {
          const payload = await res
            .json()
            .catch(() => ({ message: "Unknown error" }));
          console.error("create-user failed", res.status, payload);
          setStatus(payload.message || "Unable to complete sign-in.");
          return;
        }

        router.replace("/pokedex");
      } catch (error) {
        console.error("create-user request failed", error);
        if (mounted) {
          setStatus("Unable to complete sign-in. Please try again.");
        }
      }
    };

    createUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1>{status}</h1>
      <p>Please wait while we finish your authentication.</p>
    </main>
  );
}
