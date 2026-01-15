import Card from '../Card';
import { ExternalLink, Github } from 'lucide-react';
import './Projects.css';

const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description:
        'Plataforma de comercio electrónico completa con carrito de compras, pasarela de pago y panel de administración.',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 2,
      title: 'Task Management App',
      description:
        'Aplicación de gestión de tareas con funciones de colaboración en tiempo real y notificaciones.',
      tech: ['React', 'Firebase', 'Material-UI'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 3,
      title: 'AI Chatbot System',
      description:
        'Sistema de chatbot inteligente con procesamiento de lenguaje natural y base de conocimiento vectorial.',
      tech: ['Python', 'FastAPI', 'OpenAI', 'Pinecone'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
    {
      id: 4,
      title: 'Analytics Dashboard',
      description:
        'Dashboard de analíticas en tiempo real con visualizaciones interactivas y reportes personalizables.',
      tech: ['React', 'D3.js', 'Express', 'PostgreSQL'],
      github: 'https://github.com',
      demo: 'https://demo.com',
    },
  ];

  return (
    <div className="section-content">
      <div className="projects-header">
        <h2>Mis Proyectos</h2>
        <p>Una selección de proyectos en los que he trabajado</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <Card key={project.id} className="project-card">
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            <div className="project-tech">
              {project.tech.map((tech, index) => (
                <span key={index} className="tech-tag">
                  {tech}
                </span>
              ))}
            </div>
            <div className="project-links">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github size={18} />
                Código
              </a>
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} />
                Demo
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Projects;
