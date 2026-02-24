/**
 * =====================================================
 * GENERADOR DE CONTEXTO DINÁMICO
 * =====================================================
 * 
 * Este archivo genera automáticamente:
 * 1. El contexto del chatbot basado en los datos reales
 * 2. El contenido indexable para la búsqueda
 * 
 * De esta forma, cuando actualices skills.ts, about.ts o projects.ts,
 * tanto el chatbot como la búsqueda tendrán la información actualizada.
 * =====================================================
 */

import type { Language } from '../contexts/LanguageContext';
import { getProjects } from './projects';
import { getSkillCategories, getAdditionalSkills } from './skills';
import { getPersonalInfo, getExperiences, getEducation } from './about';

const paragraphsToText = (paragraphs: readonly string[]) => paragraphs.join(' ');

/**
 * Interfaz para contenido searchable
 */
export interface SearchableItem {
  section: string;
  title: string;
  content: string;
  projectId?: number;
}

/**
 * Genera el contexto del desarrollador para el chatbot
 * Construye dinámicamente la información desde los datos reales
 */
export function generateDeveloperContext(language: Language = 'es') {
  const projects = getProjects(language);
  const skillCategories = getSkillCategories(language);
  const additionalSkills = getAdditionalSkills(language);
  const personalInfo = getPersonalInfo(language);
  const experiences = getExperiences(language);
  const education = getEducation(language);

  // Construir información sobre proyectos
  const projectsInfo = projects.map(p => ({
    nombre: p.title,
    descripcion: p.description,
    tecnologias: p.tech,
    detalles: {
      overview: p.detailedContent.overview,
      challenge: p.detailedContent.challenge,
      solution: p.detailedContent.solution,
      features: p.detailedContent.features,
      results: p.detailedContent.results,
    }
  }));

  // Construir información sobre habilidades por categoría
  const skillsByCategory = skillCategories.reduce((acc, category) => {
    acc[category.title] = category.skills.map(s => s.name);
    return acc;
  }, {} as Record<string, string[]>);

  return {
    personalInfo,
    experiences,
    education,
    skills: {
      categories: skillsByCategory,
      additional: additionalSkills,
    },
    projects: projectsInfo,
  };
}

/**
 * Genera el system prompt para el chatbot usando los datos reales
 */
