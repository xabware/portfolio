import { useMemo } from 'react';
import type { Language } from './contexts/LanguageContext';

export const translations = {
  es: {
    // Header
    dashboardPortfolio: 'Dashboard Portfolio',
    
    // Sidebar
    portfolio: 'Portfolio',
    home: 'Inicio',
    about: 'Sobre mí',
    projects: 'Proyectos',
    skills: 'Habilidades',
    chatbot: 'Chatbot',
    contact: 'Contacto',
    
    // Home
    welcomeTitle: 'Xabier Cía Valencia',
    welcomeSubtitle: 'Desarrollador Full-Stack y AI | Arquitectura de cloud',
    yearsExperience: 'Años de experiencia',
    projectsCompleted: 'Proyectos completados',
    aboutDashboard: 'Sobre este Dashboard',
    dashboardDescription: 'Este dashboard es un proyecto que he creado para compartir y unificar en un sitio todos los otros proyectos que vaya desarrollando. En mi repositorio de github tengo una rama con la plantilla sin mis datos personales que animo a cualquiera que esté leyendo esto a utilizar como base para su propio portfolio.',
    features: 'Características',
    modernDesign: '✨ Diseño moderno de dashboard',
    darkModeSupport: '🌓 Soporte de tema claro/oscuro',
    aiChatbot: '🤖 Chatbot IA integrado',
    responsiveDesign: '📱 Diseño responsive',
    viteOptimized: '⚡ Optimizado con Vite',
    elegantInterface: '🎨 Interfaz intuitiva y elegante',
    
    // About
    aboutMe: 'Sobre mí',
    aboutDescription1: 'Soy una persona curiosa e implicada. Elegí como carrera la ingeniería de software porque estaba dudando entre demasiadas carreras, física, biología, matemáticas... Y sentí que la ingeniería de software, por su caracter transversal, me permitiría explorar muchas áreas y llegar a encontrar qué era lo que más me apasionaba en la vida.',
    aboutDescription2: 'A día de hoy, soy consciente de que lo que me llamó de la informática, es su capacidad para transformar cada área del mundo de una forma distinta, y de impactar en tantas vidas de una forma positiva. Me gusta estar al día con los últimos avances tecnológicos, y encontrar formas de las que pueden mejorar la calidad de vida de las personas.',
    professionalExperience: 'Experiencia Profesional',
    seniorFullStack: 'Full-Stack Developer',
    techCompany: 'Tracasa instrumental | 2021 - Presente',
    seniorDescription: 'Desarrollo de aplicaciones gubernamentales utilizando principalmente .NET, angular, react y T-SQL. Implementación de arquitectura y planificación de proyectos, integración de sistemas de inteligencia artificial.',
    fullStackDeveloper: 'Prácticas extracurriculares',
    startupTech: 'Veridas | 2020',
    fullStackDescription: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial. Diseño de aplicaciones móviles con android studio y java.',
    juniorDeveloper: 'Prácticas extracurriculares',
    softwareAgency: 'Veridas | 2019',
    juniorDescription: 'Preparación de conjuntos de datos para entrenar modelos de reconocimiento facial.',
    education: 'Educación',
    educationItems: [
      {
        degree: 'Master en Ingeniería informática',
        institution: 'Universidad pública de Navarra | 2021-2024',
        description: 'Master generalista que cubre los contenidos que se quedan fuera del grado.'
      },
      {
        degree: 'Ingeniería informática',
        institution: 'Universidad pública de Navarra | 2017-2021',
        description: 'Especialización en Computación y sistemas inteligentes y en Tecnologías de la información.'
      }
    ],
    
    // Projects
    myProjects: 'Mis Proyectos',
    projectsSubtitle: 'Una selección de proyectos en los que he trabajado',
    ecommercePlatform: 'E-commerce Platform',
    ecommerceDescription: 'Plataforma de comercio electrónico completa con carrito de compras, pasarela de pago y panel de administración.',
    taskManagementApp: 'Task Management App',
    taskManagementDescription: 'Aplicación de gestión de tareas con funciones de colaboración en tiempo real y notificaciones.',
    aiChatbotSystem: 'AI Chatbot System',
    aiChatbotDescription: 'Sistema de chatbot inteligente con procesamiento de lenguaje natural y base de conocimiento vectorial.',
    analyticsDashboard: 'Analytics Dashboard',
    analyticsDashboardDescription: 'Dashboard de analíticas en tiempo real con visualizaciones interactivas y reportes personalizables.',
    code: 'Código',
    demo: 'Demo',
    
    // Skills
    technicalSkills: 'Habilidades Técnicas',
    skillsSubtitle: 'Tecnologías y herramientas que domino',
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Bases de Datos',
    devopsTools: 'DevOps & Tools',
    otherCompetencies: 'Otras Competencias',
    
    // Chat
    virtualAssistant: 'Asistente Virtual con RAG',
    chatDescription: 'Este chatbot utiliza tecnología RAG (Retrieval-Augmented Generation) para responder preguntas sobre mi experiencia, proyectos y habilidades. La información se recupera de una base de datos vectorial que contiene todo mi portfolio.',
    conversationalAI: '🤖 IA Conversacional',
    knowledgeBase: '📚 Base de Conocimiento',
    realtimeResponses: '⚡ Respuestas en tiempo real',
    
    // Contact
    contactTitle: 'Contacto',
    contactSubtitle: '¿Interesado en trabajar juntos? ¡Hablemos!',
    contactInfo: 'Información de Contacto',
    email: 'Email',
    sendMessage: 'Envíame un mensaje',
    name: 'Nombre',
    yourName: 'Tu nombre',
    yourEmail: 'tu@email.com',
    subject: 'Asunto',
    messageSubject: 'Asunto del mensaje',
    message: 'Mensaje',
    writeMessage: 'Escribe tu mensaje aquí...',
    sendButton: 'Enviar Mensaje',
    sending: 'Enviando...',
    messageSent: '✓ Mensaje enviado correctamente',
    messageError: '✗ Error al enviar. Intenta de nuevo',
    
    // Search
    searchPlaceholder: 'Buscar en todo el portfolio...',
    searchResultPlural: 'resultados encontrados',
    searchResultSingular: 'resultado encontrado',
    searchNoResults: 'No se encontraron resultados',
    
    // Chatbot
    chatbotWelcomeTitle: 'Asistente Virtual con IA',
    chatbotWelcomeDescription: 'Chat con IA ejecutándose localmente en tu navegador. Privado y seguro.',
    chatbotStartButton: 'Iniciar Chatbot',
    chatbotDownloadNote: 'Se descargará el modelo (~300MB). Puede tardar unos minutos.',
    chatbotResourceWarning: '⚠️ La ejecución local consume recursos del dispositivo y podría ralentizarlo durante su uso.',
    chatbotLoadingTitle: 'Cargando modelo de IA...',
    chatbotLoadingNote: 'Esto puede tardar unos minutos la primera vez. El modelo se descarga y ejecuta completamente en tu navegador.',
    chatbotErrorTitle: 'Error al cargar el modelo',
    chatbotErrorNote: 'Por favor, recarga la página o verifica que tu navegador soporte WebGPU.',
    chatbotWelcomeMessage: '¡Hola! Soy tu asistente virtual con IA ejecutándose localmente en tu navegador. Puedo responder preguntas sobre tecnología, desarrollo y mucho más. ¿En qué puedo ayudarte?',
    chatbotInputPlaceholder: 'Escribe tu pregunta...',
    chatbotErrorMessage: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
    chatLoading: 'Cargando chat...',
    
    // Sidebar
    sidebarExpandLabel: 'Expandir sidebar',
    sidebarCollapseLabel: 'Colapsar sidebar',
    
    // Skills - Additional Competencies
    skillAgileScrum: 'Agile/Scrum',
    skillRestApis: 'REST APIs',
    skillMicroservices: 'Microservicios',
    skillTesting: 'Testing',
    skillUIUX: 'UI/UX Design',
    skillResponsiveDesign: 'Responsive Design',
    skillPerformanceOptimization: 'Performance Optimization',
    skillSecurityBestPractices: 'Security Best Practices',
    skillTeamLeadership: 'Liderazgo',
    skillAutonomia: 'Autonomía',
  },
  en: {
    // Header
    dashboardPortfolio: 'Dashboard Portfolio',
    
    // Sidebar
    portfolio: 'Portfolio',
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    skills: 'Skills',
    chatbot: 'Chatbot',
    contact: 'Contact',
    
    // Home
    welcomeTitle: 'Xabier Cía Valencia',
    welcomeSubtitle: 'Full-Stack & AI Developer | Cloud Architecture',
    yearsExperience: 'Years of experience',
    projectsCompleted: 'Completed projects',
    satisfiedClients: 'Satisfied clients',
    techMastered: 'Mastered technologies',
    aboutDashboard: 'About this Dashboard',
    dashboardDescription: 'This portfolio is built with React and Vite, implementing a modern dashboard interface with support for light and dark themes. It includes an intelligent chatbot with RAG (Retrieval-Augmented Generation) to answer questions about my professional experience.',
    features: 'Features',
    modernDesign: '✨ Modern dashboard design',
    darkModeSupport: '🌓 Light/dark theme support',
    aiChatbot: '🤖 Integrated AI chatbot',
    responsiveDesign: '📱 Responsive design',
    viteOptimized: '⚡ Optimized with Vite',
    elegantInterface: '🎨 Intuitive and elegant interface',
    
    // About
    aboutMe: 'About Me',
    aboutDescription1: 'I am a curious and engaged person. I chose software engineering as a career because I was torn between too many fields—physics, biology, mathematics... And I felt that software engineering, due to its cross-cutting nature, would allow me to explore many areas and eventually discover what I was most passionate about in life.',
    aboutDescription2: 'My approach focuses on writing clean, maintainable, and scalable code, always seeking best practices and the latest trends in software development.',
    professionalExperience: 'Professional Experience',
    seniorFullStack: 'Full-Stack Developer',
    techCompany: 'Tracasa Instrumental | 2021 - Present',
    seniorDescription: 'Development of government applications using mainly .NET, Angular, React and T-SQL. Architecture implementation and project planning, integration of artificial intelligence systems.',
    fullStackDeveloper: 'Extracurricular Internship',
    startupTech: 'Veridas | 2020',
    fullStackDescription: 'Preparation of datasets to train facial recognition models. Design of mobile applications with Android Studio and Java.',
    juniorDeveloper: 'Extracurricular Internship',
    softwareAgency: 'Veridas | 2019',
    juniorDescription: 'Preparation of datasets to train facial recognition models.',
    education: 'Education',
    educationItems: [
      {
        degree: 'Master in Computer Engineering',
        institution: 'Public University of Navarre | 2021-2024',
        description: 'Generalist master covering contents that are outside the undergraduate degree.'
      },
      {
        degree: 'Computer Engineering',
        institution: 'Public University of Navarre | 2017-2021',
        description: 'Specialization in Computing and intelligent systems and in Information Technology.'
      }
    ],
    
    // Projects
    myProjects: 'My Projects',
    projectsSubtitle: 'A selection of projects I have worked on',
    ecommercePlatform: 'E-commerce Platform',
    ecommerceDescription: 'Complete e-commerce platform with shopping cart, payment gateway, and admin panel.',
    taskManagementApp: 'Task Management App',
    taskManagementDescription: 'Task management application with real-time collaboration features and notifications.',
    aiChatbotSystem: 'AI Chatbot System',
    aiChatbotDescription: 'Intelligent chatbot system with natural language processing and vector knowledge base.',
    analyticsDashboard: 'Analytics Dashboard',
    analyticsDashboardDescription: 'Real-time analytics dashboard with interactive visualizations and customizable reports.',
    code: 'Code',
    demo: 'Demo',
    
    // Skills
    technicalSkills: 'Technical Skills',
    skillsSubtitle: 'Technologies and tools I master',
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Databases',
    devopsTools: 'DevOps & Tools',
    otherCompetencies: 'Other Competencies',
    
    // Chat
    virtualAssistant: 'Virtual Assistant with RAG',
    chatDescription: 'This chatbot uses RAG (Retrieval-Augmented Generation) technology to answer questions about my experience, projects, and skills. Information is retrieved from a vector database containing my entire portfolio.',
    conversationalAI: '🤖 Conversational AI',
    knowledgeBase: '📚 Knowledge Base',
    realtimeResponses: '⚡ Real-time responses',
    
    // Contact
    contactTitle: 'Contact',
    contactSubtitle: 'Interested in working together? Let\'s talk!',
    contactInfo: 'Contact Information',
    email: 'Email',
    sendMessage: 'Send me a message',
    name: 'Name',
    yourName: 'Your name',
    yourEmail: 'your@email.com',
    subject: 'Subject',
    messageSubject: 'Message subject',
    message: 'Message',
    writeMessage: 'Write your message here...',
    sendButton: 'Send Message',
    sending: 'Sending...',
    messageSent: '✓ Message sent successfully',
    messageError: '✗ Error sending. Try again',
    
    // Search
    searchPlaceholder: 'Search across portfolio...',
    searchResultPlural: 'results found',
    searchResultSingular: 'result found',
    searchNoResults: 'No results found',
    
    // Chatbot
    chatbotWelcomeTitle: 'AI Virtual Assistant',
    chatbotWelcomeDescription: 'AI chat running locally in your browser. Private and secure.',
    chatbotStartButton: 'Start Chatbot',
    chatbotDownloadNote: 'The model will be downloaded (~300MB). It may take a few minutes.',
    chatbotResourceWarning: '⚠️ Local execution consumes device resources and may slow it down during use.',
    chatbotLoadingTitle: 'Loading AI model...',
    chatbotLoadingNote: 'This may take a few minutes the first time. The model is downloaded and runs completely in your browser.',
    chatbotErrorTitle: 'Error loading model',
    chatbotErrorNote: 'Please reload the page or verify that your browser supports WebGPU.',
    chatbotWelcomeMessage: 'Hello! I\'m your virtual assistant with AI running locally in your browser. I can answer questions about technology, development and much more. How can I help you?',
    chatbotInputPlaceholder: 'Type your question...',
    chatbotErrorMessage: 'Sorry, an error occurred. Please try again.',
    chatLoading: 'Loading chat...',
    
    // Sidebar
    sidebarExpandLabel: 'Expand sidebar',
    sidebarCollapseLabel: 'Collapse sidebar',
    
    // Skills - Additional Competencies
    skillAgileScrum: 'Agile/Scrum',
    skillRestApis: 'REST APIs',
    skillMicroservices: 'Microservices',
    skillTesting: 'Testing (Jest, Pytest)',
    skillUIUX: 'UI/UX Design',
    skillResponsiveDesign: 'Responsive Design',
    skillPerformanceOptimization: 'Performance Optimization',
    skillSecurityBestPractices: 'Security Best Practices',
    skillTeamLeadership: 'Team Leadership',
    skillAutonomia: 'Autonomy',
  },
} as const;

export const useTranslations = (language: Language) => {
  return useMemo(() => translations[language], [language]);
};
