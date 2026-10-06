# PRIME IT: photographic motion redesign

The home page now uses a bespoke hardware composition and a three-stage repair story. Existing React/Vite static generation, the ten service URLs, real reviews, licensed photographs, prices and contact details remain the source of truth.

## Design and interaction

- A framed real PC photograph, precise technical details, a finite light sweep and a small pointer-driven perspective effect on desktop.
- Free diagnostics have their own readable lead. The diagnostic card is an actual WhatsApp link.
- The repair journey follows the symptom selector: contact, free diagnostics, repair after approval.
- On desktop, a sticky illustration follows the three text stages while scrolling both down and up.
- Mobile, short viewports, reduced motion and no-JavaScript readers get ordinary illustrated cards with the complete text.
- Service cards and verified reviews receive finite entrance animations; hover image movement is limited to fine pointers.

## Implementation

CSS, IntersectionObserver and the native Web Animations API. No animation package or framework dependency was added. Essential content stays in generated HTML. The largest text and hero image are never hidden behind an entrance animation. Video remains an explicit user action.

Pointer updates are scheduled through requestAnimationFrame; bounds are read on entry, not on every pointer move. Scroll triggers use viewport pixels. There is no intercepted scrolling, focus movement or simulated live diagnostic data.

## Verification

Production build, existing static/browser checks and a dedicated motion check run in GitHub Actions. The additional checks cover forward/backward stage selection, three desktop sizes, dynamic reduced-motion changes, short screens, pointer reset, keyboard access, symptom context and HTML without JavaScript. Screenshots are included in the production-quality artifact.

Results will be recorded after the production checks complete.
