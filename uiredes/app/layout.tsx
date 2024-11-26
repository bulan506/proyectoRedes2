export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{backgroundColor: '#212121'}}>{children}</body>
    </html>
  );
}
