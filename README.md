# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Study planning

Run the app locally with `npm run dev`. The **Daily Study Hours** page tracks October 6 through December 11, 2026; December 12 is reserved for the University of Dhaka exam milestone. Update the start or exam date in `src/studyHours.js` to change this window.

Daily totals can be set, increased, or decreased manually. The **Study Timer** tab offers a normal stopwatch (saved when stopped) and a Pomodoro timer (only completed focus sessions count; breaks do not). Timer progress, study totals, and the optional daily goal are stored in browser `localStorage`; no backend is used.
