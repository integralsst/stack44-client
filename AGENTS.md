# Stack44 frontend — persistent campus direction

Before modifying any visual campus component, read [docs/design/STACK44-DESIGN-DNA.md](docs/design/STACK44-DESIGN-DNA.md) and visually open `referencias-diseno/campus-premium-referencia.png`.

- Respect the approved design system and reuse `campusDesignTokens.ts` for materials, colors, lighting, proportions and motion.
- Every implementation must preserve or improve existing quality. Prioritize the three largest visual differences from the reference; do not add detail for its own sake.
- Capture and compare equivalent before/after desktop and mobile views. Record evidence, design decisions and remaining improvements in `docs/design/`.
- Preserve all office interactions, original minifigure proportions, functional routes, accessible contextual panels, reduced motion, mobile scroll and demonstration/data separation.
- Exactly one original SIS logo on the rear wall and one original Stack44 logo on the exterior monument; retain transparency and aspect ratio. No extra brand copy or repetitions in the miniature.
- Use adaptive rendering; targets are 50–60 FPS desktop and 30 FPS compatible mobile. Measure on real hardware before claiming these targets pass.
- Build, check TypeScript, run ESLint and browser QA. Distinguish objective checks from the manual 0–100 art review (target ≥90); never claim a subjective score is an automated pass.
- Preserve existing instructions when updating this file. Do not merge visual changes without the user's review and approval. Do not deploy directly to production.