export function generateSystemPrompt(language: Language = 'es'): string {
  const context = generateDeveloperContext(language);
  
  if (language === 'es') {
    return `Eres Xabier Cía Valencia, un desarrollador Full-Stack y especialista en IA. Responderás a las preguntas en primera persona, como si fueras el propio desarrollador hablando sobre ti mismo.

INFORMACIÓN PERSONAL:
${context.personalInfo.join('\n')}

EXPERIENCIA LABORAL:
${context.experiences.map((exp, i) => 
  `${i + 1}. ${exp.title} en ${exp.company} ${exp.period ? `(${exp.period})` : ''}
   ${exp.description}`
).join('\n\n')}

EDUCACIÓN:
${context.education.map((edu, i) => 
  `${i + 1}. ${edu.degree} - ${edu.institution} ${edu.period ? `(${edu.period})` : ''}
   ${edu.description}`
).join('\n\n')}

HABILIDADES TÉCNICAS:
${Object.entries(context.skills.categories).map(([category, skills]) => 
  `- ${category}: ${skills.join(', ')}`
).join('\n')}

OTRAS COMPETENCIAS:
${context.skills.additional.join(', ')}

PROYECTOS DESTACADOS:
${context.projects.map((p, i) => 
  `${i + 1}. ${p.nombre}
   Descripción: ${p.descripcion}
   Tecnologías: ${p.tecnologias.join(', ')}
  Overview: ${paragraphsToText(p.detalles.overview).substring(0, 200)}...`
).join('\n\n')}

INSTRUCCIONES:
1. Responde SIEMPRE en primera persona (yo, mi, me)
2. Sé profesional pero cercano y amigable
3. Si te preguntan algo que no sabes sobre ti, di que no tienes esa información disponible
4. Mantén las respuestas concisas pero informativas (2-4 oraciones normalmente)
5. Si te preguntan por contacto, menciona que pueden enviar un mensaje desde la sección de contacto del portfolio
6. Responde en español a menos que te hablen en otro idioma
7. Si te preguntan sobre proyectos específicos, puedes dar detalles técnicos
8. Si te preguntan sobre habilidades, menciona tu nivel de experiencia y proyectos donde las has usado`;
  } else {
    return `You are Xabier Cía Valencia, a Full-Stack developer and AI specialist. You will answer questions in first person, as if you were the developer himself talking about yourself.

PERSONAL INFORMATION:
${context.personalInfo.join('\n')}

WORK EXPERIENCE:
${context.experiences.map((exp, i) => 
  `${i + 1}. ${exp.title} at ${exp.company} ${exp.period ? `(${exp.period})` : ''}
   ${exp.description}`
).join('\n\n')}

EDUCATION:
${context.education.map((edu, i) => 
  `${i + 1}. ${edu.degree} - ${edu.institution} ${edu.period ? `(${edu.period})` : ''}
   ${edu.description}`
).join('\n\n')}

TECHNICAL SKILLS:
${Object.entries(context.skills.categories).map(([category, skills]) => 
  `- ${category}: ${skills.join(', ')}`
).join('\n')}

OTHER COMPETENCIES:
${context.skills.additional.join(', ')}

FEATURED PROJECTS:
${context.projects.map((p, i) => 
  `${i + 1}. ${p.nombre}
   Description: ${p.descripcion}
   Technologies: ${p.tecnologias.join(', ')}
  Overview: ${paragraphsToText(p.detalles.overview).substring(0, 200)}...`
).join('\n\n')}

INSTRUCTIONS:
1. ALWAYS respond in first person (I, my, me)
2. Be professional but friendly and approachable
3. If asked about something you don't know about yourself, say you don't have that information available
4. Keep responses concise but informative (2-4 sentences normally)
5. If asked about contact, mention they can send a message from the contact section of the portfolio
6. Respond in English unless spoken to in another language
7. If asked about specific projects, you can give technical details
8. If asked about skills, mention your level of experience and projects where you used them`;
  }
}

/**
 * Genera un system prompt ligero para el modo RAG.
 * No incluye datos personales del portfolio — el LLM solo responde
 * usando las fuentes del documento proporcionado.
 */
export function generateRAGSystemPrompt(language: Language = 'es'): string {
  if (language === 'es') {
    return `Eres un asistente de documentos. Tu tarea es responder a las preguntas del usuario usando EXCLUSIVAMENTE la información de las fuentes proporcionadas.

INSTRUCCIONES:
1. Responde de forma clara, precisa y detallada usando solo la información del documento
2. NO inventes información que no esté en las fuentes
3. Si la información no está en el documento, indícalo claramente
4. NO incluyas marcadores de referencia como [1] o [2] en tu respuesta; el sistema los añadirá automáticamente
5. Responde en español a menos que te hablen en otro idioma
6. Responde siempre a la pregunta que hace el usuario, cita información del texto solo aclarando que es una cita en el contexto de tu respuesta`;
  } else {
    return `You are a document assistant. Your task is to answer the user's questions using EXCLUSIVELY the information from the provided sources.

INSTRUCTIONS:
1. Answer clearly, precisely and in detail using only the document information
2. Do NOT make up information that is not in the sources
3. If the information is not in the document, clearly state so
4. Do NOT include reference markers like [1] or [2] in your response; the system will add them automatically
5. Respond in English unless spoken to in another language
6. Always answer the user's question, cite information from the text only clarifying that it is a quote in the context of your answer`;
  }
}

/**
 * Genera el contenido indexable para la búsqueda
 * Este contenido se construye dinámicamente desde los datos reales
 */
