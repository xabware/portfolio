import { memo, useMemo, useState } from 'react';
import Card from '../Card';
import { Mail, Linkedin, Github, Twitter } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import './Contact.css';

const Contact = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  const [showNotification, setShowNotification] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Aquí iría la lógica real de envío del correo
    // Por ahora solo mostramos la notificación
    
    setShowNotification(true);
    
    // Ocultar la notificación después de 3 segundos
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
    
    // Resetear el formulario
    e.currentTarget.reset();
  };

  const contactMethods = useMemo(() => [
    {
      icon: Mail,
      title: t.email,
      value: 'tu@email.com',
      link: 'mailto:tu@email.com',
    },
    {
      icon: Linkedin,
      title: 'LinkedIn',
      value: 'linkedin.com/in/tuperfil',
      link: 'https://linkedin.com',
    },
    {
      icon: Github,
      title: 'GitHub',
      value: 'github.com/tuusuario',
      link: 'https://github.com',
    },
    {
      icon: Twitter,
      title: 'Twitter',
      value: '@tuusuario',
      link: 'https://twitter.com',
    },
  ], [t]);
  
  return (
    <div className="section-content">
      <div className="contact-header">
        <h2>{t.contactTitle}</h2>
        <p>{t.contactSubtitle}</p>
      </div>

      <div className="contact-grid">
        <Card title={t.contactInfo} className="contact-card">
          <div className="contact-methods">
            {contactMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <a
                  key={`contact-${idx}`}
                  href={method.link}
                  className="contact-method"
                  target={method.link.startsWith('http') ? '_blank' : undefined}
                  rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="contact-icon">
                    <Icon size={24} />
                  </div>
                  <div className="contact-details">
                    <h4>{method.title}</h4>
                    <p>{method.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>

        <Card title={t.sendMessage} className="contact-form-card">
          {showNotification && (
            <div className="success-notification">
              {t.messageSent}
            </div>
          )}
          <form className="contact-form" onSubmit={handleSubmit}>
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
});

Contact.displayName = 'Contact';

export default Contact;
