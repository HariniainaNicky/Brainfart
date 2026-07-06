"use client";
import { motion } from "motion/react";
import { Button } from "../shadcn-component/button";
import { Badge } from "../shadcn-component/badge";
import { Separator } from "../shadcn-component/separator";
import { useRouter } from "next/navigation";
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
    BookOpen,
    Globe,
    Workflow,
} from "lucide-react";

const categories = [
    { id: "t-ai", name: "Artificial Intelligence", icon: Brain },
    { id: "t-algo", name: "Algorithms", icon: Workflow },
    { id: "t-db", name: "Databases", icon: Database },
    { id: "t-ds", name: "Data Structures", icon: Code2 },
    { id: "t-net", name: "Computer Networks", icon: Network },
    { id: "t-os", name: "Operating Systems", icon: Monitor },
    { id: "t-prog", name: "Programming Languages", icon: Terminal },
    { id: "t-se", name: "Software Engineering", icon: Cpu },
    { id: "t-sec", name: "Cybersecurity", icon: Shield },
    { id: "t-theory", name: "Theory of Computation", icon: BookOpen },
    { id: "t-web", name: "Web Development", icon: Globe },
    { id: "t-misc", name: "Miscellaneous", icon: Sparkles },
] as const;

const steps = [
    {
        number: "01",
        title: "Pick a Topic",
        desc: "Choose from 12 theoretical computer science categories",
    },
    {
        number: "02",
        title: "AI Generates a Question",
        desc: "An interview-style question is created just for you",
    },
    {
        number: "03",
        title: "Type Your Answer",
        desc: "Write your response in your own words",
    },
    {
        number: "04",
        title: "Get Instant Feedback",
        desc: "AI evaluates your answer with tips to improve",
    },
];

export const InterviewLanding = () => {
    const router = useRouter();

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
                    BrainFart
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                >
                    <Badge
                        variant="default"
                        className="px-3 py-1 rounded-full text-sm"
                    >
                        Interview
                    </Badge>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center text-base md:text-lg max-w-lg text-muted-foreground"
                >
                    Practice theoretical interview questions with AI-powered
                    feedback. Pick a topic and test your knowledge.
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
                    >
                        <Sparkles className="size-5" />
                        Start Interview
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full max-w-5xl"
            >
                <div className="flex flex-col gap-6 items-center mb-8">
                    <h2 className="text-2xl font-semibold">Pick a topic</h2>
                    <p className="text-sm text-muted-foreground">
                        Choose a category to practice
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {categories.map((category, i) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.05, duration: 0.3 }}
                            whileHover={{
                                y: -4,
                                transition: { type: "spring", stiffness: 300 },
                            }}
                            className="relative flex flex-col items-center text-center gap-2 rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:shadow-md hover:ring-1 hover:ring-primary/30 transition-all duration-200 cursor-pointer"
                        >
                            <category.icon className="size-6 text-primary" />
                            <span className="text-sm font-medium">
                                {category.name}
                            </span>
                        </motion.div>
                    ))}
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
                            <h3 className="font-semibold text-sm">
                                {step.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
