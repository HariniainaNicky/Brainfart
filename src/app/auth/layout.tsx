import "@/app/globals.css";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen overflow-hidden p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-primary/5 dark:bg-primary/10 blur-2xl" />
      </div>
      <div className="relative flex flex-col items-center gap-6 sm:gap-8 w-full max-w-sm sm:max-w-md">
        <div className="text-center space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            BrainFart
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Sign in to play
          </p>
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-5 sm:p-6 md:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
