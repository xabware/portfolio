from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Importa tus módulos personalizados (crear después)
# from rag_chain import get_rag_response
# from vectorstore import initialize_vectorstore

load_dotenv()

app = FastAPI(title="Portfolio RAG Backend")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# Inicializar el vectorstore al arrancar la app
@app.on_event("startup")
async def startup_event():
    """Inicializa la base de datos vectorial al arrancar"""
    # vectorstore = initialize_vectorstore()
    # app.state.vectorstore = vectorstore
    print("Backend RAG iniciado correctamente")

@app.get("/")
async def root():
    return {
        "message": "Portfolio RAG Backend API",
        "status": "running",
        "endpoints": {
            "chat": "/chat",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    """
    Endpoint principal del chatbot con RAG
    
    Args:
        message: Mensaje del usuario
        
    Returns:
        response: Respuesta generada por el sistema RAG
    """
    try:
        if not message.message or len(message.message.strip()) == 0:
            raise HTTPException(status_code=400, detail="El mensaje no puede estar vacío")
        
        # AQUÍ IMPLEMENTAS TU LÓGICA RAG
        # Ejemplo básico:
        
        # 1. Generar embeddings del mensaje
        # user_embedding = generate_embedding(message.message)
        
        # 2. Buscar contexto relevante en el vectorstore
        # relevant_docs = app.state.vectorstore.similarity_search(
        #     message.message, 
        #     k=3
        # )
        
        # 3. Generar respuesta con el LLM usando el contexto
        # response_text = get_rag_response(
        #     query=message.message,
        #     context=relevant_docs
        # )
        
        # Por ahora, respuesta simulada
        response_text = simulate_rag_response(message.message)
        
        return ChatResponse(response=response_text)
        
    except Exception as e:
        print(f"Error en el chat: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error al procesar el mensaje: {str(e)}"
        )

def simulate_rag_response(query: str) -> str:
    """
    Función temporal para simular respuestas RAG
    Reemplázala con tu implementación real
    """
    query_lower = query.lower()
    
    responses = {
        "experiencia": "Tengo más de 5 años de experiencia en desarrollo full-stack, trabajando principalmente con React, Node.js, TypeScript y Python. He liderado proyectos de arquitectura de microservicios y optimización de rendimiento.",
        "react": "Soy experto en React con más de 4 años de experiencia. He trabajado con React Hooks, Context API, Redux, y las últimas características como Server Components. También tengo experiencia con Next.js y frameworks relacionados.",
        "proyectos": "He completado más de 50 proyectos, incluyendo plataformas e-commerce, dashboards de analytics, aplicaciones de gestión empresarial, y sistemas de chatbots con IA. Algunos proyectos destacados incluyen una plataforma de e-learning con más de 10,000 usuarios activos.",
        "habilidades": "Mis principales habilidades incluyen: Frontend (React, TypeScript, Vue), Backend (Node.js, Python, FastAPI), Bases de datos (PostgreSQL, MongoDB, Redis), DevOps (Docker, AWS, CI/CD), y recientemente he estado trabajando con IA y RAG systems.",
        "contacto": "Puedes contactarme a través del formulario de contacto en mi portfolio, por email, o conectar conmigo en LinkedIn y GitHub. Siempre estoy abierto a nuevas oportunidades y colaboraciones interesantes."
    }
    
    # Buscar palabra clave en la consulta
    for keyword, response in responses.items():
        if keyword in query_lower:
            return response
    
    # Respuesta por defecto
    return "Gracias por tu pregunta. Soy un asistente virtual que puede ayudarte con información sobre mi experiencia profesional, proyectos, habilidades técnicas y más. ¿Hay algo específico sobre lo que te gustaría saber?"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
