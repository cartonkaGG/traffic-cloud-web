/** ☁️ контур: viewBox по bbox контуру — центрування в колі hero/loader */
export const CLOUD_VIEWBOX = { x: 30, y: 14, w: 255, h: 118 } as const

export const CLOUD_SHAPE_PATH =
  'M 60,130 H 240 C 265,130 280,112 280,90 C 280,68 262,52 235,52 C 230,52 224,53 218,55 C 205,33 182,18 155,18 C 122,18 95,39 90,67 C 84,64 78,63 72,63 C 49,63 35,79 35,98 C 35,118 48,130 60,130 Z'

export const cloudMarkAspect = CLOUD_VIEWBOX.h / CLOUD_VIEWBOX.w
