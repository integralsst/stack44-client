/** Approved art direction: docs/design/STACK44-DESIGN-DNA.md. World units ≈ metres. */
export const campusTokens = {
  colors: { walnut: 0x74482b, walnutDark: 0x321f17, travertine: 0xd8d0be,
    cream: 0xf0e9da, forest: 0x264c39, brass: 0xd6a75b, metal: 0x25292c,
    charcoal: 0x171b20, glass: 0xacc9c4, lavender: 0x9e85b6, ivory: 0xf0e5c8,
    olive: 0x687b39, asphalt: 0x44484a, studio: 0x141918 },
  dimensions: { width: 32, depth: 24, centerZ: 2.4, ground: -1.34, path: -.96,
    lobby: { x: 0, z: 7.3, width: 6.6, height: 2.6 }, pergola: { x: -12.6, z: -2 } },
  lighting: { warm: 0xffc77f, exposure: .96, bloom: .13, environment: .3 },
  motion: { visitorSpeed: .44, cameraDamping: 1.9, carFade: 2.2, restSeconds: 6 },
  performance: { desktopFPS: 55, mobileFPS: 30, desktopDPR: 1.6, mobileDPR: 1.2,
    minDPR: .8, sampleFrames: 120 },
} as const;
