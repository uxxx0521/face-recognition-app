# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# 🧠 Face Recognition App

A real-time face recognition web app built with **React**, **TypeScript**, and **face-api.js**. The app uses your webcam to detect and recognize faces directly in the browser — no backend required. Fast, efficient, and privacy-friendly.

---

## 🚀 Features

- 📷 **Live webcam facial detection**
- 🧠 Uses `face-api.js` with pre-trained deep learning models
- ⚡ Built with **Vite** for ultra-fast dev experience
- 💻 Written in **TypeScript** with strong type safety
- 🔍 Real-time face bounding boxes
- 🎨 Clean and responsive UI

---

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **AI Models:** [face-api.js](https://github.com/justadudewhohacks/face-api.js-models)
- **Linting:** ESLint with type-aware rules
- **ToolKit:** Redux Toolkit for state management

---

## 📦 Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/uxxx0521/face-recognition-app.git
cd face-recognition-app