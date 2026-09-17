import type { Metadata } from "next";
import { SignupForm } from "../../../components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create your Praxis account — Praxis",
  description: "Create a Praxis account to turn what you learn into what you do.",
};

export default function SignupPage() {
  return <SignupForm />;
}
