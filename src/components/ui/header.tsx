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
import { Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "./shadcn-component/spinner";
import { Badge } from "@/components/ui/shadcn-component/badge";
import { Session } from "@/types/better-auth";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./shadcn-component/dropdown-menu";

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
        if (userData) {
            const notifications = userData.notifications;
            const unseenNotifications = notifications.filter((notification) => !notification.seen);
            setContainsNotificationUnseen(unseenNotifications.length > 0);
            setUnseenNotificationsNumber(unseenNotifications.length);
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
        <div className="flex flex-row justify-between items-center md:m-4 rounded-3xl border border-transparent hover:border-border transition-colors duration-200">
            <div className="m-5 sm:flex hidden">
                <ModeToggle />
            </div>

            <ul className="hidden sm:flex flex-row items-center gap-3 p-1">
                <Button variant="ghost" onClick={() => router.push("/room")}>
                    Rooms
                </Button>
                <Button variant="ghost" onClick={handleGoToLeaderboard}>
                    Leaderboard
                </Button>
                <Button variant="ghost" onClick={() => router.push("/contact")}>
                    Contact
                </Button>
            </ul>

            <div className="sm:hidden flex flex-row items-center m-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                        <SheetHeader>
                            <SheetTitle>BrainFart</SheetTitle>
                            <SheetDescription>v0.1.0</SheetDescription>
                        </SheetHeader>
                        <ul className="flex flex-col gap-4 mt-8">
                            <Button
                                variant="ghost"
                                onClick={() => router.push("/room")}
                            >
                                Rooms
                            </Button>
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
                        <SheetFooter className="flex flex-row justify-end">
                            <div className="m-5 ">
                                <ModeToggle />
                            </div>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {props.logged ? (
                <div className="flex flex-row items-center p-2 gap-2 sm:gap-3">
                    <Button variant="ghost" size="icon" className="relative" onClick={handleGoTonotification}>
                        <Bell className="size-5" />
                        {containsNotificationUnseen ? (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                                {unseenNotificationsNumber > 99 ? "99+" : unseenNotificationsNumber}
                            </Badge>
                        ) : null}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer">
                                <Avatar
                                    src={props.session?.user?.image || ""}
                                    alt={props.session?.user?.username || ""}
                                    size={36}
                                />
                            </button>
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
