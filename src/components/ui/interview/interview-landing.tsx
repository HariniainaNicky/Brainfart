"use client";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Sparkles } from "lucide-react";

interface Props {
  onStart: () => void;
}

export const InterviewLanding = ({ onStart }: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 items-center relative z-10"
      >
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl select-none text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          Brainfart AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-sm md:text-base max-w-md text-muted-foreground"
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
