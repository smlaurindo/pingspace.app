import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account on pingspace.app",
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}