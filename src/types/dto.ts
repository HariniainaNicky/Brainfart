export type RoomDto = {
  title: string;
  questionTypeId: string | null;
  questionCount: number;
  chronoTiming: number;
};

// I created this one for BetterAuth
export type UserDto = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
  username?: string | null | undefined;
  displayUsername?: string | null | undefined;
};
