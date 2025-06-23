import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // fallback if no session
}
