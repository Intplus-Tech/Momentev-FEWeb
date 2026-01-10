export default function VendorAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="h-screen overflow-hidden">{children}</main>
    </>
  );
}
