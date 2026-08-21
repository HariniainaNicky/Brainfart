import { Room } from "@/types/db";
import { RoomDto } from "@/types/dto";

export const generatePath = (path: string) => {
    const formattedPath = path.split("/").slice(1);
    let currentPath = "";
    const hrefPath = [];
    for (const content of formattedPath) {
        currentPath += "/";
        currentPath += content;
        hrefPath.push(currentPath);
    }
    return [formattedPath, hrefPath];
};

export const formatRank = (rank: number) => {
    if (rank > 5) {
        return rank + "th";
    } else {
        let stars = "";
        for (let i = 0; i < rank; i++) {
            stars += "★";
        }
        return stars;
    }
};

export const generateImage = async (userId: string) => {
    try {
        const url =
            "https://api.dicebear.com/9.x/fun-emoji/svg?scale=100&seed=" +
            userId;
        return url as string;
    } catch {
        return undefined;
    }
};

export const setUserImage = async (
    image: string | undefined,
    userId: string,
) => {
    try {
        const res = await fetch(`/api/users/${userId}/image`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                image,
            }),
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const initializeRank = async (userId: string) => {
    try {
        const usersRes = await fetch("/api/users");
        const users = await usersRes.json();
        const userCount = users.data.length;
        const url = `/api/users/${userId}/rank`;
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                rank: userCount,
            }),
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const refreshRanks = async (userId: string) => {
    try {
        const res = await fetch(`/api/users/${userId}/rank`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        return await res.json();
    } catch {
        return undefined;
    }
};

// TODO: A better critieria function that handle everything.
export const getUsersWithCriteria = async (criteria: string) => {
    try {
        const url = `/api/users?criteria=${criteria}`;
        const res = await fetch(url);
        return await res.json();
    } catch {
        return undefined;
    }
};

export const getType = async () => {
    try {
        const url = `/api/types`;
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data.data) ? data.data : [];
    } catch {
        return [];
    }
};

export const getQuestions = async (
    numberOfQuestion: number,
    type: string | null,
) => {
    try {
        const url = `/api/questions/${type}?numberOfQuestion=${numberOfQuestion}`;
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data.data) ? data.data : [];
    } catch {
        return [];
    }
};

export const getAllQuestions = async (
    search: string | null,
    typeId: string | null,
) => {
    try {
        let url = `/api/questions?nofilter=true`;
        if (search) {
            url += `&search=${search}`;
        }
        if (typeId != "null" && typeId) {
            url += `&typeId=${typeId}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data.data) ? data.data : [];
    } catch {
        return [];
    }
};

export const getMaxPage = function <T>(
    data: T[],
    limit: number,
) {
    return Math.ceil(data.length / limit);
};

export const createRoom = async (data: RoomDto) => {
    try {
        const url = `/api/rooms`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        const dataRes = await res.json();
        return dataRes;
    } catch {
        return undefined;
    }
};

// TODO: Search how to do generics with arrowed function
export function filterSearchRoom(initialData: Room[], queryString: string) {
    return initialData.filter((room: Room) => {
        return room.title.toLowerCase().includes(queryString.toLowerCase());
    });
}

export const fetchRoomById = async (userId: string) => {
    try {
        const res = await fetch("/api/rooms/" + userId);
        const data = await res.json();
        return data.data;
    } catch {
        return undefined;
    }
};

export const fetchClosedRooms = async () => {
    try {
        const res = await fetch("/api/rooms?closed=true");
        const data = await res.json();
        return data.data;
    } catch {
        return undefined;
    }
};

export const insertRoomPlayer = async (roomId: string, userId: string) => {
    try {
        const url = `/api/rooms/${roomId}/players`;
        const res = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
            }),
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const fetchMissingField = async (userId: string) => {
    try {
        const url = `/api/users/${userId}`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    } catch {
        return undefined;
    }
};

export const closeRoomById = async (roomId: string) => {
    try {
        const url = `/api/rooms/${roomId}`;
        const res = await fetch(url, {
            method: "DELETE",
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const quitRoom = async (roomId: string, userId: string) => {
    try {
        const url = `/api/rooms/${roomId}/players/${userId}`;
        const res = await fetch(url, {
            method: "PUT",
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const submitRoomScore = async (roomId: string, userId: string, score: number, finished: boolean) => {
    try {
        const url = `/api/rooms/${roomId}/scores`;
        const res = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, score, finished }),
        });
        return await res.json();
    } catch {
        return undefined;
    }
};

export const fetchRoomScores = async (roomId: string) => {
    try {
        const url = `/api/rooms/${roomId}/scores`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    } catch {
        return undefined;
    }
};

export const getRandomAnswer = async () => {
    try {
        const url = `/api/questions/randomAnswer`;
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    } catch {
        return undefined;
    }
};

export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const updateUserScore = async (score: number, userId: string) => {
    try {
        const url = `/api/users/${userId}/`;
        const res = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                score,
            }),
        });
        const data = await res.json();
        return data;
    } catch {
        return undefined;
    }
};

export const paginate = function <T>(data: T[], page: number, limit: number) {
    const offset = (page - 1) * limit;
    return data.slice(offset, offset + limit);
};

export const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const markNotificationAsRead = async (notificationId: string) => {
    try {
        const url = `/api/notifications/${notificationId}`;
        await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                seen: true,
            }),
        });
    } catch {
        // silently fail
    }
};

export const deleteNotification = async (notificationId: string) => {
    try {
        const url = `/api/notifications/${notificationId}`;
        await fetch(url, {
            method: "DELETE",
        });
    } catch {
        // silently fail
    }
};
