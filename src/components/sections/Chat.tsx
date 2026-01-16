import { lazy, Suspense } from 'react';
import Card from '../Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Chat.css';

const Chatbot = lazy(() => import('../Chatbot'));

const Chat = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return (
    <div className="section-content">
      <Card title={t.virtualAssistant} className="chat-info">
        <p>
          {t.chatDescription}
        </p>
        <div className="chat-features">
          <span className="feature-badge">{t.conversationalAI}</span>
          <span className="feature-badge">{t.knowledgeBase}</span>
          <span className="feature-badge">{t.realtimeResponses}</span>
        </div>
      </Card>

      <div className="chat-section">
        <Suspense fallback={<div className="loading">Cargando chat...</div>}>
          <Chatbot />
        </Suspense>
      </div>
    </div>
  );
};

export default Chat;
