import { create } from 'zustand';

// ══════════════════════════════════════════════════════════════
// USER STORE
// ══════════════════════════════════════════════════════════════

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  nin: string;
  dob: string;
  phone_verified: boolean;
  nin_verified: boolean;
  face_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  display_name?: string;
  avatar_emoji?: string;
  theme_color?: string;
}

interface UserStore {
  user: UserProfile | null;
  email: string;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserProfile | null) => void;
  setEmail: (email: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  email: '',
  isLoading: false,
  error: null,
  setUser: (user) => set({ user }),
  setEmail: (email) => set({ email }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearUser: () => set({ user: null, email: '', error: null }),
}));

// ══════════════════════════════════════════════════════════════
// MAP STORE
// ══════════════════════════════════════════════════════════════

export interface MapUser {
  id: string;
  user_id: string;
  lat: number;
  lng: number;
  market_name: string;
  is_pooling: boolean;
  profile: {
    first_name: string;
    last_name: string;
    avatar_emoji: string;
  };
}

export interface Market {
  id: string;
  name: string;
  logo_emoji: string;
  is_custom: boolean;
}

interface MapStore {
  userLocation: { lat: number; lng: number } | null;
  selectedMarket: Market | null;
  radius: number;
  mapUsers: MapUser[];
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  setSelectedMarket: (market: Market | null) => void;
  setRadius: (radius: number) => void;
  setMapUsers: (users: MapUser[]) => void;
  setIsLive: (isLive: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMapStore = create<MapStore>((set) => ({
  userLocation: null,
  selectedMarket: null,
  radius: 3,
  mapUsers: [],
  isLive: false,
  isLoading: false,
  error: null,
  setUserLocation: (location) => set({ userLocation: location }),
  setSelectedMarket: (market) => set({ selectedMarket: market }),
  setRadius: (radius) => set({ radius }),
  setMapUsers: (mapUsers) => set({ mapUsers }),
  setIsLive: (isLive) => set({ isLive }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      userLocation: null,
      selectedMarket: null,
      radius: 3,
      mapUsers: [],
      isLive: false,
      error: null,
    }),
}));

// ══════════════════════════════════════════════════════════════
// CHAT STORE
// ══════════════════════════════════════════════════════════════

export interface ChatMessage {
  id: string;
  group_id: string;
  sender_id: string | null;
  sender_name: string;
  content: string;
  is_bot: boolean;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  sender_profile?: {
    avatar_emoji: string;
    display_name: string;
    first_name: string;
  };
}

export interface Group {
  id: string;
  name: string;
  market_name: string;
  is_pool: boolean;
  created_by: string;
  member_count?: number;
}

interface ChatStore {
  activeGroupId: string | null;
  groups: Group[];
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  setActiveGroupId: (groupId: string | null) => void;
  setGroups: (groups: Group[]) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  activeGroupId: null,
  groups: [],
  messages: [],
  isLoading: false,
  error: null,
  setActiveGroupId: (groupId) => set({ activeGroupId: groupId }),
  setGroups: (groups) => set({ groups }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      activeGroupId: null,
      groups: [],
      messages: [],
      error: null,
    }),
}));
