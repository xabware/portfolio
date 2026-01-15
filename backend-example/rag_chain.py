"""
Módulo para implementar la cadena RAG (Retrieval-Augmented Generation)

Este módulo combina:
1. Recuperación de documentos relevantes del vectorstore
2. Generación de respuestas usando un LLM con el contexto recuperado
"""

from typing import List, Dict
import os
from dotenv import load_dotenv

load_dotenv()

# Ejemplo con OpenAI y LangChain (descomenta para usar)
"""
from langchain_openai import ChatOpenAI
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

def create_rag_chain(vectorstore):
    # Inicializar el LLM
    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0.7,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Template personalizado para el portfolio
    template = '''
    Eres un asistente virtual para un portfolio profesional. Tu objetivo es responder 
    preguntas sobre la experiencia, proyectos, habilidades y carrera del desarrollador.
    
    Usa el siguiente contexto para responder la pregunta. Si no sabes la respuesta 
    basándote en el contexto, di que no tienes esa información.
    
    Contexto: {context}
    
    Pregunta: {question}
    
    Respuesta útil y profesional:
    '''
    
    prompt = PromptTemplate(
        template=template,
        input_variables=["context", "question"]
    )
    
    # Crear la cadena RAG
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True
    )
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        memory=memory,
        combine_docs_chain_kwargs={"prompt": prompt}
    )
    
    return chain

def get_rag_response(chain, query: str) -> str:
    result = chain({"question": query})
    return result["answer"]
"""

# Ejemplo simple sin LangChain (descomenta para usar)
"""
from openai import OpenAI

def get_rag_response(query: str, context: List[Dict]) -> str:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    # Formatear el contexto
    context_text = "\n\n".join([doc["content"] for doc in context])
    
    # Crear el prompt
    system_prompt = '''
    Eres un asistente virtual profesional para un portfolio. Responde preguntas 
    sobre experiencia, proyectos y habilidades basándote en el contexto proporcionado.
    '''
    
    user_prompt = f'''
    Contexto relevante:
    {context_text}
    
    Pregunta del usuario: {query}
    
    Por favor proporciona una respuesta útil y profesional.
    '''
    
    # Llamar a la API de OpenAI
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.7,
        max_tokens=500
    )
    
    return response.choices[0].message.content
"""

# Placeholder function
def get_rag_response(query: str, context: List[Dict] = None) -> str:
    """
    Genera una respuesta usando RAG
    Descomenta el código de arriba para implementar con OpenAI o Anthropic
    """
    return "⚠️ RAG chain no configurada. Por favor implementa get_rag_response()"
