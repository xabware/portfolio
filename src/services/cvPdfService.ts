import { jsPDF } from 'jspdf';
import type { Language } from '../contexts/LanguageContext';
import { getExperiences, getEducation } from '../data/about';
import { getSkillCategories, getAdditionalSkills } from '../data/skills';

interface CVLabels {
  role: string;
  experience: string;
  education: string;
  skills: string;
  additionalSkills: string;
  fileName: string;
}

const cvLabelsByLanguage: Record<Language, CVLabels> = {
  es: {
    role: 'Desarrollador Full-Stack e IA | Arquitectura Cloud',
    experience: 'Experiencia Profesional',
    education: 'Educacion',
    skills: 'Habilidades Tecnicas',
    additionalSkills: 'Competencias Adicionales',
    fileName: 'CV-Xabier-Cia-Valencia.pdf',
  },
  en: {
    role: 'Full-Stack & AI Developer | Cloud Architecture',
    experience: 'Professional Experience',
    education: 'Education',
    skills: 'Technical Skills',
    additionalSkills: 'Additional Skills',
    fileName: 'CV-Xabier-Cia-Valencia.pdf',
  },
};

const CONTACT_LINE = 'xabierciava@gmail.com | github.com/xabware | linkedin.com/in/xabier-cia-valencia-a7a097132';

interface PdfWriter {
  addSpacing: (space: number) => void;
  writeSectionTitle: (title: string) => void;
  writeSubTitle: (text: string) => void;
  writeBodyText: (text: string, indent?: number) => void;
  writeBullet: (text: string, indent?: number) => void;
}

function createPdfWriter(doc: jsPDF): PdfWriter {
  const margin = 15;
  const top = 20;
  const bottom = 285;
  const contentWidth = 180;
  const lineHeight = 5.6;

  let y = top;

  const addPageIfNeeded = (requiredSpace = lineHeight) => {
    if (y + requiredSpace > bottom) {
      doc.addPage();
      y = top;
    }
  };

  const writeWrappedText = (text: string, fontStyle: 'normal' | 'bold', fontSize: number, indent = 0) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);

    const maxWidth = contentWidth - indent;
    const lines = doc.splitTextToSize(text, maxWidth);
    const wrappedLines = Array.isArray(lines) ? lines : [lines];

    wrappedLines.forEach(line => {
      addPageIfNeeded(lineHeight);
      doc.text(String(line), margin + indent, y);
      y += lineHeight;
    });
  };

  return {
    addSpacing: (space: number) => {
      addPageIfNeeded(space);
      y += space;
    },
    writeSectionTitle: (title: string) => {
      addPageIfNeeded(8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(title, margin, y);
      y += 7;
    },
    writeSubTitle: (text: string) => {
      writeWrappedText(text, 'bold', 11);
    },
    writeBodyText: (text: string, indent = 0) => {
      writeWrappedText(text, 'normal', 10.5, indent);
    },
    writeBullet: (text: string, indent = 0) => {
      writeWrappedText(`- ${text}`, 'normal', 10.5, indent);
    },
  };
}

export function generateCVPdf(language: Language): void {
  const labels = cvLabelsByLanguage[language];
  const experiences = getExperiences(language);
  const education = getEducation(language);
  const skillCategories = getSkillCategories(language);
  const additionalSkills = getAdditionalSkills(language);

  const doc = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
  const writer = createPdfWriter(doc);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Xabier Cia Valencia', 15, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11.5);
  doc.text(labels.role, 15, 28);

  doc.setFontSize(9.8);
  doc.text(CONTACT_LINE, 15, 34);

  writer.addSpacing(20);

  writer.writeSectionTitle(labels.experience);
  experiences.forEach(exp => {
    writer.writeSubTitle(`${exp.title} - ${exp.company}`);
    if (exp.period) {
      writer.writeBodyText(exp.period, 2);
    }
    writer.writeBodyText(exp.description, 2);
    writer.addSpacing(3);
  });

  writer.writeSectionTitle(labels.education);
  education.forEach(item => {
    writer.writeSubTitle(`${item.degree} - ${item.institution}`);
    if (item.period) {
      writer.writeBodyText(item.period, 2);
    }
    writer.writeBodyText(item.description, 2);
    writer.addSpacing(3);
  });

  writer.writeSectionTitle(labels.skills);
  skillCategories.forEach(category => {
    const skillNames = category.skills.map(skill => skill.name).join(', ');
    writer.writeBodyText(`${category.title}: ${skillNames}`);
    writer.addSpacing(1.5);
  });

  writer.addSpacing(2);
  writer.writeSubTitle(labels.additionalSkills);
  writer.writeBodyText(additionalSkills.join(' | '), 2);

  doc.save(labels.fileName);
}
