# Datos del portfolio

Esta carpeta es la fuente de verdad del contenido visible del portfolio. La UI, la busqueda global y el contexto del chatbot se alimentan desde aqui.

## Archivos

### `projects.ts`

Define los proyectos del portfolio.

Campos principales:

- `id`: numero unico y estable.
- `featured`: destaca el proyecto en la lista.
- `title` y `description`: textos ES/EN.
- `tech`: tecnologias mostradas como tags.
- `github`: enlace al repositorio.
- `demo`: enlace externo o ruta interna con `#chat` / `#space`.
- `details`: contenido largo ES/EN para el modal de detalle.

Usa `getNextProjectId()` como ayuda al anadir proyectos y manten el orden que quieras mostrar en UI.

### `skills.ts`

Define categorias de habilidades.

Cada skill tiene:

- `name`: nombre mostrado.
- `description`: explicacion ES/EN mostrada en el desplegable.

`additionalSkills` contiene competencias transversales como tags simples.

### `about.ts`

Define:

- `personalInfo`: parrafos ES/EN de presentacion.
- `experiences`: experiencia profesional, empresa, descripcion, periodo y fechas.
- `education`: formacion.

Las fechas `startDate` y `endDate` de `experiences` alimentan el contador de experiencia total. Si una experiencia sigue activa, deja `endDate` vacio.

### `contextGenerator.ts`

Construye el contexto textual que usa el chatbot. Si anades nuevas secciones de datos y quieres que el chat las conozca, integralo aqui.

## Helpers exportados

- `getProjects(language)`
- `resolveProject(project, language)`
- `getSkillCategories(language)`
- `getAdditionalSkills(language)`
- `getPersonalInfo(language)`
- `getExperiences(language)`
- `getEducation(language)`
- `getTotalExperienceMs()`

Los componentes deberian consumir estos helpers en vez de resolver textos bilingues a mano.

## Relacion con CMS

La app puede cargar datos desde Firebase CMS si `VITE_FIREBASE_CMS_ENABLED=true`. Si esta apagado, usa estos archivos estaticos.

El panel CMS usa `public/data-defaults.json` como plantilla para restaurar datos. Cuando cambies la forma de los datos, revisa:

- `src/data/*.ts`
- `src/stores/cmsDataStore.ts`
- `src/services/cmsService.ts`
- `public/data-defaults.json`
- `public/analytics.html`

## Checklist al editar datos

1. Mantener siempre versiones `es` y `en`.
2. No reutilizar IDs de proyectos.
3. Usar demos internas solo con secciones existentes: `#chat` o `#space`.
4. Ejecutar `npm run check`.
5. Si cambias estructura, ejecutar tambien `npm run build`.
