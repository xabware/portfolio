import { lazy, Suspense } from 'react';
import './Chat.css';

const Chatbot = lazy(() => import('../Chatbot'));

const Chat = () => {
  return (
    <div className="chat-full-screen">
      <Suspense fallback={<div className="loading">Cargando chat...</div>}>
        <Chatbot />
      </Suspense>
    </div>
  );
};

export default Chat;
