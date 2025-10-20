import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your account on pingspace.app",
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}