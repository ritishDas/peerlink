import { create } from 'zustand'

type Call =
  | {
      status: false
    }
  | {
      status: true
      type: 'incoming' | 'outgoing'
      answered: boolean
      id:string
      user: {
        name: string
        email: string
        photoURL: string
      }
    } 

type Store = {
  call: Call
  setCall: (value: Call) => void
}

export const useCall = create<Store>()((set) => ({
  call: { status: false },
  setCall: (value) => set({ call: value }),
}))

