import { lazy, Suspense, memo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Chat.css';

const Chatbot = lazy(() => import('../Chatbot'));

const Chat = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return (
    <div className="chat-full-screen">
      <Suspense fallback={<div className="loading">{t.chatLoading}</div>}>
        <Chatbot />
      </Suspense>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
