import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 flex-grow pt-16 w-full overflow-y-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
