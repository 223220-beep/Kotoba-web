import { MainLayout } from "@/components/layout/MainLayout";

export default function MainGroupRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
