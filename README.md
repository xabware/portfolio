# 🎯 Portfolio Dashboard

Portfolio moderno y profesional con diseño tipo dashboard, temas claro/oscuro y chatbot con IA ejecutándose localmente en el navegador.

## ✨ Características Principales

- 🎨 **Data-Driven**: Todo el contenido (proyectos, habilidades, experiencia) se gestiona desde archivos centralizados
- 🤖 **Chatbot con IA Local**: WebLLM ejecutándose completamente en tu navegador (sin backend)
- 🌓 **Temas Claro/Oscuro**: Sistema de colores personalizable con persistencia
- 🔍 **Búsqueda Inteligente**: Busca en todo el portfolio, actualizado automáticamente con tus datos
- 📱 **Responsive**: Optimizado para todo tipo de dispositivos
- ⚡ **Alto Rendimiento**: Vite, React 19, código splitting y lazy loading
- 🌍 **Multilingüe**: Soporte completo español/inglés

## 🛠️ Stack Tecnológico

- **React 19** + **TypeScript** - UI moderna y type-safe
- **Vite** - Build ultrarrápido con HMR
- **WebLLM** - IA ejecutándose en el navegador (WebGPU)
- **EmailJS** - Envío de mensajes sin backend
- **CSS Variables** - Sistema de temas flexible

## � Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/xabware/portfolio.git
cd portfolio

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

### Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```

## 📝 Personalización

### 1. Actualizar Tus Datos

Todos tus datos están centralizados en `src/data/`:

**`projects.ts`** - Añade/edita tus proyectos
```typescript
{
  id: 1,
  title: { es: 'Mi Proyecto', en: 'My Project' },
  description: { es: '...', en: '...' },
  tech: ['React', 'TypeScript'],
  github: 'https://github.com/...',
  demo: 'https://...',
  details: { /* información detallada */ }
}
```

**`skills.ts`** - Gestiona tus habilidades
```typescript
{
  title: { es: 'Frontend', en: 'Frontend' },
  skills: [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 }
  ]
}
```

**`about.ts`** - Tu experiencia y educación
```typescript
// Información personal
personalInfo: { description: { es: [...], en: [...] } }

// Experiencia laboral
experiences: [{ title, company, description, period }]

// Educación
education: [{ degree, institution, description, period }]
```

> 💡 **Ventaja**: Al actualizar estos archivos, el chatbot y la búsqueda se actualizan automáticamente

### 2. Configurar EmailJS (Contacto)

1. Crea cuenta en [EmailJS](https://www.emailjs.com/)
2. Configura un servicio de email
3. Crea una plantilla de email
4. Copia tus credenciales a `src/components/sections/Contact.tsx`:

```typescript
const serviceId = 'TU_SERVICE_ID';
const templateId = 'TU_TEMPLATE_ID';
const publicKey = 'TU_PUBLIC_KEY';
```

### 3. Personalizar Colores

Edita `src/index.css`:

```css
[data-theme='light'] {
  --primary-color: #3b82f6;      /* Color principal */
  --primary-hover: #2563eb;      /* Hover principal */
  --bg-primary: #ffffff;         /* Fondo principal */
  --text-primary: #1e293b;       /* Texto principal */
}

[data-theme='dark'] {
  --primary-color: #60a5fa;
  --bg-primary: #0f172a;
  --text-primary: #f1f5f9;
}
```

## 🤖 Chatbot con IA

El chatbot usa **WebLLM** y se ejecuta completamente en el navegador:

- ✅ **Sin backend** - Todo corre en el cliente
- ✅ **Privacidad** - Tus datos no salen del navegador
- ✅ **Sin costos** - No necesitas API keys
- ⚠️ **Requiere WebGPU** - Navegadores modernos (Chrome 113+, Edge 113+)

### Modelos Disponibles

- **Qwen 2.5 0.5B** - Ultra ligero (~350MB)
- **Phi 3.5 Mini** - Recomendado (~2.2GB)
- **Qwen 2.5 1.5B** - Ligero (~900MB)
- **Llama 3.2 3B** - Requiere GPU dedicada (~1.8GB)

### Cómo Funciona

El chatbot obtiene tu información automáticamente desde `src/data/`:
- Lee tus proyectos
- Indexa tus habilidades
- Conoce tu experiencia

Para modificar el comportamiento, edita `src/data/contextGenerator.ts`.

## 📁 Estructura del Proyecto

```
portfolio/
├── src/
│   ├── components/
│   │   ├── sections/          # Secciones del portfolio
│   │   │   ├── Home.tsx       # Página de inicio
│   │   │   ├── About.tsx      # Sobre mí (usa data/about.ts)
│   │   │   ├── Projects.tsx   # Proyectos (usa data/projects.ts)
│   │   │   ├── Skills.tsx     # Habilidades (usa data/skills.ts)
│   │   │   ├── Chat.tsx       # Interfaz del chatbot
│   │   │   └── Contact.tsx    # Formulario de contacto
│   │   ├── Sidebar.tsx        # Navegación lateral
│   │   ├── Header.tsx         # Barra superior
│   │   ├── SearchBar.tsx      # Búsqueda global
│   │   └── Chatbot.tsx        # Lógica del chatbot
│   ├── contexts/
│   │   ├── ThemeContext.tsx   # Gestión de temas claro/oscuro
│   │   ├── LanguageContext.tsx # Sistema multilingüe
│   │   └── WebLLMContext.tsx  # Estado del chatbot IA
│   ├── data/                  # ⭐ Datos centralizados
│   │   ├── projects.ts        # Tus proyectos
│   │   ├── skills.ts          # Tus habilidades
│   │   ├── about.ts           # Tu información personal
│   │   ├── contextGenerator.ts # Generador dinámico
│   │   └── README.md          # Guía de uso de datos
│   ├── config/
│   │   └── chatbotConfig.ts   # Configuración de modelos IA
│   ├── translations.ts        # Traducciones ES/EN
│   └── App.tsx                # Componente raíz
└── package.json
```

## 🚀 Despliegue

### GitHub Pages

1. Actualiza `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/portfolio/', // nombre de tu repo
  // ...
})
```

2. Build y deploy:
```bash
npm run build
# Sube la carpeta dist/ a gh-pages branch
```

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

1. Conecta tu repo en Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

## 🎯 Características Avanzadas

### Sistema Data-Driven

Todo el contenido es gestionado desde la carpeta `data/`. Beneficios:

- ✅ **Single Source of Truth**: Datos en un solo lugar
- ✅ **Auto-actualización**: Chatbot y búsqueda se actualizan automáticamente
- ✅ **Fácil mantenimiento**: Editas una vez, se actualiza todo
- ✅ **Type-safe**: TypeScript previene errores

### Búsqueda Inteligente

La búsqueda indexa automáticamente:
- Todos tus proyectos con sus tecnologías
- Todas tus habilidades y competencias
- Tu experiencia laboral y educación

### i18n (Internacionalización)

Soporta español e inglés de forma nativa:
- UI completamente traducida
- Todos los datos tienen versión ES/EN
- Cambio de idioma instantáneo con persistencia

## 📚 Documentación Adicional

- **Guía de Datos**: `src/data/README.md` - Cómo actualizar tus datos
- **Ejemplo Backend**: `backend-example/` - Backend RAG con Python/FastAPI (opcional)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

MIT License - Usa libremente para tu portfolio personal.

---

**⭐ ¿Te gustó? Dale una estrella en GitHub!**

Portfolio desarrollado con ❤️ por [Xabier Cía](https://github.com/xabware)

