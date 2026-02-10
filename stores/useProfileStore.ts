import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfileStore {
  displayName: string;
  nickname: string;
  avatar: string | null;
  bio: string;
  setDisplayName: (name: string) => void;
  setNickname: (nickname: string) => void;
  setAvatar: (avatar: string | null) => void;
  setBio: (bio: string) => void;
}

const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      displayName: "",
      nickname: "",
      avatar: null,
      bio: "",
      setDisplayName: (displayName) => set({ displayName }),
      setNickname: (nickname) => set({ nickname }),
      setAvatar: (avatar) => set({ avatar }),
      setBio: (bio) => set({ bio }),
    }),
    { name: "nocho-profile" }
  )
);

export default useProfileStore;
