import Card from '../Card';
import { Mail, Linkedin, Github, Twitter } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="section-content">
      <div className="contact-header">
        <h2>Contacto</h2>
        <p>¿Interesado en trabajar juntos? ¡Hablemos!</p>
      </div>

      <div className="contact-grid">
        <Card title="Información de Contacto" className="contact-card">
          <div className="contact-methods">
            <a href="mailto:tu@email.com" className="contact-method">
              <div className="contact-icon">
                <Mail size={24} />
              </div>
              <div className="contact-details">
                <h4>Email</h4>
                <p>tu@email.com</p>
              </div>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-method"
            >
              <div className="contact-icon">
                <Linkedin size={24} />
              </div>
              <div className="contact-details">
                <h4>LinkedIn</h4>
                <p>linkedin.com/in/tuperfil</p>
              </div>
            </a>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-method"
            >
              <div className="contact-icon">
                <Github size={24} />
              </div>
              <div className="contact-details">
                <h4>GitHub</h4>
                <p>github.com/tuusuario</p>
              </div>
            </a>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-method"
            >
              <div className="contact-icon">
                <Twitter size={24} />
              </div>
              <div className="contact-details">
                <h4>Twitter</h4>
                <p>@tuusuario</p>
              </div>
            </a>
          </div>
        </Card>

        <Card title="Envíame un mensaje" className="contact-form-card">
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" placeholder="Tu nombre" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="tu@email.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Asunto</label>
              <input type="text" id="subject" placeholder="Asunto del mensaje" required />
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                rows={5}
                placeholder="Escribe tu mensaje aquí..."
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Enviar Mensaje
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
