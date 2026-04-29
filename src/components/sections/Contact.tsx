import { memo, useState, type ComponentType } from 'react';
import Card from '../Card';
import { Globe, Mail } from 'lucide-react';
import { LinkedinIcon, GithubIcon } from '../BrandIcons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTranslations } from '../../translations';
import { useCMSDataVersion } from '../../stores/cmsDataStore';
import { getContactMethods, getEmailJSSettings, type ContactMethodType } from '../../data/siteSettings';
import emailjs from '@emailjs/browser';
import './Contact.css';

type ContactIcon = ComponentType<{ size?: number; className?: string }>;

const contactIcons: Record<ContactMethodType, ContactIcon> = {
  email: Mail,
  linkedin: LinkedinIcon,
  github: GithubIcon,
  website: Globe,
  custom: Mail,
};

const Contact = memo(() => {
  const { language } = useLanguage();
  const t = useTranslations(language);
  useCMSDataVersion();
  const [showNotification, setShowNotification] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setIsError(false);
    
    const form = e.currentTarget;
    
    try {
      const emailSettings = getEmailJSSettings();
      await emailjs.sendForm(
        emailSettings.serviceId,
        emailSettings.templateId,
        form,
        emailSettings.publicKey
      );
      //Si has llegado a leer esto es que estás hurgando en mi página. Sí, son las credenciales para mandarme correos, enhorabuena.

      setShowNotification(true);
      setIsError(false);
      form.reset();
      
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setIsError(true);
      setShowNotification(true);
      
      setTimeout(() => {
        setShowNotification(false);
        setIsError(false);
      }, 4000);
    } finally {
      setIsSending(false);
    }
  };

  const contactMethods = getContactMethods(language);
  const emailSettings = getEmailJSSettings();
  
  return (
    <div className="section-content">
      <div className="contact-header">
        <p className="section-subtitle">{t.contactSubtitle}</p>
      </div>

      <div className="contact-grid">
        <Card title={t.contactInfo} className="contact-card">
          <div className="contact-methods">
            {contactMethods.map((method, idx) => {
              const Icon = contactIcons[method.type] ?? Mail;
              return (
                <a
                  key={`contact-${idx}`}
                  href={method.href}
                  className="contact-method"
                  target={method.href.startsWith('http') ? '_blank' : undefined}
                  rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <div className="contact-icon">
                    <Icon size={24} />
                  </div>
                  <div className="contact-details">
                    <h3>{method.displayTitle}</h3>
                    <p>{method.value}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Card>

        <Card title={t.sendMessage} className="contact-form-card">
          {showNotification && (
            <div className={isError ? 'error-notification' : 'success-notification'}>
              {isError ? t.messageError : t.messageSent}
            </div>
          )}
          <form className="contact-form" onSubmit={handleSubmit}>
            <input type="hidden" name="to_email" value={emailSettings.toEmail} />
            
            <div className="form-group">
              <label htmlFor="name">{t.name}</label>
              <input type="text" id="name" name="from_name" placeholder={t.yourName} required disabled={isSending} />
            </div>

            <div className="form-group">
              <label htmlFor="email">{t.email}</label>
              <input type="email" id="email" name="from_email" placeholder={t.yourEmail} required disabled={isSending} />
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t.subject}</label>
              <input type="text" id="subject" name="subject" placeholder={t.messageSubject} required disabled={isSending} />
            </div>

            <div className="form-group">
              <label htmlFor="message">{t.message}</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                placeholder={t.writeMessage}
                required
                disabled={isSending}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={isSending}>
              {isSending ? t.sending : t.sendButton}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
});

Contact.displayName = 'Contact';

export default Contact;
