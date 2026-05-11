"use client";
import { motion } from "motion/react";
import { Button } from "./shadcn-component/button";
import { CarouselDemo } from "./carousel-template";
import { Separator } from "./shadcn-component/separator";
import { UserHistory } from "./user-history";
import { useRouter } from "next/navigation";
import { Gamepad2, Users, Trophy, Sparkles } from "lucide-react";

type BodyPropsType = {
    logged: boolean;
};

const features = [
  {
    icon: Gamepad2,
    title: "Solo Practice",
    desc: "Play at your own pace with randomized questions",
  },
  {
    icon: Users,
    title: "Multiplayer Rooms",
    desc: "Challenge friends in real-time trivia battles",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    desc: "Climb the global rankings and prove your brain",
  },
];

export const Body = (props: BodyPropsType) => {
    const router = useRouter();

    const handleStart = () => {
        if (props.logged) {
            router.push("/room/create");
        } else {
            router.push("/auth/sign-up");
        }
    };

    const handlePlaySingleMode = () => {
        router.push("/single-player");
    };

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

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-center text-base md:text-lg max-w-lg text-muted-foreground"
                >
                    Ready to use your brain with BrainFart ? Create a room, share
                    the link, and outsmart everyone else !
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 mt-2"
                >
                    <Button
                        variant="default"
                        size="lg"
                        onClick={handlePlaySingleMode}
                        className="text-base gap-2"
                    >
                        <Gamepad2 className="size-5" />
                        Single player mode
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={handleStart}
                        className="text-base gap-2"
                    >
                        <Sparkles className="size-5" />
                        {props.logged ? "Create room" : "Get started"}
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="w-full max-w-4xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                            className="flex flex-col items-center text-center gap-3 rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <feature.icon className="size-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {!props.logged ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="w-full max-w-3xl"
                >
                    <Separator className="mb-8" />
                    <p className="text-center text-muted-foreground text-sm mb-4">
                        Try a sample question
                    </p>
                    <CarouselDemo />
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="w-full"
                >
                    <Separator className="mb-4" />
                </motion.div>
            )}
        </div>
    );
};
