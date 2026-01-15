import Chatbot from '../Chatbot';
import Card from '../Card';
import './Chat.css';

const Chat = () => {
  return (
    <div className="section-content">
      <Card title="Asistente Virtual con RAG" className="chat-info">
        <p>
          Este chatbot utiliza tecnología RAG (Retrieval-Augmented Generation) para
          responder preguntas sobre mi experiencia, proyectos y habilidades. La información
          se recupera de una base de datos vectorial que contiene todo mi portfolio.
        </p>
        <div className="chat-features">
          <span className="feature-badge">🤖 IA Conversacional</span>
          <span className="feature-badge">📚 Base de Conocimiento</span>
          <span className="feature-badge">⚡ Respuestas en tiempo real</span>
        </div>
      </Card>

      <div className="chat-section">
        <Chatbot />
      </div>
    </div>
  );
};

export default Chat;
