import { Construction } from "lucide-react";

export const PartUnderConstruction = () => {
  return (
    <div className="p-5 flex flex-col items-center justify-center h-full gap-6 text-center px-4">
      <Construction size={64} className="text-yellow-500 animate-bounce" />

      <h2 className="text-3xl md:text-5xl font-extrabold text-foreground">
        Under Construction
      </h2>

      <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
        This part of the app is currently being built. Thank you for your patience!
      </p>
    </div>
  );
};
