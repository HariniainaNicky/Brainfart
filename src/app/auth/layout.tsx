import Link from "next/link";
import "@/app/globals.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4 sm:p-6 bg-background">
      <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-sm sm:max-w-md">
        <div className="text-center space-y-2">
          <Link href="/">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight hover:text-primary transition-colors">
              BrainFart
            </h1>
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in to play
          </p>
          <Link
            href="/"
            className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-5 sm:p-6 md:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
