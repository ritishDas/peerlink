import { create } from 'zustand'

type Login =
  | {
      status: false
    }
  | {
      status: true
      user: {
        name: string
        email: string
        photoURL: string
      }
    }

type Store = {
  login: Login
  setLogin: (value: Login) => void
}

export const useStore = create<Store>()((set) => ({
  login: { status:false },
  setLogin: (value: Login) => {set({ login: value })},
}))

