# Portfolio Dashboard con Chatbot RAG

Un portfolio moderno con estética de dashboard, soporte para temas claro/oscuro y un chatbot inteligente con RAG (Retrieval-Augmented Generation).

## 🚀 Características

- ✨ **Diseño Dashboard Moderno**: Interfaz limpia y profesional tipo dashboard
- 🌓 **Temas Claro/Oscuro**: Cambia entre temas con persistencia en localStorage
- 🤖 **Chatbot con IA**: Sistema de chat inteligente listo para integrar RAG
- 📱 **Responsive**: Diseño adaptable a diferentes dispositivos
- ⚡ **Optimizado con Vite**: Desarrollo rápido y builds optimizados
- 🎨 **Componentes Modulares**: Arquitectura de componentes reutilizables

## 📦 Tecnologías Utilizadas

- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Lucide React** - Iconos modernos
- **CSS Variables** - Sistema de temas personalizable

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd portfolio
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
portfolio/
├── src/
│   ├── components/
│   │   ├── sections/        # Secciones del portfolio
│   │   │   ├── Home.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Skills.tsx
│   │   │   ├── Chat.tsx
│   │   │   └── Contact.tsx
│   │   ├── Sidebar.tsx      # Navegación lateral
│   │   ├── Header.tsx       # Cabecera con toggle de tema
│   │   ├── Card.tsx         # Componente de tarjeta
│   │   └── Chatbot.tsx      # Componente del chatbot
│   ├── contexts/
│   │   └── ThemeContext.tsx # Contexto para manejo de temas
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Punto de entrada
│   └── index.css            # Estilos globales y variables CSS
└── package.json
```

## 🤖 Integración del Chatbot con RAG

El chatbot está preparado para conectarse con un backend RAG. Aquí te explico cómo integrarlo:

### Backend Recomendado

Puedes usar Python con FastAPI para crear el backend RAG:

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

@app.post("/chat")
async def chat(message: ChatMessage):
    # Aquí integras tu lógica RAG
    # 1. Convertir el mensaje a embeddings
    # 2. Buscar en tu base de datos vectorial (Pinecone, Weaviate, etc.)
    # 3. Usar el contexto recuperado con un LLM (OpenAI, Anthropic, etc.)
    
    response = generate_rag_response(message.message)
    return {"response": response}
```

### Frontend - Actualizar el Chatbot

En `src/components/Chatbot.tsx`, actualiza la función `sendToRAG`:

```typescript
const sendToRAG = async (userMessage: string): Promise<string> => {
  try {
    const response = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error al comunicarse con el backend:', error);
    throw error;
  }
};
```

### Ejemplo de Stack RAG Completo

**Opción 1: OpenAI + Pinecone**
```bash
pip install openai pinecone-client fastapi uvicorn
```

**Opción 2: LangChain + ChromaDB**
```bash
pip install langchain chromadb openai fastapi uvicorn
```

**Opción 3: Anthropic + Weaviate**
```bash
pip install anthropic weaviate-client fastapi uvicorn
```

### Estructura Sugerida del Backend

```
backend/
├── main.py              # FastAPI app
├── vectorstore.py       # Conexión a DB vectorial
├── embeddings.py        # Generación de embeddings
├── rag_chain.py         # Lógica RAG
├── data/
│   └── portfolio_data/  # Tus datos para indexar
└── requirements.txt
```

## 🎨 Personalización

### Cambiar Colores del Tema

Edita `src/index.css` y modifica las variables CSS:

```css
[data-theme='light'] {
  --primary-color: #3b82f6;  /* Cambia este color */
  --primary-hover: #2563eb;
  /* ... más variables */
}
```

### Agregar Nuevas Secciones

1. Crea un nuevo componente en `src/components/sections/`
2. Importa y agrega la ruta en `src/App.tsx`
3. Añade el item al menú en `src/components/Sidebar.tsx`

### Modificar Contenido

- **Sobre mí**: Edita `src/components/sections/About.tsx`
- **Proyectos**: Actualiza el array `projects` en `src/components/sections/Projects.tsx`
- **Habilidades**: Modifica `skillCategories` en `src/components/sections/Skills.tsx`
- **Contacto**: Actualiza los enlaces en `src/components/sections/Contact.tsx`

## 📝 Scripts Disponibles

```bash
npm run dev      # Inicia servidor de desarrollo
npm run build    # Crea build de producción
npm run preview  # Preview del build de producción
npm run lint     # Ejecuta ESLint
```

## 🚀 Deploy

### Vercel
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Sube la carpeta dist/
```

### GitHub Pages
```bash
# Configura base en vite.config.ts
npm run build
# Sube dist/ a gh-pages branch
```

## 📚 Próximos Pasos

1. **Implementar Backend RAG**: Sigue la guía de integración arriba
2. **Conectar con Base de Datos Vectorial**: Pinecone, Weaviate, ChromaDB, etc.
3. **Indexar tu Contenido**: CV, proyectos, experiencia en formato vectorial
4. **Configurar LLM**: OpenAI, Anthropic, o modelos locales
5. **Agregar Autenticación**: Si deseas funciones protegidas
6. **Analytics**: Google Analytics, Plausible, etc.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

⭐ Si te gustó este proyecto, no olvides darle una estrella!

