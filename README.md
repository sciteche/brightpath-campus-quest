# BrightPath Campus Quest

ROLE: You are a senior creative web developer and game designer who builds award-winning interactive websites for small local businesses. GOAL: Build a playable, mobile-friendly 3D website for "BrightPath Classes", a Class 9-12 coaching centre in Sector 62, Noida (a demo business). Visitors control a cute student character who walks around a small low-poly campus; walking into a building opens that section. It must load fast, be easy for parents, and turn visitors into "Book a free demo class" enquiries. CONTEXT: 1) Brand: warm, friendly, trustworthy. Colors: navy #1E1B4B, orange #EA580C, sunny yellow #FBBF24, cream #FFFDF7, teal accent #14B8A6. Font: Nunito. 2) Scene with react-three-fiber: isometric-style camera that smoothly follows the player, soft shadows, a floating grass island with paths, trees, lamp posts and an entrance arch that says BrightPath Classes. Five buildings made from simple shapes, each with a floating label and a glowing door: Courses, Results, Faculty, Fees, Book a Demo. No external 3D files. 3) Character built from primitives (head, hair, body, backpack) with idle bob and walking animation, rotating to face the direction of travel, with simple collision so it cannot walk through buildings or off the island. 4) Controls: WASD or arrow keys on desktop; on phones a virtual joystick plus tap-a-building to auto-walk there. Show a first-time hint: Use arrow keys or tap a building. 5) When the player steps on a glowing door, open an elegant glass panel with that section's content, with a close button; Esc closes it. 6) Always-visible top bar: logo, a Classic view toggle and a Book a free demo button. Classic view shows the same content as a normal scrolling landing page for parents in a hurry. 7) Floating WhatsApp button using the placeholder number +91 90000 00000. 8) Content. Courses: Maths Class 9-10 Rs 2,500 per month; Science Class 9-10 Rs 2,500 per month; Board Booster Class 12 Rs 3,500 per month (show the rupee symbol). Results: 94% scored 80+, 38 school toppers, 15 students per batch, 7 years in Noida. Faculty: three teacher cards (Mr. Sharma, Maths; Ms. Iyer, Science; Mr. Khan, Physics) with initial avatars. Fees: a clear fee table and First demo class is free. Book a Demo: form with student name, class, parent phone and preferred time that shows a success message (no backend) and a Send on WhatsApp link with a pre-filled message. Footer: Demo website made for a tutorial. CONSTRAINTS: use React 18 compatible versions @react-three/fiber@8 and @react-three/drei@9; smooth 60 fps on a mid-range phone (cap pixel ratio at 1.5, no heavy post-processing); a short loading screen with progress and a Start exploring button; keyboard accessible, good contrast, respect reduced motion; no lorem ipsum.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://brightpath-campus-quest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/71466b59-4692-4ba7-a7ac-ad99977ab0f5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
