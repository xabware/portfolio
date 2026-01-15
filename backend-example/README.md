# Backend RAG - Ejemplo de Implementación

Este directorio contiene un ejemplo de cómo implementar el backend con RAG para el chatbot del portfolio.

## Instalación Rápida

```bash
# Crea un entorno virtual
python -m venv venv

# Activa el entorno (Windows)
venv\Scripts\activate

# Activa el entorno (Linux/Mac)
source venv/bin/activate

# Instala dependencias
pip install -r requirements.txt
```

## Ejecutar el Backend

```bash
uvicorn main:app --reload --port 8000
```

## Tecnologías Utilizadas

- **FastAPI**: Framework web moderno y rápido
- **OpenAI/Anthropic**: LLM para generar respuestas
- **Pinecone/ChromaDB/Weaviate**: Base de datos vectorial
- **LangChain**: Framework para aplicaciones LLM (opcional)

## Configuración

1. Copia el archivo `.env.example` a `.env`
2. Agrega tus API keys:
   - `OPENAI_API_KEY=tu-api-key`
   - `PINECONE_API_KEY=tu-api-key` (si usas Pinecone)
3. Indexa tus datos ejecutando `python indexer.py`

## Estructura de Archivos

- `main.py`: Servidor FastAPI principal
- `vectorstore.py`: Configuración de la base de datos vectorial
- `embeddings.py`: Generación de embeddings
- `rag_chain.py`: Implementación de la cadena RAG
- `indexer.py`: Script para indexar tus datos
- `data/`: Directorio con datos a indexar

## Endpoints

### POST /chat
Envía un mensaje y recibe una respuesta del chatbot.

**Request:**
```json
{
  "message": "¿Qué experiencia tienes en React?"
}
```

**Response:**
```json
{
  "response": "Tengo más de 5 años de experiencia en React..."
}
```

## Personalización

Edita los archivos según tu stack preferido:
- Para usar ChromaDB en lugar de Pinecone, modifica `vectorstore.py`
- Para usar Anthropic en lugar de OpenAI, actualiza `rag_chain.py`
- Para agregar más datos, añade archivos a `data/` y ejecuta `indexer.py`