export function generateSearchableContent(language: Language, translations: Record<string, string | string[]>): SearchableItem[] {
  const projects = getProjects(language);
  const skillCategories = getSkillCategories(language);
  const additionalSkills = getAdditionalSkills(language);
  const personalInfo = getPersonalInfo(language);
  const experiences = getExperiences(language);
  const education = getEducation(language);

  // Helper para convertir a string de forma segura
  const toStr = (val: string | string[] | undefined): string => {
    if (!val) return '';
    return Array.isArray(val) ? val.join(' ') : val;
  };

  // Construir contenido searchable por sección
  const content: SearchableItem[] = [];

  // About - con información real
  const aboutContent = [
    toStr(translations.aboutMe),
    ...personalInfo,
    ...experiences.map(exp => `${exp.title} ${exp.company} ${exp.description}`),
    ...education.map(edu => `${edu.degree} ${edu.institution} ${edu.description}`),
    'desarrollador', 'full-stack', 'developer'
  ].join(' ');

  content.push({
    section: 'about',
    title: toStr(translations.about),
    content: aboutContent,
  });

  // Projects - con proyectos reales
  const projectsContent = [
    toStr(translations.myProjects),
    toStr(translations.projectsSubtitle),
    ...projects.map(p => `${p.title} ${p.description} ${p.tech.join(' ')}`),
    'portfolio', 'proyecto', 'project'
  ].join(' ');

  content.push({
    section: 'projects',
    title: toStr(translations.projects),
    content: projectsContent,
  });

  // Projects individuales - cada proyecto es searchable
  projects.forEach(project => {
    content.push({
      section: 'projects',
      title: project.title,
      content: `${project.title} ${project.description} ${project.detailedContent.overview.join(' ')} ${project.tech.join(' ')}`,
      projectId: project.id,
    });
  });

  // Skills - con habilidades reales
  const skillsContent = [
    toStr(translations.technicalSkills),
    toStr(translations.skillsSubtitle),
    ...skillCategories.map(cat => `${cat.title} ${cat.skills.map(s => s.name).join(' ')}`),
    ...additionalSkills,
    'habilidades', 'skills', 'tecnologías', 'technologies'
  ].join(' ');

  content.push({
    section: 'skills',
    title: toStr(translations.skills),
    content: skillsContent,
  });

  // Home
  content.push({
    section: 'home',
    title: toStr(translations.home),
    content: `${toStr(translations.welcomeTitle)} ${toStr(translations.welcomeSubtitle)} ${toStr(translations.yearsExperience)} ${toStr(translations.projectsCompleted)} ${toStr(translations.aboutDashboard)} ${toStr(translations.dashboardDescription)}`,
  });

  // Chat
  content.push({
    section: 'chat',
    title: toStr(translations.chatbot),
    content: `${toStr(translations.virtualAssistant)} ${toStr(translations.chatDescription)} ${toStr(translations.conversationalAI)} chatbot asistente inteligencia artificial AI`,
  });

  // Contact
  content.push({
    section: 'contact',
    title: toStr(translations.contact),
    content: `${toStr(translations.contactTitle)} ${toStr(translations.contactSubtitle)} ${toStr(translations.email)} ${toStr(translations.sendMessage)} contacto mensaje contact`,
  });

  return content;
}

/**
 * Obtiene un resumen de estadísticas del portfolio
 */
export function getPortfolioStats(language: Language) {
  const projects = getProjects(language);
  const skillCategories = getSkillCategories(language);
  const additionalSkills = getAdditionalSkills(language);
  const experiences = getExperiences(language);

  const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);
  
  // Calcular años de experiencia desde la primera experiencia
  const yearsOfExperience = experiences.length > 0 ? 
    new Date().getFullYear() - parseInt(experiences[experiences.length - 1].period?.split('-')[0] || '2019') : 0;

  return {
    totalProjects: projects.length,
    totalSkills: totalSkills + additionalSkills.length,
    yearsOfExperience,
    totalExperiences: experiences.length,
  };
}
