import { authClient } from "@/lib/auth-client";
import { Avatar } from "./profil/avatar";
import { Button } from "./shadcn-component/button";
import { ModeToggle } from "./button/dark-mode-toggle";
import { useUser } from "@/stores/useUser";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/shadcn-component/sheet";
import { Bell, Menu, User, Settings, LogOut, ChevronDown, Gamepad2, Brain, Zap, Puzzle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "./shadcn-component/spinner";
import { Badge } from "@/components/ui/shadcn-component/badge";
import { Session } from "@/types/better-auth";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./shadcn-component/dropdown-menu";
import { DailyStreak } from "./daily/daily-streak";

type HeaderPropsType = {
    logged: boolean | undefined;
    session: Session | null;
    isPending?: boolean;
};

export const Header = (props: HeaderPropsType) => {
    const loading = useUser((state) => state.loading);
    const [containsNotificationUnseen, setContainsNotificationUnseen] = useState<boolean>(false);
    const [unseenNotificationsNumber, setUnseenNotificationsNumber] = useState<number>(0);
    const { userData } = useUser();
    const setLoading = useUser((state) => state.setLoading);
    const router = useRouter();

    useEffect(() => {
        if (userData?.notifications) {
            const unseenNotifications = userData.notifications.filter(
                (notification) => !notification.isDeleted && !notification.seen,
            );
            setContainsNotificationUnseen(unseenNotifications.length > 0);
            setUnseenNotificationsNumber(unseenNotifications.length);
        } else {
            setContainsNotificationUnseen(false);
            setUnseenNotificationsNumber(0);
        }
    }, [userData])
    const handleLogOut = async () => {
        try {
            setLoading(true);
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/auth/sign-up");
                    },
                },
            });
        } catch (error) {
            console.log("There is an error while logging out.", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLeaderboard = () => {
        router.push("/leaderboard");
    };

    const handleGoTonotification = () => {
        router.push("/notification");
    };

    return (
        <div className="sticky top-0 z-40 flex flex-row justify-between items-center w-full max-w-7xl mx-auto px-4 py-2 md:m-4 md:w-[calc(100%-2rem)] rounded-3xl border border-transparent hover:border-border transition-colors duration-200 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="m-2 sm:m-5 hidden md:flex">
                <ModeToggle />
            </div>

            <ul className="hidden md:flex flex-row items-center gap-2 p-1">
                <Button variant="ghost" onClick={() => router.push("/room")}>
                    Rooms
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-1">
                            Games <ChevronDown className="size-3.5 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Game types</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/single-player")} className="cursor-pointer">
                            <Brain className="size-4" /> Trivia <span className="ml-auto text-xs text-muted-foreground">Live</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="opacity-60">
                            <Puzzle className="size-4" /> Memory <span className="ml-auto text-xs">Soon</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push("/single-player?mode=speedrun")} className="cursor-pointer">
                            <Zap className="size-4" /> Speed Run <span className="ml-auto text-xs text-muted-foreground">Live</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled className="opacity-60">
                            <Gamepad2 className="size-4" /> Puzzle <span className="ml-auto text-xs">Soon</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-muted-foreground"
                            onClick={() => toast("More games coming in the next release!")}
                        >
                            Waiting for next release
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" onClick={() => router.push("/create")}>
                    Creation Mode
                </Button>
                <Button variant="ghost" onClick={handleGoToLeaderboard}>
                    Leaderboard
                </Button>
                <Button variant="ghost" onClick={() => router.push("/contact")}>
                    Contact
                </Button>
            </ul>

            <div className="md:hidden flex flex-row items-center m-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-11">
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[85vw] max-w-[320px] flex flex-col p-0">
                        <SheetHeader className="p-4 pb-2">
                            <SheetTitle>BrainFart</SheetTitle>
                            <SheetDescription>v0.1.0</SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-4">
                        <ul className="flex flex-col gap-3">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/room")}
                            >
                                Rooms
                            </Button>
                            <div className="flex flex-col gap-2 border border-border rounded-lg p-3">
                                <span className="text-xs font-medium text-muted-foreground px-2">Games</span>
                                <Button variant="ghost" size="sm" onClick={() => router.push("/single-player")} className="justify-start gap-2">
                                    <Brain className="size-4" /> Trivia
                                </Button>
                                <Button variant="ghost" size="sm" disabled className="justify-start gap-2 opacity-60">
                                    <Puzzle className="size-4" /> Memory Soon
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => router.push("/single-player?mode=speedrun")} className="justify-start gap-2">
                                    <Zap className="size-4" /> Speed Run
                                </Button>
                                <Button variant="ghost" size="sm" className="justify-start gap-2 text-muted-foreground" onClick={() => toast("More games coming in the next release!")}>
                                    More next release
                                </Button>
                            </div>
                            <Button variant="ghost" onClick={() => router.push("/create")} className="justify-start">
                                Creation Mode
                            </Button>
                            {props.logged && (
                                <>
                                    <Button variant="ghost" onClick={() => router.push(`/user/${props.session?.user?.id}`)} className="justify-start gap-2">
                                        <User className="size-4" /> Profile
                                    </Button>
                                    <Button variant="ghost" onClick={() => router.push("/setting")} className="justify-start gap-2">
                                        <Settings className="size-4" /> Settings
                                    </Button>
                                    <Button variant="ghost" onClick={handleLogOut} className="justify-start gap-2 text-destructive">
                                        <LogOut className="size-4" /> Log out
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                onClick={handleGoToLeaderboard}
                            >
                                Leaderboard
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/contact")}
                            >
                                Contact
                            </Button>
                        </ul>
                        </div>
                        <SheetFooter className="p-4 border-t flex-col gap-0">
                            <div className="w-full flex justify-center">
                                <ModeToggle />
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {props.logged ? (
                <div className="flex flex-row items-center p-2 gap-1 sm:gap-2">
                    <DailyStreak />
                    <Button variant="ghost" size="icon" className="relative size-11" onClick={handleGoTonotification}>
                        <Bell className="size-5" />
                        {containsNotificationUnseen ? (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                                {unseenNotificationsNumber > 99 ? "99+" : unseenNotificationsNumber}
                            </Badge>
                        ) : null}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar
                                src={props.session?.user?.image || ""}
                                alt={props.session?.user?.username || ""}
                                size={44}
                                className="cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium truncate">{props.session?.user?.username || props.session?.user?.name || "User"}</span>
                                    <span className="text-xs text-muted-foreground truncate font-normal">{props.session?.user?.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/user/${props.session?.user?.id}`)} className="cursor-pointer">
                                <User className="size-4" /> Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/setting")} className="cursor-pointer">
                                <Settings className="size-4" /> Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={handleLogOut} className="cursor-pointer">
                                {loading ? <Spinner className="size-4" /> : <LogOut className="size-4" />} Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : (
                <div className="flex flex-row items-center gap-2 p-4">
                    <Button
                        variant="default"
                        type="button"
                        onClick={() => {
                            router.push("/auth/sign-in");
                        }}
                    >
                        Log in
                    </Button>
                    <Button
                        variant="default"
                        type="button"
                        onClick={() => {
                            router.push("/auth/sign-up");
                        }}
                    >
                        Sign up
                    </Button>
                </div>
            )}
        </div>
    );
};
