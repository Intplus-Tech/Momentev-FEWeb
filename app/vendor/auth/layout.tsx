export default function VendorAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <main className="bg-[url(/assets/images/sign-in-bg.png)] bg-cover bg-center min-h-screen flex items-center justify-center"> */}
      <main>{children}</main>
    </>
  );
}
