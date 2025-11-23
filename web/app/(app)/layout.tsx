import { DesktopNavigation } from "@/components/desktop-navigation";

export default function AppLayout({
  children,
  overlay,
}: Readonly<{
  children: React.ReactNode;
  overlay: React.ReactNode
}>) {
  return <>
    <DesktopNavigation />
    {children}
    {overlay}
  </>
}