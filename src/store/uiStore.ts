import { create } from "zustand";

interface Modal {
  id: string;
  data?: unknown;
}

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  openModals: Modal[];

  setLoading: (loading: boolean, message?: string) => void;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalData: (id: string) => unknown;
}

export const useUIStore = create<UIState>()((set, get) => ({
  isLoading: false,
  loadingMessage: "",
  openModals: [],

  setLoading: (isLoading, loadingMessage = "") => set({ isLoading, loadingMessage }),
  openModal: (id, data) =>
    set((s) => ({
      openModals: s.openModals.some((m) => m.id === id)
        ? s.openModals
        : [...s.openModals, { id, data }],
    })),
  closeModal: (id) =>
    set((s) => ({ openModals: s.openModals.filter((m) => m.id !== id) })),
  isModalOpen: (id) => get().openModals.some((m) => m.id === id),
  getModalData: (id) => get().openModals.find((m) => m.id === id)?.data,
}));
