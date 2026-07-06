"use client";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Sparkles } from "lucide-react";

interface Props {
  onStart: () => void;
}

export const InterviewLanding = ({ onStart }: Props) => {
  return (
    <div className="w-full flex flex-col gap-12 justify-center items-center px-4 relative overflow-hidden flex-1">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 justify-center items-center mt-24 md:mt-32 relative z-10"
      >
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl select-none"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          Brainfart AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-base md:text-lg max-w-lg text-muted-foreground"
        >
          Practice technical interviews with AI-powered HR personas. Get
          real-time feedback and level up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Button
            variant="default"
            size="lg"
            className="text-base gap-2"
            onClick={onStart}
          >
            <Sparkles className="size-5" />
            Start Interview
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
