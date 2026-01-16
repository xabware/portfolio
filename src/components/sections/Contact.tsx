import Card from '../Card';
import { Mail, Linkedin, Github, Twitter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Contact.css';

const Contact = () => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  
  return (
    <div className="section-content">
      <div className="contact-header">
        <h2>{t.contactTitle}</h2>
        <p>{t.contactSubtitle}</p>
      </div>

      <div className="contact-grid">
        <Card title={t.contactInfo} className="contact-card">
          <div className="contact-methods">
            <a href="mailto:tu@email.com" className="contact-method">
              <div className="contact-icon">
                <Mail size={24} />
              </div>
              <div className="contact-details">
                <h4>{t.email}</h4>
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

        <Card title={t.sendMessage} className="contact-form-card">
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">{t.name}</label>
              <input type="text" id="name" placeholder={t.yourName} required />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.email}</label>
              <input type="email" id="email" placeholder={t.yourEmail} required />
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t.subject}</label>
              <input type="text" id="subject" placeholder={t.messageSubject} required />
            </div>

            <div className="form-group">
              <label htmlFor="message">{t.message}</label>
              <textarea
                id="message"
                rows={5}
                placeholder={t.writeMessage}
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              {t.sendButton}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
