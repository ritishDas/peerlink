import { create } from 'zustand'

type Error =
  | {
      status: false
    }
  | {
      status: true
      message: string
    }

type Store = {
  error: Error
  setError: (value: Error) => void
}

export const useError = create<Store>()((set) => ({
  error: { status:false },
  setError: (value: Error) => {set({ error: value })},
}))

