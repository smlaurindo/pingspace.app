import { MobileNavigation } from "@/components/mobile-navigation";

export default function MobileNavigationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>
    {children}
    <MobileNavigation />
  </>
}