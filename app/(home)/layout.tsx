export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="font-inter min-h-screen overflow-hidden">{children}</div>
    </div>
  );
}
