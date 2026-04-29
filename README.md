# Portfolio

Portfolio personal de Xabier Cia Valencia construido como una aplicacion React/Vite con enfoque data-driven, soporte ES/EN, tema claro/oscuro, visualizacion 3D y chatbot local con WebLLM + RAG sobre PDFs.

## Stack

- React 19 + TypeScript
- Vite 7
- CSS modular por componente
- WebLLM en navegador con WebGPU
- pdf.js para lectura/visualizacion de PDFs
- Three.js + React Three Fiber para la seccion 3D
- Firebase opcional para CMS y analiticas

## Requisitos

- Node `>=20.19.0 <21` o `>=22.12.0`
- npm
- Navegador moderno. El chatbot local necesita WebGPU para cargar modelos WebLLM.

La version recomendada para desarrollo y CI es Node 22. El repo incluye `.nvmrc`.

## Inicio rapido

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Scripts

```bash
npm run dev        # Servidor local Vite
npm run lint       # ESLint
npm run typecheck  # TypeScript sin emitir archivos
npm run check      # Lint + typecheck
npm run build      # Typecheck + build de produccion
npm run preview    # Preview local de dist
```

## Configuracion

Copia `.env.example` a `.env.local` si necesitas activar integraciones:

```bash
VITE_ANALYTICS_ENABLED=false
VITE_FIREBASE_CMS_ENABLED=false
VITE_BASE_PATH=/portfolio/
```

Firebase solo se usa si activas `VITE_ANALYTICS_ENABLED` o `VITE_FIREBASE_CMS_ENABLED` con el valor exacto `true`. Sin esas flags, el portfolio funciona con datos estaticos.

Si no defines `VITE_BASE_PATH`, Vite usa `/` en desarrollo local y `/portfolio/` en builds de produccion.

## Contenido editable

El contenido principal vive en `src/data/`:

- `projects.ts`: proyectos, demos, tecnologias y detalle ES/EN.
- `about.ts`: descripcion personal, experiencia, educacion y fechas para el contador.
- `skills.ts`: categorias, skills y descripciones ES/EN.
- `contextGenerator.ts`: contexto que consume el chatbot.

Al editar estos archivos, se actualizan las secciones del portfolio, la busqueda y el contexto del chatbot. Hay una guia especifica en `src/data/README.md`.

Los datos plantilla del panel CMS estan en `public/data-defaults.json`. Si cambias mucho la estructura de `src/data`, revisa tambien ese JSON.

## Estructura

```text
src/
  components/
    sections/
      Portfolio.tsx              # Vista principal: hero, about, experiencia, educacion y skills
      Projects.tsx               # Listado y detalle de proyectos
      Space.tsx                  # Entrada lazy a la escena 3D
      PortfolioSolarSystem.tsx   # Escena Three.js
      Chat.tsx                   # Orquesta chatbot, visor PDF y debug RAG
      Contact.tsx                # Formulario EmailJS y enlaces
    Chatbot.tsx                  # UI del chat
    PDFViewer.tsx                # Visor PDF
    DebugPanel.tsx               # Inspeccion del pipeline RAG
    Header.tsx / Sidebar.tsx     # Navegacion y acciones globales
  config/                        # Flags e inicializacion Firebase
  contexts/                      # Tema, idioma y WebLLM
  data/                          # Fuente de verdad del contenido
  hooks/                         # Hooks de analiticas y WebLLM
  services/                      # CMS, analiticas y descargas
  stores/                        # Store mutable del CMS
  utils/                         # PDF parser y vector store RAG
```

`backend-example/` es solo una referencia opcional para un backend RAG con FastAPI. La app principal no lo necesita.

## Despliegue

El workflow `.github/workflows/deploy.yml` publica `dist/` en GitHub Pages cuando hay push a `main` o ejecucion manual.

Para el sitio de proyecto `https://xabware.github.io/portfolio`, el build usa:

```bash
VITE_BASE_PATH=/portfolio/
```

Si despliegas en dominio raiz, usa:

```bash
VITE_BASE_PATH=/
```

El workflow permite activar analiticas y CMS en despliegues manuales mediante inputs.

## Notas de rendimiento

- WebLLM se carga en chunk separado y solo al abrir el chat.
- Three.js se carga en chunk separado y solo al abrir `Space`.
- EmailJS se separa del bundle principal.
- No se generan `.gz`/`.br` en build: GitHub Pages no aprovecha esa precompresion y el plugin anterior ensuciaba `dist` en Windows.

## Trabajo con agentes

Lee `AGENTS.md` antes de tocar el repo. Resume arquitectura, comandos de verificacion, zonas sensibles y reglas para cambios seguros.
