# Guía de Configuración de Datos del Portfolio

Esta carpeta contiene todos los datos configurables de tu portfolio. Editar estos archivos te permite actualizar fácilmente el contenido sin tocar el código de los componentes.

## 📁 Archivos disponibles

### `projects.ts`
Contiene todos tus proyectos con información detallada.

**Cómo añadir un proyecto:**
1. Copia la plantilla que está al inicio del archivo
2. Asigna un ID único (usa `getNextProjectId()` como referencia)
3. Rellena los campos en español e inglés
4. Añade el objeto al array `projects`

**Estructura:**
- `title`: Título del proyecto (es/en)
- `description`: Descripción corta (es/en)
- `tech`: Array de tecnologías usadas
- `github`: URL del repositorio
- `demo`: URL de la demo
- `details`: Información detallada del proyecto (es/en)
  - `overview`: Visión general
  - `challenge`: Desafío que resolviste
  - `solution`: Cómo lo resolviste
  - `features`: Array de características
  - `techDetails`: Detalles técnicos
  - `results`: Resultados e impacto
  - `date`: Fecha o período
  - `team`: Tipo de proyecto (personal, equipo, etc.)

---

### `skills.ts`
Contiene todas tus habilidades organizadas por categorías.

**Cómo añadir una categoría de habilidades:**
1. Añade un nuevo objeto al array `skillCategories`
2. Define el título de la categoría en ambos idiomas
3. Añade las habilidades con sus niveles (0-100)

**Estructura de categoría:**
```typescript
{
  title: {
    es: 'Nombre de la Categoría',
    en: 'Category Name',
  },
  skills: [
    { name: 'Nombre de habilidad', level: 85 },
    // más habilidades...
  ],
}
```

**Cómo añadir habilidades adicionales:**
- Edita el objeto `additionalSkills`
- Añade strings en ambos idiomas (`es` y `en`)
- Estas habilidades se muestran como tags sin nivel numérico

---

### `about.ts`
Contiene tu información personal, experiencia profesional y educación.

**Secciones editables:**

#### 1. Información Personal (`personalInfo`)
- Edita los párrafos de descripción en ambos idiomas
- Puedes añadir o eliminar párrafos del array

#### 2. Experiencia Profesional (`experiences`)
Añade o edita tus experiencias laborales:
```typescript
{
  title: {
    es: 'Título del puesto',
    en: 'Job title',
  },
  company: {
    es: 'Nombre de la empresa',
    en: 'Company name',
  },
  description: {
    es: 'Descripción de responsabilidades...',
    en: 'Description of responsibilities...',
  },
  period: '2020 - 2023', // Opcional
}
```

#### 3. Educación (`education`)
Añade tus estudios y certificaciones:
```typescript
{
  degree: {
    es: 'Título o certificación',
    en: 'Degree or certification',
  },
  institution: {
    es: 'Nombre de la institución',
    en: 'Institution name',
  },
  description: {
    es: 'Descripción...',
    en: 'Description...',
  },
  period: '2015 - 2019', // Opcional
}
```

---

## 🌍 Multilingüe

Todos los archivos soportan español (`es`) e inglés (`en`). Asegúrate de proporcionar ambas versiones para mantener la consistencia del portfolio.

## 🔧 Funciones útiles

Cada archivo exporta funciones helper que resuelven automáticamente el idioma:

- **projects.ts**: `getProjects(language)`, `resolveProject(project, language)`, `getNextProjectId()`
- **skills.ts**: `getSkillCategories(language)`, `getAdditionalSkills(language)`
- **about.ts**: `getPersonalInfo(language)`, `getExperiences(language)`, `getEducation(language)`

Los componentes ya usan estas funciones, así que solo necesitas editar los datos.

---

## 📝 Consejos

1. **IDs únicos**: En `projects.ts`, asegúrate de que cada proyecto tenga un ID único
2. **Niveles de habilidad**: Usa valores entre 0-100 para representar tu nivel de competencia
3. **Orden cronológico**: En `about.ts`, ordena las experiencias de más reciente a más antigua
4. **Coherencia**: Mantén un estilo y tono similar en todas las descripciones
5. **TypeScript**: Los tipos te ayudarán a evitar errores, presta atención a las advertencias del editor

---

## 🚀 Resultado

Una vez que edites estos archivos, los cambios se reflejarán automáticamente en las secciones correspondientes de tu portfolio:

- **Projects** → Muestra todos los proyectos de `projects.ts`
- **Skills** → Muestra las categorías y habilidades de `skills.ts`
- **About** → Muestra la información personal, experiencia y educación de `about.ts`

¡No necesitas tocar ningún componente React para actualizar tu contenido!
