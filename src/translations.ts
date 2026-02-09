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
    portfolioProject: 'Plantilla para portfolio',
    portfolioDescription: 'Plantilla para generar un portfolio personalizado (esta misma web)',
    taskManagementApp: 'Mapa procedural',
    taskManagementDescription: 'Aplicacion de generación de mapas procedurales',
    aiChatbotSystem: 'Medidor de raices',
    aiChatbotDescription: 'Sistema de medicion de raices con segmentacion de instancias incorporada y técnicas de visión artificial.',
    analyticsDashboard: 'Analytics Dashboard',
    analyticsDashboardDescription: 'Dashboard de analíticas en tiempo real con visualizaciones interactivas y reportes personalizables.',
    code: 'Código',
    demo: 'Demo',
    learnMore: 'Leer más',
    close: 'Cerrar',
    viewCode: 'Ver Código',
    viewDemo: 'Ver Demo',
    projectOverview: 'Descripción General',
    projectChallenge: 'El Desafío',
    projectSolution: 'La Solución',
    keyFeatures: 'Características Principales',
    technicalDetails: 'Detalles Técnicos',
    resultsImpact: 'Resultados e Impacto',
    
    // Project Details
    project1Details: {
      overview: 'Este proyecto consiste en una plataforma completa de e-commerce que permite a los usuarios navegar, buscar y comprar productos en línea. La plataforma incluye un sistema de gestión de inventario, procesamiento de pagos seguro y un panel de administración completo.',
      challenge: 'El principal desafío fue crear una experiencia de compra fluida y segura que pudiera escalar para manejar miles de transacciones simultáneas, mientras se mantiene un rendimiento óptimo y se protegen los datos sensibles de los usuarios.',
      solution: 'Implementamos una arquitectura basada en microservicios utilizando React para el frontend y Node.js para el backend. Integramos Stripe para procesamiento de pagos seguro y MongoDB para gestión flexible de datos. El sistema incluye caching inteligente y optimización de consultas para mejorar el rendimiento.',
      features: [
        'Carrito de compras en tiempo real con actualización automática',
        'Sistema de búsqueda y filtrado avanzado de productos',
        'Procesamiento de pagos seguro con Stripe',
        'Panel de administración con analíticas en tiempo real',
        'Sistema de gestión de inventario automatizado',
        'Notificaciones de email y push para usuarios'
      ],
      techDetails: 'La aplicación utiliza React con hooks personalizados para gestión de estado, React Query para manejo de datos del servidor, y Tailwind CSS para estilos. El backend está construido con Express.js, implementando autenticación JWT y rate limiting para seguridad. MongoDB Atlas se utiliza como base de datos con índices optimizados para búsquedas rápidas.',
      results: 'La plataforma maneja actualmente más de 10,000 usuarios activos mensuales con un tiempo de carga promedio de menos de 2 segundos. La tasa de conversión aumentó un 35% después del lanzamiento, y el sistema ha procesado más de $500,000 en transacciones sin incidentes de seguridad.',
      date: '2023 - 2024',
      team: 'Equipo de 4 desarrolladores'
    },
    
    project2Details: {
      overview: 'Aplicación web de gestión de tareas diseñada para equipos remotos que necesitan colaborar eficientemente. Incluye funciones de asignación de tareas, seguimiento de progreso, y comunicación en tiempo real.',
      challenge: 'Crear una herramienta intuitiva que facilite la colaboración entre equipos distribuidos globalmente, con sincronización en tiempo real y offline support para usuarios con conectividad intermitente.',
      solution: 'Desarrollamos una Progressive Web App (PWA) usando React y Firebase Realtime Database para sincronización instantánea. Implementamos service workers para funcionalidad offline y notificaciones push para mantener a los equipos informados.',
      features: [
        'Colaboración en tiempo real entre múltiples usuarios',
        'Sistema de notificaciones push y por email',
        'Funcionalidad offline con sincronización automática',
        'Tableros Kanban personalizables',
        'Integración con calendario y recordatorios',
        'Comentarios y adjuntos en tareas'
      ],
      techDetails: 'Construida con React y Material-UI para una interfaz moderna y responsiva. Firebase Authentication maneja la seguridad de usuarios, mientras que Firestore proporciona una base de datos NoSQL escalable. Las notificaciones se gestionan a través de Firebase Cloud Messaging.',
      results: 'Más de 5,000 equipos utilizan la aplicación diariamente. El tiempo promedio de respuesta a tareas se redujo en un 40%, y la satisfacción del usuario alcanzó un 4.7/5. La aplicación mantiene un 99.9% de uptime.',
      date: '2023',
      team: 'Proyecto personal'
    },
    
    project3Details: {
      overview: 'Sistema de chatbot inteligente que utiliza procesamiento de lenguaje natural y una base de conocimiento vectorial para proporcionar respuestas contextuales y precisas a consultas de usuarios.',
      challenge: 'Desarrollar un chatbot que pueda comprender el contexto de las conversaciones, aprender de interacciones pasadas y proporcionar respuestas relevantes utilizando una base de conocimiento dinámica.',
      solution: 'Implementamos un sistema RAG (Retrieval-Augmented Generation) utilizando embeddings de OpenAI y Pinecone como base de datos vectorial. El backend en FastAPI procesa las consultas, recupera información relevante y genera respuestas contextualizadas.',
      features: [
        'Comprensión de lenguaje natural con modelos GPT',
        'Base de conocimiento vectorial para búsqueda semántica',
        'Memoria de conversación para contexto',
        'Respuestas en múltiples idiomas',
        'Integración con APIs externas para datos en tiempo real',
        'Panel de analíticas para métricas de uso'
      ],
      techDetails: 'El sistema utiliza Python con FastAPI para el backend, OpenAI GPT-4 para generación de texto, y Pinecone para almacenamiento y búsqueda vectorial. Implementamos rate limiting y caché de embeddings para optimizar costos. El frontend está construido con React y incluye syntax highlighting para respuestas técnicas.',
      results: 'El chatbot responde a más de 1,000 consultas diarias con una tasa de satisfacción del 85%. El tiempo promedio de respuesta es de 2 segundos, y el sistema reduce la carga del soporte humano en un 60%.',
      date: '2024',
      team: 'Equipo de 2 desarrolladores'
    },
    
    project4Details: {
      overview: 'Dashboard de analíticas en tiempo real que permite a las empresas visualizar y analizar sus datos de negocio con gráficos interactivos y reportes personalizables.',
      challenge: 'Procesar y visualizar grandes volúmenes de datos en tiempo real mientras se mantiene una interfaz fluida y responsiva, permitiendo a los usuarios crear reportes personalizados sin conocimientos técnicos.',
      solution: 'Creamos un dashboard usando React con D3.js para visualizaciones avanzadas. El backend en Express.js se conecta a PostgreSQL con consultas optimizadas y agregaciones. Implementamos WebSockets para actualizaciones en tiempo real.',
      features: [
        'Visualizaciones interactivas con D3.js',
        'Actualización de datos en tiempo real',
        'Reportes personalizables con drag-and-drop',
        'Exportación a PDF y Excel',
        'Alertas automáticas basadas en métricas',
        'Dashboards compartibles con permisos granulares'
      ],
      techDetails: 'El stack incluye React con Redux para gestión de estado complejo, D3.js para gráficos personalizados, y Chart.js para gráficos estándar. PostgreSQL con índices B-tree y materialized views optimiza las consultas. El sistema incluye worker threads para procesamiento de datos pesados sin bloquear la UI.',
      results: 'El dashboard procesa más de 1 millón de puntos de datos diarios con actualizaciones cada 5 segundos. Los usuarios reportan una reducción del 70% en el tiempo dedicado a análisis de datos. La plataforma es utilizada por más de 200 empresas.',
      date: '2023 - 2024',
      team: 'Equipo de 5 desarrolladores'
    },
    
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
    chatbotWelcomeDescription: 'Chat con IA ejecutándose localmente en tu navegador. Pregúntame sobre mi experiencia, proyectos y habilidades.',
    chatbotStartButton: 'Iniciar Chatbot',
    chatbotDownloadNote: '- Se descargará el modelo. Puede tardar unos minutos.',
    chatbotResourceWarning: '⚠️ La ejecución local consume recursos del dispositivo y podría ralentizarlo durante su uso.',
    chatbotLoadingTitle: 'Cargando modelo de IA...',
    chatbotLoadingNote: 'Esto puede tardar unos minutos la primera vez. El modelo se descarga y ejecuta completamente en tu navegador.',
    chatbotErrorTitle: 'Error al cargar el modelo',
    chatbotErrorNote: 'Por favor, recarga la página o verifica que tu navegador soporte WebGPU.',
    chatbotWelcomeMessage: '¡Hola! Soy Xabier, o al menos una IA entrenada para responder como él. Puedo contarte sobre mi experiencia profesional, proyectos y habilidades técnicas. ¿En qué puedo ayudarte?',
    chatbotInputPlaceholder: 'Escribe tu pregunta...',
    chatbotErrorMessage: 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.',
    chatLoading: 'Cargando chat...',
    chatbotSelectModel: 'Selecciona el modelo de IA',
    chatbotModelSmall: 'Ligero',
    chatbotModelMedium: 'Medio',
    chatbotModelLarge: 'Potente',
    chatbotRecommended: 'Recomendado',
    chatbotModelSize: 'Tamaño',
    chatbotDetectingGPU: 'Detectando GPU...',
    chatbotDedicatedGPU: 'GPU dedicada',
    chatbotIntegratedGPU: 'GPU integrada',
    chatbotIncompatible: 'No compatible',
    chatbotMayNotWork: 'Puede fallar',
    chatbotRequiresDedicated: 'Requiere GPU dedicada',
    
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
    portfolioProject: 'Plantilla para portfolio',
    portfolioDescription: 'Plantilla para generar un portfolio personalizado (esta misma web)',
    taskManagementApp: 'Task Management App',
    taskManagementDescription: 'Task management application with real-time collaboration features and notifications.',
    aiChatbotSystem: 'AI Chatbot System',
    aiChatbotDescription: 'Intelligent chatbot system with natural language processing and vector knowledge base.',
    analyticsDashboard: 'Analytics Dashboard',
    analyticsDashboardDescription: 'Real-time analytics dashboard with interactive visualizations and customizable reports.',
    code: 'Code',
    demo: 'Demo',
    learnMore: 'Learn More',
    close: 'Close',
    viewCode: 'View Code',
    viewDemo: 'View Demo',
    projectOverview: 'Overview',
    projectChallenge: 'The Challenge',
    projectSolution: 'The Solution',
    keyFeatures: 'Key Features',
    technicalDetails: 'Technical Details',
    resultsImpact: 'Results & Impact',
    
    // Project Details
    project1Details: {
      overview: 'This project consists of a complete e-commerce platform that allows users to browse, search, and purchase products online. The platform includes an inventory management system, secure payment processing, and a comprehensive admin panel.',
      challenge: 'The main challenge was to create a smooth and secure shopping experience that could scale to handle thousands of simultaneous transactions, while maintaining optimal performance and protecting sensitive user data.',
      solution: 'We implemented a microservices-based architecture using React for the frontend and Node.js for the backend. We integrated Stripe for secure payment processing and MongoDB for flexible data management. The system includes intelligent caching and query optimization to improve performance.',
      features: [
        'Real-time shopping cart with automatic updates',
        'Advanced product search and filtering system',
        'Secure payment processing with Stripe',
        'Admin panel with real-time analytics',
        'Automated inventory management system',
        'Email and push notifications for users'
      ],
      techDetails: 'The application uses React with custom hooks for state management, React Query for server data handling, and Tailwind CSS for styling. The backend is built with Express.js, implementing JWT authentication and rate limiting for security. MongoDB Atlas is used as the database with optimized indexes for fast searches.',
      results: 'The platform currently handles over 10,000 monthly active users with an average load time of less than 2 seconds. The conversion rate increased by 35% after launch, and the system has processed over $500,000 in transactions without security incidents.',
      date: '2023 - 2024',
      team: 'Team of 4 developers'
    },
    
    project2Details: {
      overview: 'Web-based task management application designed for remote teams that need to collaborate efficiently. It includes task assignment features, progress tracking, and real-time communication.',
      challenge: 'Create an intuitive tool that facilitates collaboration between globally distributed teams, with real-time synchronization and offline support for users with intermittent connectivity.',
      solution: 'We developed a Progressive Web App (PWA) using React and Firebase Realtime Database for instant synchronization. We implemented service workers for offline functionality and push notifications to keep teams informed.',
      features: [
        'Real-time collaboration between multiple users',
        'Push and email notification system',
        'Offline functionality with automatic sync',
        'Customizable Kanban boards',
        'Calendar integration and reminders',
        'Comments and attachments on tasks'
      ],
      techDetails: 'Built with React and Material-UI for a modern and responsive interface. Firebase Authentication handles user security, while Firestore provides a scalable NoSQL database. Notifications are managed through Firebase Cloud Messaging.',
      results: 'Over 5,000 teams use the application daily. The average task response time was reduced by 40%, and user satisfaction reached 4.7/5. The application maintains 99.9% uptime.',
      date: '2023',
      team: 'Personal project'
    },
    
    project3Details: {
      overview: 'Intelligent chatbot system that uses natural language processing and a vector knowledge base to provide contextual and accurate responses to user queries.',
      challenge: 'Develop a chatbot that can understand conversation context, learn from past interactions, and provide relevant answers using a dynamic knowledge base.',
      solution: 'We implemented a RAG (Retrieval-Augmented Generation) system using OpenAI embeddings and Pinecone as a vector database. The FastAPI backend processes queries, retrieves relevant information, and generates contextualized responses.',
      features: [
        'Natural language understanding with GPT models',
        'Vector knowledge base for semantic search',
        'Conversation memory for context',
        'Responses in multiple languages',
        'Integration with external APIs for real-time data',
        'Analytics panel for usage metrics'
      ],
      techDetails: 'The system uses Python with FastAPI for the backend, OpenAI GPT-4 for text generation, and Pinecone for vector storage and search. We implemented rate limiting and embedding caching to optimize costs. The frontend is built with React and includes syntax highlighting for technical responses.',
      results: 'The chatbot responds to over 1,000 daily queries with an 85% satisfaction rate. The average response time is 2 seconds, and the system reduces human support load by 60%.',
      date: '2024',
      team: 'Team of 2 developers'
    },
    
    project4Details: {
      overview: 'Real-time analytics dashboard that allows businesses to visualize and analyze their business data with interactive charts and customizable reports.',
      challenge: 'Process and visualize large volumes of data in real-time while maintaining a smooth and responsive interface, allowing users to create custom reports without technical knowledge.',
      solution: 'We created a dashboard using React with D3.js for advanced visualizations. The Express.js backend connects to PostgreSQL with optimized queries and aggregations. We implemented WebSockets for real-time updates.',
      features: [
        'Interactive visualizations with D3.js',
        'Real-time data updates',
        'Customizable reports with drag-and-drop',
        'Export to PDF and Excel',
        'Automatic alerts based on metrics',
        'Shareable dashboards with granular permissions'
      ],
      techDetails: 'The stack includes React with Redux for complex state management, D3.js for custom charts, and Chart.js for standard charts. PostgreSQL with B-tree indexes and materialized views optimizes queries. The system includes worker threads for heavy data processing without blocking the UI.',
      results: 'The dashboard processes over 1 million data points daily with updates every 5 seconds. Users report a 70% reduction in time spent on data analysis. The platform is used by over 200 companies.',
      date: '2023 - 2024',
      team: 'Team of 5 developers'
    },
    
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
    chatbotWelcomeDescription: 'AI chat running locally in your browser. Ask me about my experience, projects and skills.',
    chatbotStartButton: 'Start Chatbot',
    chatbotDownloadNote: '- Model will be downloaded. It may take a few minutes.',
    chatbotResourceWarning: '⚠️ Local execution consumes device resources and may slow it down during use.',
    chatbotLoadingTitle: 'Loading AI model...',
    chatbotLoadingNote: 'This may take a few minutes the first time. The model is downloaded and runs completely in your browser.',
    chatbotErrorTitle: 'Error loading model',
    chatbotErrorNote: 'Please reload the page or verify that your browser supports WebGPU.',
    chatbotWelcomeMessage: 'Hello! I\'m Xabier, or at least an AI trained to answer as him. I can tell you about my professional experience, projects and technical skills. How can I help you?',
    chatbotInputPlaceholder: 'Type your question...',
    chatbotErrorMessage: 'Sorry, an error occurred. Please try again.',
    chatLoading: 'Loading chat...',
    chatbotSelectModel: 'Select AI model',
    chatbotModelSmall: 'Light',
    chatbotModelMedium: 'Medium',
    chatbotModelLarge: 'Powerful',
    chatbotRecommended: 'Recommended',
    chatbotModelSize: 'Size',
    chatbotDetectingGPU: 'Detecting GPU...',
    chatbotDedicatedGPU: 'Dedicated GPU',
    chatbotIntegratedGPU: 'Integrated GPU',
    chatbotIncompatible: 'Not compatible',
    chatbotMayNotWork: 'May fail',
    chatbotRequiresDedicated: 'Requires dedicated GPU',
    
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
