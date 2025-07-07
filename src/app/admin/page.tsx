"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBE } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const {
        data: { session },
      } = await supabaseBE.auth.getSession();

      if (!session) {
        router.replace("/login");
      } else {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (loading) return <div>Loading...</div>;

  return <div>✅ Admin Panel</div>;
}
