"""
Script para indexar datos en la base de datos vectorial

Este script procesa archivos de texto, PDFs, o cualquier fuente de datos
y los convierte en embeddings que se almacenan en el vectorstore.
"""

import os
from typing import List, Dict

# Ejemplo de datos para indexar
PORTFOLIO_DATA = [
    {
        "id": "exp_001",
        "content": "Tengo más de 5 años de experiencia en desarrollo full-stack. He trabajado con React, Vue.js, Node.js, Python y TypeScript. Mi enfoque principal es crear aplicaciones web modernas, escalables y de alto rendimiento.",
        "metadata": {"category": "experience", "topic": "general"}
    },
    {
        "id": "exp_002",
        "content": "Senior Full-Stack Developer en Tech Company desde 2022. Lidero el desarrollo de aplicaciones empresariales utilizando React, Node.js y arquitectura de microservicios. He implementado sistemas distribuidos y optimizado el rendimiento de aplicaciones con millones de usuarios.",
        "metadata": {"category": "experience", "topic": "work_history"}
    },
    {
        "id": "skill_001",
        "content": "Frontend: React (95%), TypeScript (90%), Vue.js (75%), CSS/Sass (85%). Experto en React Hooks, Context API, Redux, y las últimas características como Server Components.",
        "metadata": {"category": "skills", "topic": "frontend"}
    },
    {
        "id": "skill_002",
        "content": "Backend: Node.js (90%), Python (85%), Express (88%), FastAPI (80%). Experiencia con APIs REST, GraphQL, y arquitecturas de microservicios.",
        "metadata": {"category": "skills", "topic": "backend"}
    },
    {
        "id": "skill_003",
        "content": "Bases de datos: MongoDB (85%), PostgreSQL (82%), Redis (75%), Pinecone (70%). Experiencia con bases de datos relacionales, NoSQL y vectoriales.",
        "metadata": {"category": "skills", "topic": "databases"}
    },
    {
        "id": "project_001",
        "content": "E-commerce Platform: Plataforma de comercio electrónico completa con carrito de compras, pasarela de pago Stripe, panel de administración. Tecnologías: React, Node.js, MongoDB, Stripe. Maneja más de 10,000 transacciones mensuales.",
        "metadata": {"category": "projects", "topic": "ecommerce"}
    },
    {
        "id": "project_002",
        "content": "Task Management App: Aplicación de gestión de tareas con colaboración en tiempo real usando WebSockets. Implementa notificaciones push y sincronización offline. Tecnologías: React, Firebase, Material-UI.",
        "metadata": {"category": "projects", "topic": "productivity"}
    },
    {
        "id": "project_003",
        "content": "AI Chatbot System: Sistema de chatbot inteligente con procesamiento de lenguaje natural y base de conocimiento vectorial. Implementa RAG (Retrieval-Augmented Generation) para respuestas contextuales. Tecnologías: Python, FastAPI, OpenAI, Pinecone.",
        "metadata": {"category": "projects", "topic": "ai"}
    },
    {
        "id": "education_001",
        "content": "Ingeniería en Sistemas Computacionales, Universidad Tecnológica, 2015-2019. Especialización en desarrollo de software y sistemas distribuidos.",
        "metadata": {"category": "education", "topic": "degree"}
    },
]

def load_data_from_files(directory: str) -> List[Dict]:
    """
    Carga datos desde archivos en un directorio
    Puedes expandir esto para leer PDFs, Word docs, etc.
    """
    documents = []
    
    if not os.path.exists(directory):
        print(f"⚠️ Directorio {directory} no existe")
        return PORTFOLIO_DATA
    
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                documents.append({
                    "id": f"file_{filename}",
                    "content": content,
                    "metadata": {"source": filename}
                })
    
    return documents if documents else PORTFOLIO_DATA

def index_documents(vectorstore, documents: List[Dict]):
    """
    Indexa documentos en el vectorstore
    """
    print(f"Indexando {len(documents)} documentos...")
    
    # Aquí implementas la lógica según tu vectorstore
    # Ejemplo con ChromaDB:
    """
    vectorstore.add(
        documents=[doc["content"] for doc in documents],
        metadatas=[doc["metadata"] for doc in documents],
        ids=[doc["id"] for doc in documents]
    )
    """
    
    # Ejemplo con Pinecone/LangChain:
    """
    from langchain.docstore.document import Document
    
    docs = [
        Document(page_content=doc["content"], metadata=doc["metadata"])
        for doc in documents
    ]
    vectorstore.add_documents(docs)
    """
    
    print("✅ Documentos indexados correctamente")

def main():
    """
    Script principal para indexar datos
    """
    print("🚀 Iniciando indexación de datos...")
    
    # Cargar datos
    data_directory = "./data/portfolio_data"
    documents = load_data_from_files(data_directory)
    
    print(f"📄 Cargados {len(documents)} documentos")
    
    # Inicializar vectorstore
    # from vectorstore import initialize_vectorstore
    # vectorstore = initialize_vectorstore()
    
    # Indexar documentos
    # index_documents(vectorstore, documents)
    
    print("⚠️ Para completar la indexación, implementa initialize_vectorstore y index_documents")
    print(f"💡 Datos de ejemplo disponibles: {len(PORTFOLIO_DATA)} documentos")
    
    # Mostrar ejemplo de documentos
    print("\n📋 Ejemplo de documentos a indexar:")
    for doc in documents[:3]:
        print(f"\nID: {doc['id']}")
        print(f"Categoría: {doc['metadata'].get('category', 'N/A')}")
        print(f"Contenido: {doc['content'][:100]}...")

if __name__ == "__main__":
    main()
