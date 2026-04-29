# Agent Guide

Guia operativa para agentes que trabajen en este repo.

## Objetivo del proyecto

Portfolio personal data-driven con React, TypeScript y Vite. La app principal es estatica y funciona sin backend. Las integraciones externas son opcionales:

- WebLLM local en navegador para chat/RAG.
- Firebase para CMS y analiticas solo con flags `true`.
- EmailJS en contacto.

## Comandos

Usa Node 22 o una version compatible con Vite 7.

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run check
npm run build
```

En Windows, si `npm run build` falla con `spawn EPERM` dentro de sandbox, vuelve a intentarlo fuera del sandbox. El build correcto debe generar `dist/` sin rutas anidadas tipo `dist/C:/...`.

## Mapa de codigo

- `src/App.tsx`: seleccion de secciones y lazy loading.
- `src/components/sections/Portfolio.tsx`: pagina principal.
- `src/components/sections/Projects.tsx`: proyectos y modal de detalle.
- `src/components/sections/Space.tsx`: wrapper lazy de la escena 3D.
- `src/components/sections/PortfolioSolarSystem.tsx`: archivo grande y sensible; evitar refactors amplios sin pruebas visuales.
- `src/components/sections/Chat.tsx`: coordina chatbot, PDF viewer y debug.
- `src/contexts/WebLLMContext.tsx`: estado del modelo, PDF ingestion y RAG.
- `src/utils/vectorStore.ts`: chunking, busqueda y anotacion RAG.
- `src/data/`: fuente de verdad del contenido.
- `public/analytics.html`: panel estatico de analytics/CMS; cuidado, es HTML+JS inline grande.

## Reglas de cambio

- Preferir cambios pequenos y verificables.
- No tocar datos personales o contenido de portfolio salvo que la tarea lo pida.
- Si cambias tipos de datos, actualiza `src/data/README.md`, `public/data-defaults.json` y el panel CMS si aplica.
- Si cambias rutas publicas, usa `import.meta.env.BASE_URL` para respetar GitHub Pages.
- Mantener `@mlc-ai/web-llm`, Three.js y EmailJS fuera del bundle principal mediante imports lazy/manual chunks.
- No reintroducir `vite-plugin-compression` salvo que el hosting sirva `.gz`/`.br` correctamente y se haya probado en Windows.
- Evitar logs de exito en produccion; warnings/errores en caminos de fallo son aceptables si ayudan a diagnosticar.

## Configuracion importante

- `VITE_BASE_PATH=/portfolio/` para GitHub Pages del repo.
- `VITE_BASE_PATH=/` para dominio raiz.
- Sin `VITE_BASE_PATH`, `vite.config.ts` usa `/` en desarrollo y `/portfolio/` en build.
- `VITE_ANALYTICS_ENABLED=true` activa escrituras de analiticas en Firebase.
- `VITE_FIREBASE_CMS_ENABLED=true` activa lectura CMS desde Firebase.

## Verificacion recomendada

Para cambios de codigo normales:

```bash
npm run check
```

Para cambios de build, rutas, lazy loading, Vite o despliegue:

```bash
npm run build
```

Para cambios visuales en `PortfolioSolarSystem.tsx`, `Portfolio.css`, `Projects.css`, `Chatbot.css` o componentes principales, levantar `npm run dev` y revisar desktop + movil.
