# Chatbot con LLM Local

Este proyecto ahora incluye un chatbot con un modelo de lenguaje (LLM) que se ejecuta completamente en el navegador, sin necesidad de un backend.

## 🚀 Características

- **Ejecución local**: El modelo se ejecuta completamente en tu navegador usando WebGPU
- **Sin backend**: No requiere llamadas a API ni servidores externos
- **Privacidad**: Todas las conversaciones permanecen en tu dispositivo
- **Modelo ligero**: Usa Phi-3.5-mini, optimizado para navegadores

## 📋 Requisitos

Para que el chatbot funcione correctamente, necesitas:

1. **Navegador compatible con WebGPU**:
   - Chrome 113+ o Edge 113+
   - Habilitar WebGPU en `chrome://flags` si es necesario

2. **Conexión a internet** (solo la primera vez):
   - El modelo se descarga una vez (~2GB)
   - Después se almacena en caché y funciona offline

## 🎯 Uso

1. Navega a la sección "Chat" en el portfolio
2. Espera a que el modelo se cargue (puede tardar 2-5 minutos la primera vez)
3. Una vez cargado, puedes hacer preguntas al asistente virtual
4. El modelo responde en tiempo real usando IA local

## ⚙️ Configuración Técnica

### Tecnologías Utilizadas

- **@mlc-ai/web-llm**: Framework para ejecutar LLMs en el navegador
- **Phi-3.5-mini-instruct**: Modelo de lenguaje pequeño y eficiente
- **WebGPU**: Para aceleración de hardware
- **React + TypeScript**: Frontend

### Archivos Clave

- `src/hooks/useWebLLM.ts`: Hook personalizado para gestionar el modelo
- `src/components/Chatbot.tsx`: Componente principal del chat
- `vite.config.ts`: Configuración para soportar WebGPU y Workers

## 🔧 Desarrollo

Para ejecutar el proyecto en desarrollo:

\`\`\`bash
npm install
npm run dev
\`\`\`

El servidor incluye los headers necesarios para SharedArrayBuffer y WebGPU.

## 📝 Notas Importantes

1. **Primera carga**: La primera vez que uses el chat, el modelo se descargará (~2GB). Esto puede tardar varios minutos dependiendo de tu conexión.

2. **Memoria**: El modelo requiere aproximadamente 4GB de RAM disponible.

3. **Rendimiento**: El rendimiento varía según tu hardware. Los dispositivos con GPU dedicada tendrán mejor rendimiento.

4. **Compatibilidad**: Si tu navegador no soporta WebGPU, verás un mensaje de error con instrucciones.

## 🎨 Personalización

Puedes personalizar el modelo editando `src/hooks/useWebLLM.ts`:

- **Modelo**: Cambia `'Phi-3.5-mini-instruct-q4f16_1-MLC'` por otro modelo compatible
- **Temperatura**: Ajusta `temperature` (0.0 a 1.0) para respuestas más o menos creativas
- **Tokens**: Modifica `max_tokens` para respuestas más largas o cortas
- **System Prompt**: Edita el prompt del sistema para cambiar el comportamiento del asistente

## 🆚 Comparación: Local vs Backend

### LLM Local (Actual)

✅ Sin latencia de red
✅ Total privacidad
✅ Funciona offline después de la primera carga
✅ Sin costos de servidor
❌ Requiere descarga inicial grande
❌ Limitado por hardware del cliente

### Backend RAG (Anterior)

✅ Modelos más potentes
✅ Sin requisitos de hardware del cliente
✅ Actualizaciones instantáneas
❌ Requiere servidor y costos
❌ Latencia de red
❌ Datos enviados a servidores externos

## 🐛 Solución de Problemas

### El modelo no carga

- Verifica que tu navegador soporte WebGPU
- Limpia el caché del navegador
- Asegúrate de tener suficiente espacio en disco

### Respuestas lentas

- El hardware de tu dispositivo puede ser limitado
- Cierra otras pestañas para liberar memoria
- Considera usar un modelo más pequeño

### Error de WebGPU

- Actualiza tu navegador a la última versión
- Habilita WebGPU en las flags del navegador
- Verifica que tu GPU sea compatible

## 📚 Recursos

- [WebLLM Documentation](https://mlc.ai/web-llm/)
- [WebGPU Support](https://caniuse.com/webgpu)
- [Phi-3 Model Info](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct)
