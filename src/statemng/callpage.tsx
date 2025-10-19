import { create } from 'zustand'


type Store = {
  callpage: boolean
  setCp: (value: boolean) => void
}

export const usePage = create<Store>()((set) => ({
  callpage: false,
  setCp: (value: boolean) => {set({callpage:value})},
}))

