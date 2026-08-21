"use client";
import { motion } from "motion/react";
import { Button } from "./shadcn-component/button";
import { Separator } from "./shadcn-component/separator";
import { useRouter } from "next/navigation";
import { Gamepad2, Users, Trophy, ArrowRight, Flame, Zap, Clock } from "lucide-react";
import { TOPIC_ICONS, TOPIC_LABELS } from "@/lib/topics";
import { useEffect } from "react";
import { useTriviaCategories } from "@/stores/useTriviaCategories";

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
    const setCategories = useTriviaCategories((s) => s.setCategories);

    useEffect(() => {
        fetch("/api/trivia/categories")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.data)) setCategories(data.data);
            })
            .catch(() => {});
    }, [setCategories]);

    const handleStart = () => {
        if (props.logged) {
            router.push("/room/create");
        } else {
            router.push("/auth/sign-up");
        }
    };

    const handlePlaySingleMode = () => {
        if (!props.logged) {
            router.push("/auth/sign-in");
            return;
        }
        router.push("/single-player");
    };

    return (
        <div className="w-full flex flex-col gap-12 justify-center items-center px-4">

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
                    {props.logged && (
                        <Button
                            variant="default"
                            size="lg"
                            onClick={handlePlaySingleMode}
                            className="text-base gap-2"
                        >
                            <Gamepad2 className="size-5" />
                            Single player mode
                        </Button>
                    )}
                    <Button
                        variant={props.logged ? "secondary" : "default"}
                        size="lg"
                        onClick={handleStart}
                        className="text-base gap-2"
                    >
                        <ArrowRight className="size-5" />
                        {props.logged ? "Create room" : "Get started"}
                    </Button>
                </motion.div>
            </motion.div>

            {props.logged && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="flex flex-wrap justify-center gap-2 max-w-3xl"
                >
                    <p className="w-full text-center text-xs font-medium tracking-widest text-muted-foreground uppercase">
                        20+ topics
                    </p>
                    {Object.entries(TOPIC_LABELS)
                        .slice(0, 12)
                        .map(([slug, label]) => {
                            const Icon = TOPIC_ICONS[slug];
                            return (
                                <button
                                    key={slug}
                                    type="button"
                                    onClick={() => router.push("/single-player")}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium cursor-pointer hover:border-primary/40 hover:bg-accent transition-colors duration-200"
                                >
                                    {Icon ? <Icon className="size-3.5 text-muted-foreground" /> : null}
                                    {label}
                                </button>
                            );
                        })}
                    <button
                        type="button"
                        onClick={() => router.push("/single-player")}
                        className="inline-flex items-center rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground cursor-pointer hover:border-primary/40 hover:text-foreground transition-colors duration-200"
                    >
                        + more
                    </button>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                        <div
                            key={feature.title}
                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 hover:border-border hover:bg-accent/30 transition-colors duration-200"
                        >
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                <feature.icon className="size-5 text-foreground" />
                            </div>
                            <h3 className="font-semibold text-base">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                <Flame className="size-5 text-foreground" />
                            </div>
                            <h3 className="font-semibold">Daily Challenge</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">One question every day. Keep your streak and climb the leaderboard.</p>
                        <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={() => router.push(props.logged ? "/single-player" : "/auth/sign-in")}>
                            Play daily
                        </Button>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                                <Zap className="size-5 text-foreground" />
                            </div>
                            <h3 className="font-semibold">Speed Run</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">How many can you answer before time runs out? Choose 1, 2 or 4 minutes.</p>
                        <Button variant="outline" size="sm" className="mt-1 w-fit" onClick={() => router.push(props.logged ? "/single-player?mode=speedrun" : "/auth/sign-in")}>
                            Try Speed Run
                        </Button>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="w-full max-w-4xl rounded-xl border border-border bg-card p-6 md:p-8"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                        <Clock className="size-4 text-foreground" />
                    </div>
                    <h3 className="font-semibold">How it works</h3>
                </div>
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <li className="flex gap-3">
                        <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">1</span>
                        <span className="text-muted-foreground">Pick a topic or create a room and invite friends.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">2</span>
                        <span className="text-muted-foreground">Answer quickly. Speed and accuracy build your score.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">3</span>
                        <span className="text-muted-foreground">Check your history and ranking on your profile and leaderboard.</span>
                    </li>
                </ol>
            </motion.div>

            <div className="w-full max-w-4xl">
                <Separator />
            </div>
        </div>
    );
};
