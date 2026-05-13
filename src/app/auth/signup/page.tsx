import { redirect } from "next/navigation";

// No signup — redirect everyone to sign in
export default function SignupPage() {
  redirect("/auth/login");
}
