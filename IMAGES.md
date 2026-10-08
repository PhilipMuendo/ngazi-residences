# Image credits & replacement guide

All photography in `/assets/images` is **placeholder stock** from Unsplash and Pexels (free licences), graded to one
cool architectural look with `scripts/grade.py`. **None of it shows the Ngazi building**: the interiors, amenities,
city views and construction photo are stand-ins.

**Before launch, replace them with the developer's own renders and photography** (CGI interiors, the show apartment,
drone views from each floor band, site progress photos). Keep the same filename to swap in place, then run
`python scripts/grade.py <raw-photos> assets/images` to match the grade.

The tower itself is not a photograph: it is the live three.js model in `components/Tower3D.tsx`, built from
`config/site.ts` and `lib/towerGeometry.ts`.

| File | Source | Licence |
|---|---|---|
| `view-dusk.jpg` | <https://www.pexels.com/photo/29069329/> | Pexels License |
| `view-high.jpg` | <https://www.pexels.com/photo/28977077/> | Pexels License |
| `view-mid.jpg` | <https://unsplash.com/photos/FdPez-Xwhmw> | Unsplash License |
| `view-low.jpg` | <https://www.pexels.com/photo/9833512/> | Pexels License |
| `living-city.jpg` | <https://unsplash.com/photos/G52knRZZO6I> | Unsplash License |
| `kitchen-concrete.jpg` | <https://unsplash.com/photos/FU13vB_pm_4> | Unsplash License |
| `bedroom-concrete.jpg` | <https://unsplash.com/photos/ErDrzSvSNv4> | Unsplash License |
| `bath-black.jpg` | <https://unsplash.com/photos/XLxRE_aA4M8> | Unsplash License |
| `pool-city.jpg` | <https://unsplash.com/photos/xPyvA9jjFzw> | Unsplash License |
| `gym-skyline.jpg` | <https://unsplash.com/photos/oP_RVBuY8fg> | Unsplash License |
| `lounge.jpg` | <https://unsplash.com/photos/XTC538P_eWk> | Unsplash License |
| `lounge-dark.jpg` | <https://unsplash.com/photos/_EGY5_u4Ha4> | Unsplash License |
| `fin-shadows.jpg` | <https://unsplash.com/photos/oMCC7gKDBYE> | Unsplash License |
| `concrete-steps.jpg` | <https://unsplash.com/photos/rKgb2jb7wk0> | Unsplash License |
| `terrazzo.jpg` | <https://unsplash.com/photos/-OPMjDlmE4w> | Unsplash License |
| `marble.jpg` | <https://unsplash.com/photos/qEQTujie8vg> | Unsplash License |
| `terrazzo-floor.jpg` | <https://unsplash.com/photos/4hIP48ADIC4> | Unsplash License |
| `construction.jpg` | <https://unsplash.com/photos/d3vp0M7oT6c> | Unsplash License |
