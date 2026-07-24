import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-kotoba-bg">
      <div className="hidden lg:flex lg:w-1/2 relative bg-kotoba-hero border-r border-kotoba-border items-center justify-center p-12 overflow-hidden">
        <div className="relative z-10 max-w-md text-center space-y-6">
          <BookOpen className="h-16 w-16 text-kotoba-gold mx-auto" />
          <h1 className="font-display text-4xl font-bold tracking-wider text-kotoba-text">
            KOTOBA<span className="text-kotoba-gold">.</span>
          </h1>
          <p className="text-kotoba-text text-lg italic">
            "La tinta es la sangre de mundos que aún no existen."
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 opacity-30">
          <div className="h-[500px] w-[500px] rounded-full bg-kotoba-gold blur-3xl"></div>
        </div>
      </div>
      
      <div className="flex flex-1 items-center justify-center p-8 lg:p-12 relative">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-kotoba-gold" />
              <span className="font-display text-2xl font-bold tracking-wider text-kotoba-text">
                KOTOBA<span className="text-kotoba-gold">.</span>
              </span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
