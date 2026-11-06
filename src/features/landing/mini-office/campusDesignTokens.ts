/** Approved art direction: docs/design/STACK44-DESIGN-DNA.md. World units ≈ metres. */
export const campusTokens = {
  colors: { walnut: 0x74482b, walnutDark: 0x321f17, travertine: 0xd8d0be,
    cream: 0xf0e9da, forest: 0x264c39, brass: 0xbfa57d, metal: 0x25292c,
    charcoal: 0x171b20, glass: 0xacc9c4, lavender: 0x9e85b6, ivory: 0xf0e5c8,
    olive: 0x687b39, asphalt: 0x44484a, studio: 0x101719 },
  dimensions: { width: 32, depth: 24, centerZ: 2.4,
    lobby: { x: 0, z: 7.25, width: 7, height: 2.6 }, pergola: { x: -12.7, z: -2.8 } },
  // World datum: animation coordinates stay local to the office level.
  levels: { office: 1.3, lobby: .05, promenade: -.85, garden: -.98, baseBottom: -1.68 },
  stairs: { frontStartZ: 9.35, frontTread: .5, frontRiser: .15, frontCount: 5,
    innerStartZ: 3.58, innerTread: .28, innerCount: 7 },
  surfaces: { woodRoughness: .38, darkWoodRoughness: .43, stoneRoughness: .48,
    brassRoughness: .34, brassMetalness: .84, glassOpacity: .19, glassRoughness: .075,
    carRoughness: .2, carClearcoat: 1, carMetalness: .55 },
  camera: { desktop: [10, 23, 37] as const, mobile: [0, 25, 31] as const, margin: 1.025 },
  lighting: { warm: 0xffb86e, exposure: .94, bloom: .16, bloomThreshold: 1.4, environment: .42,
    ambient: .3, key: 1.5, contactOpacity: .32, editorialSaturation: .95, vignette: .055 },
  motion: { visitorSpeed: .44, cameraDamping: 1.9, carFade: 2.2, restSeconds: 6 },
  performance: { desktopFPS: 55, mobileFPS: 30, desktopDPR: 1.6, mobileDPR: 1.2,
    minDPR: .8, sampleFrames: 120, warmupSeconds: 5 },
} as const;
