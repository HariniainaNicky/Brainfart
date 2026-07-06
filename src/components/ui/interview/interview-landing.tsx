"use client";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Separator } from "../shadcn-component/separator";
import {
  Sparkles,
  Brain,
  Cpu,
  Database,
  Code2,
  Network,
  Monitor,
  Terminal,
  Shield,
  Globe,
  Cloud,
  Smartphone,
  Gamepad2,
} from "lucide-react";

const roles = [
  { id: "backend", name: "Backend Developer", icon: Terminal },
  { id: "frontend", name: "Frontend Developer", icon: Monitor },
  { id: "fullstack", name: "Full Stack Developer", icon: Code2 },
  { id: "devops", name: "DevOps Engineer", icon: Cpu },
  { id: "data", name: "Data Engineer", icon: Database },
  { id: "datascience", name: "Data Scientist", icon: Brain },
  { id: "mobile", name: "Mobile Developer", icon: Smartphone },
  { id: "security", name: "Security Engineer", icon: Shield },
  { id: "cloud", name: "Cloud Architect", icon: Cloud },
  { id: "network", name: "Network Engineer", icon: Globe },
  { id: "game", name: "Game Developer", icon: Gamepad2 },
  { id: "sre", name: "Site Reliability Eng.", icon: Network },
] as const;

const steps = [
  {
    number: "01",
    title: "Pick a Role",
    desc: "Choose from 12 engineering roles to practice",
  },
  {
    number: "02",
    title: "AI Becomes the Interviewer",
    desc: "An HR persona tailored to your role starts the interview",
  },
  {
    number: "03",
    title: "Answer Technical Questions",
    desc: "Real interview questions adapted to your mastery level",
  },
  {
    number: "04",
    title: "Get Evaluated & Level Up",
    desc: "AI scores your answer, tracks progress, recommends next steps",
  },
];

interface Props {
  onSelectRole: (role: string) => void;
}

export const InterviewLanding = ({ onSelectRole }: Props) => {
  return (
    <div className="w-full flex flex-col gap-12 justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-6 justify-center items-center mt-16 md:mt-24 relative z-10"
      >
        <motion.h1
          className="cursor-pointer text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl select-none"
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
          Practice technical interviews with AI-powered HR personas. Pick a role
          and get real-time feedback.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        <div className="flex flex-col gap-6 items-center mb-8">
          <h2 className="text-2xl font-semibold">Pick a role</h2>
          <p className="text-sm text-muted-foreground">
            Choose the position you want to interview for
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
              whileHover={{
                y: -4,
                transition: { type: "spring", stiffness: 300 },
              }}
              onClick={() => onSelectRole(role.id)}
              className="relative flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md hover:ring-1 hover:ring-primary/30 transition-all duration-200 cursor-pointer"
            >
              <role.icon className="size-6 text-primary" />
              <span className="text-sm font-medium">{role.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Button
            variant="default"
            size="lg"
            className="text-base gap-2"
            onClick={() => {
              const random = roles[Math.floor(Math.random() * roles.length)];
              onSelectRole(random.id);
            }}
          >
            <Sparkles className="size-5" />
            Surprise Me
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="w-full max-w-3xl"
      >
        <Separator className="mb-10" />
        <h2 className="text-2xl font-semibold text-center mb-8">
          How it works
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.0 + i * 0.1,
                duration: 0.4,
              }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {step.number}
              </div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
