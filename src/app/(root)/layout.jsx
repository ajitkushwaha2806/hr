import { SidebarLayout } from "@/components/sidebar/layout";

export default function RootLayout({ children }) {
  return (
    <SidebarLayout>{children}</SidebarLayout>
  );
}
