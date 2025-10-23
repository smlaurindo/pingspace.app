import { DesktopNavigation } from "@/components/desktop-navigation";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>
    <DesktopNavigation />
    {children}
  </>
}