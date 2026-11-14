/** Entity kinds owned by Okina (combat `ek` column): big swallowing door, placed door, backup dancer. */
export const EK_OBD = 206, EK_ODR = 207, EK_ODN = 208;
/** Season colours (spring, summer, autumn, winter) and their `bsea` codes (summer has none: its shots are just fast). */
export const SEAC = [0xffb0d6, 0xff7a3a, 0xffb04a, 0xbfe8ff] as const;
export const SEA = [1, 0, 3, 4] as const;
/** The season changes every 5 s; Okina's tick stores it (so shots of the changing frame still use the old one, like legacy). */
export const season = (gf: number): number => (gf / 300 | 0) % 4;
