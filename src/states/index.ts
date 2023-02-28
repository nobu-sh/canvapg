import { atom } from 'recoil'

export const sideBarWidthState = atom<number>({
  key: 'sideBarWidth',
  default: 4,
})
