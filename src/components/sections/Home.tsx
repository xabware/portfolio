import Card from '../Card';
import './Home.css';

const Home = () => {
  return (
    <div className="section-content">
      <div className="hero-section">
        <h1 className="hero-title">Bienvenido a mi Portfolio</h1>
        <p className="hero-subtitle">
          Desarrollador Full-Stack | Especialista en React & Node.js
        </p>
      </div>

      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-number">5+</div>
          <div className="stat-label">Años de experiencia</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">50+</div>
          <div className="stat-label">Proyectos completados</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">30+</div>
          <div className="stat-label">Clientes satisfechos</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-number">10+</div>
          <div className="stat-label">Tecnologías dominadas</div>
        </Card>
      </div>

      <div className="info-grid">
        <Card title="Sobre este Dashboard">
          <p>
            Este portfolio está construido con React y Vite, implementando una interfaz
            moderna de dashboard con soporte para temas claro y oscuro. Incluye un chatbot
            inteligente con RAG (Retrieval-Augmented Generation) para responder preguntas
            sobre mi experiencia profesional.
          </p>
        </Card>
        <Card title="Características">
          <ul className="features-list">
            <li>✨ Diseño moderno tipo dashboard</li>
            <li>🌓 Soporte para tema claro/oscuro</li>
            <li>🤖 Chatbot con IA integrada</li>
            <li>📱 Diseño responsive</li>
            <li>⚡ Optimizado con Vite</li>
            <li>🎨 Interfaz intuitiva y elegante</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
