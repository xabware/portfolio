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
    welcomeTitle: 'Bienvenido a mi Portfolio',
    welcomeSubtitle: 'Desarrollador Full-Stack | Especialista en React & Node.js',
    yearsExperience: 'Años de experiencia',
    projectsCompleted: 'Proyectos completados',
    satisfiedClients: 'Clientes satisfechos',
    techMastered: 'Tecnologías dominadas',
    aboutDashboard: 'Sobre este Dashboard',
    dashboardDescription: 'Este portfolio está construido con React y Vite, implementando una interfaz moderna de dashboard con soporte para temas claro y oscuro. Incluye un chatbot inteligente con RAG (Retrieval-Augmented Generation) para responder preguntas sobre mi experiencia profesional.',
    features: 'Características',
    modernDesign: '✨ Diseño moderno tipo dashboard',
    darkModeSupport: '🌓 Soporte para tema claro/oscuro',
    aiChatbot: '🤖 Chatbot con IA integrada',
    responsiveDesign: '📱 Diseño responsive',
    viteOptimized: '⚡ Optimizado con Vite',
    elegantInterface: '🎨 Interfaz intuitiva y elegante',
    
    // About
    aboutMe: 'Sobre mí',
    aboutDescription1: 'Soy un desarrollador full-stack apasionado por crear soluciones innovadoras y eficientes. Con más de 5 años de experiencia en el desarrollo web, me especializo en tecnologías modernas como React, Node.js, y bases de datos tanto relacionales como NoSQL.',
    aboutDescription2: 'Mi enfoque se centra en escribir código limpio, mantenible y escalable, siempre buscando las mejores prácticas y las últimas tendencias en desarrollo de software.',
    professionalExperience: 'Experiencia Profesional',
    seniorFullStack: 'Senior Full-Stack Developer',
    techCompany: 'Tech Company | 2022 - Presente',
    seniorDescription: 'Desarrollo de aplicaciones empresariales utilizando React, Node.js y microservicios. Implementación de arquitecturas escalables y sistemas distribuidos.',
    fullStackDeveloper: 'Full-Stack Developer',
    startupTech: 'Startup Tech | 2020 - 2022',
    fullStackDescription: 'Desarrollo de MVP y productos desde cero. Trabajo con equipos ágiles y metodologías modernas de desarrollo.',
    juniorDeveloper: 'Junior Developer',
    softwareAgency: 'Software Agency | 2019 - 2020',
    juniorDescription: 'Desarrollo frontend y backend de aplicaciones web. Aprendizaje de mejores prácticas y trabajo en equipo.',
    education: 'Educación',
    degree: 'Ingeniería en Sistemas Computacionales',
    university: 'Universidad Tecnológica | 2015 - 2019',
    degreeDescription: 'Especialización en desarrollo de software y sistemas distribuidos.',
    
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
    skillGraphQL: 'GraphQL',
    skillMicroservices: 'Microservicios',
    skillTesting: 'Testing (Jest, Pytest)',
    skillUIUX: 'UI/UX Design',
    skillResponsiveDesign: 'Responsive Design',
    skillPerformanceOptimization: 'Performance Optimization',
    skillSecurityBestPractices: 'Security Best Practices',
    skillTeamLeadership: 'Team Leadership',
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
    welcomeTitle: 'Welcome to my Portfolio',
    welcomeSubtitle: 'Full-Stack Developer | React & Node.js Specialist',
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
    aboutDescription1: 'I am a full-stack developer passionate about creating innovative and efficient solutions. With over 5 years of experience in web development, I specialize in modern technologies such as React, Node.js, and both relational and NoSQL databases.',
    aboutDescription2: 'My approach focuses on writing clean, maintainable, and scalable code, always seeking best practices and the latest trends in software development.',
    professionalExperience: 'Professional Experience',
    seniorFullStack: 'Senior Full-Stack Developer',
    techCompany: 'Tech Company | 2022 - Present',
    seniorDescription: 'Development of enterprise applications using React, Node.js, and microservices. Implementation of scalable architectures and distributed systems.',
    fullStackDeveloper: 'Full-Stack Developer',
    startupTech: 'Startup Tech | 2020 - 2022',
    fullStackDescription: 'Development of MVPs and products from scratch. Work with agile teams and modern development methodologies.',
    juniorDeveloper: 'Junior Developer',
    softwareAgency: 'Software Agency | 2019 - 2020',
    juniorDescription: 'Frontend and backend development of web applications. Learning best practices and teamwork.',
    education: 'Education',
    degree: 'Computer Systems Engineering',
    university: 'Technological University | 2015 - 2019',
    degreeDescription: 'Specialization in software development and distributed systems.',
    
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
    skillGraphQL: 'GraphQL',
    skillMicroservices: 'Microservices',
    skillTesting: 'Testing (Jest, Pytest)',
    skillUIUX: 'UI/UX Design',
    skillResponsiveDesign: 'Responsive Design',
    skillPerformanceOptimization: 'Performance Optimization',
    skillSecurityBestPractices: 'Security Best Practices',
    skillTeamLeadership: 'Team Leadership',
  },
};

export const useTranslations = (language: Language) => {
  return translations[language];
};
