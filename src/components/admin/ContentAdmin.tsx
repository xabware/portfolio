import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Auth, User } from 'firebase/auth';
import {
  AlertCircle,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { isFirebaseCmsEnabled } from '../../config/cmsConfig';
import { applyCMSData } from '../../stores/cmsDataStore';
import { createDefaultCMSContent } from '../../data/cmsDefaults';
import type { ContactMethodType, LocalizedText } from '../../data/siteSettings';
import type { SpacePlanetContent, SpacePlanetType } from '../../data/spaceContent';
import type { CMSContentData, CMSDocId, LoadedCMSContent } from '../../services/cmsService';
import './ContentAdmin.css';

type FirebaseAuthModule = typeof import('firebase/auth');
type AdminTab = 'pages' | 'projects' | 'skills' | 'interface' | 'contact' | 'space' | 'advanced';
type Lang = 'es' | 'en';

interface AuthApi {
  auth: Auth;
  signInWithEmailAndPassword: FirebaseAuthModule['signInWithEmailAndPassword'];
  signOut: FirebaseAuthModule['signOut'];
}

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'pages', label: 'Paginas' },
  { id: 'projects', label: 'Proyectos' },
  { id: 'skills', label: 'Habilidades' },
  { id: 'interface', label: 'Interfaz' },
  { id: 'contact', label: 'Contacto' },
  { id: 'space', label: '3D' },
  { id: 'advanced', label: 'JSON' },
];

const docIds: CMSDocId[] = ['projects', 'about', 'skills', 'translations', 'settings', 'space'];

const contactTypes: ContactMethodType[] = ['email', 'linkedin', 'github', 'website', 'custom'];
const planetTypes: SpacePlanetType[] = ['terrestrial', 'gas_giant', 'ice', 'volcanic'];

function mergeLoadedContent(defaults: CMSContentData, loaded: LoadedCMSContent): CMSContentData {
  return {
    projects: loaded.projects ?? defaults.projects,
    about: loaded.about ?? defaults.about,
    skills: loaded.skills ?? defaults.skills,
    translations: {
      es: { ...(defaults.translations.es ?? {}), ...(loaded.translations?.es ?? {}) },
      en: { ...(defaults.translations.en ?? {}), ...(loaded.translations?.en ?? {}) },
    },
    settings: loaded.settings ?? defaults.settings,
    space: loaded.space ?? defaults.space,
  };
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
}

function splitBlocks(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map(block => block.trim())
    .filter(Boolean);
}

function joinBlocks(value: readonly string[]): string {
  return value.join('\n\n');
}

function splitComma(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function nextProjectId(projects: CMSContentData['projects']): number {
  return projects.length ? Math.max(...projects.map(project => project.id)) + 1 : 1;
}

function makeLocalizedText(): LocalizedText {
  return { es: '', en: '' };
}

function makeEmptyProject(id: number): CMSContentData['projects'][number] {
  return {
    id,
    featured: false,
    title: makeLocalizedText(),
    description: makeLocalizedText(),
    tech: [],
    github: '',
    demo: '',
    details: {
      es: {
        overview: [],
        challenge: [],
        solution: [],
        features: [],
        techDetails: '',
        results: '',
        date: '',
        team: '',
      },
      en: {
        overview: [],
        challenge: [],
        solution: [],
        features: [],
        techDetails: '',
        results: '',
        date: '',
        team: '',
      },
    },
  };
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea rows={rows} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function BilingualField({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  textarea?: boolean;
}) {
  return (
    <div className="admin-bilingual">
      {textarea ? (
        <>
          <Area label={`${label} ES`} value={value.es} onChange={(es) => onChange({ ...value, es })} />
          <Area label={`${label} EN`} value={value.en} onChange={(en) => onChange({ ...value, en })} />
        </>
      ) : (
        <>
          <Field label={`${label} ES`} value={value.es} onChange={(es) => onChange({ ...value, es })} />
          <Field label={`${label} EN`} value={value.en} onChange={(en) => onChange({ ...value, en })} />
        </>
      )}
    </div>
  );
}

function ContentAdmin() {
  const [activeTab, setActiveTab] = useState<AdminTab>('pages');
  const [draft, setDraft] = useState<CMSContentData>(() => createDefaultCMSContent());
  const [authApi, setAuthApi] = useState<AuthApi | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [savingDoc, setSavingDoc] = useState<CMSDocId | 'all' | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState(0);
  const [translationFilter, setTranslationFilter] = useState('');
  const [advancedJson, setAdvancedJson] = useState('');

  const showToast = useCallback((message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const updateDraft = useCallback(<K extends keyof CMSContentData>(
    key: K,
    updater: (value: CMSContentData[K]) => CMSContentData[K]
  ) => {
    setDraft(previous => ({
      ...previous,
      [key]: updater(previous[key]),
    }));
  }, []);

  const loadCMSContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const [{ loadAllCMSData }] = await Promise.all([
        import('../../services/cmsService'),
      ]);
      const loaded = await loadAllCMSData();
      const next = mergeLoadedContent(createDefaultCMSContent(), loaded);
      setDraft(next);
      setSelectedProjectIndex(0);
      applyCMSData(loaded);
      showToast('Contenido cargado');
    } catch (error) {
      console.error('[Admin] Error loading CMS content:', error);
      showToast('No se pudo cargar el contenido CMS', 'error');
    } finally {
      setLoadingContent(false);
    }
  }, [showToast]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    Promise.all([
      import('firebase/auth'),
      import('../../config/firebaseConfig'),
    ])
      .then(([authModule, firebaseModule]) => {
        if (cancelled) return;
        const auth = authModule.getAuth(firebaseModule.default);
        setAuthApi({
          auth,
          signInWithEmailAndPassword: authModule.signInWithEmailAndPassword,
          signOut: authModule.signOut,
        });
        unsubscribe = authModule.onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setCheckingAuth(false);
        });
      })
      .catch((error) => {
        console.error('[Admin] Firebase Auth init failed:', error);
        const detail = error instanceof Error ? error.message : 'Revisa la configuracion de Firebase.';
        setAuthError(`No se pudo inicializar Firebase Auth. ${detail}`);
        setCheckingAuth(false);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (user) void loadCMSContent();
  }, [loadCMSContent, user]);

  useEffect(() => {
    if (activeTab === 'advanced') {
      setAdvancedJson(JSON.stringify(draft, null, 2));
    }
  }, [activeTab, draft]);

  const applySavedDocToStore = useCallback((docId: CMSDocId) => {
    if (docId === 'projects') applyCMSData({ projects: draft.projects });
    if (docId === 'about') applyCMSData({ about: draft.about });
    if (docId === 'skills') applyCMSData({ skills: draft.skills });
    if (docId === 'translations') applyCMSData({ translations: draft.translations });
    if (docId === 'settings') applyCMSData({ settings: draft.settings });
    if (docId === 'space') applyCMSData({ space: draft.space });
  }, [draft]);

  const saveDoc = useCallback(async (docId: CMSDocId) => {
    setSavingDoc(docId);
    try {
      const { saveCMSDoc } = await import('../../services/cmsService');
      await saveCMSDoc(docId, draft[docId]);
      applySavedDocToStore(docId);
      showToast('Cambios guardados');
    } catch (error) {
      console.error('[Admin] Error saving CMS doc:', error);
      showToast('No se pudieron guardar los cambios', 'error');
    } finally {
      setSavingDoc(null);
    }
  }, [applySavedDocToStore, draft, showToast]);

  const saveAll = useCallback(async () => {
    setSavingDoc('all');
    try {
      const { saveCMSDoc } = await import('../../services/cmsService');
      await Promise.all(docIds.map(docId => saveCMSDoc(docId, draft[docId])));
      applyCMSData({
        projects: draft.projects,
        about: draft.about,
        skills: draft.skills,
        translations: draft.translations,
        settings: draft.settings,
        space: draft.space,
      });
      showToast('Todo el contenido se ha guardado');
    } catch (error) {
      console.error('[Admin] Error saving all CMS docs:', error);
      showToast('No se pudo guardar todo el contenido', 'error');
    } finally {
      setSavingDoc(null);
    }
  }, [draft, showToast]);

  const restoreDefaults = useCallback(() => {
    const defaults = createDefaultCMSContent();
    setDraft(defaults);
    setSelectedProjectIndex(0);
    showToast('Datos por defecto cargados en el editor');
  }, [showToast]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authApi) return;

    setAuthError('');
    try {
      await authApi.signInWithEmailAndPassword(authApi.auth, loginEmail, loginPassword);
      setLoginPassword('');
    } catch (error) {
      console.error('[Admin] Login failed:', error);
      setAuthError('Email o contrasena incorrectos.');
    }
  };

  const handleLogout = async () => {
    if (!authApi) return;
    await authApi.signOut(authApi.auth);
  };

  const selectedProject = draft.projects[selectedProjectIndex] ?? draft.projects[0] ?? null;

  const filteredTranslationKeys = useMemo(() => {
    const keys = Array.from(new Set([
      ...Object.keys(draft.translations.es ?? {}),
      ...Object.keys(draft.translations.en ?? {}),
    ])).sort();

    const filter = translationFilter.trim().toLowerCase();
    if (!filter) return keys;
    return keys.filter(key => {
      const es = draft.translations.es?.[key] ?? '';
      const en = draft.translations.en?.[key] ?? '';
      return key.toLowerCase().includes(filter)
        || es.toLowerCase().includes(filter)
        || en.toLowerCase().includes(filter);
    });
  }, [draft.translations, translationFilter]);

  const renderSaveButton = (docId: CMSDocId) => (
    <button className="admin-button admin-button-primary" type="button" onClick={() => void saveDoc(docId)} disabled={savingDoc !== null}>
      {savingDoc === docId ? <Loader2 size={16} className="admin-spin" /> : <Save size={16} />}
      Guardar
    </button>
  );

  const updateProject = (index: number, updater: (project: CMSContentData['projects'][number]) => CMSContentData['projects'][number]) => {
    updateDraft('projects', projects => projects.map((project, projectIndex) => (
      projectIndex === index ? updater(project) : project
    )));
  };

  const renderPagesTab = () => (
    <div className="admin-editor-grid">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>Sobre mi</h2>
          {renderSaveButton('about')}
        </div>
        <div className="admin-bilingual">
          <Area
            label="Descripcion ES"
            value={joinBlocks(draft.about.personalInfo.description.es)}
            onChange={(value) => updateDraft('about', about => ({
              ...about,
              personalInfo: {
                description: { ...about.personalInfo.description, es: splitBlocks(value) },
              },
            }))}
            rows={8}
          />
          <Area
            label="Descripcion EN"
            value={joinBlocks(draft.about.personalInfo.description.en)}
            onChange={(value) => updateDraft('about', about => ({
              ...about,
              personalInfo: {
                description: { ...about.personalInfo.description, en: splitBlocks(value) },
              },
            }))}
            rows={8}
          />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>Experiencia</h2>
          <button
            className="admin-button"
            type="button"
            onClick={() => updateDraft('about', about => ({
              ...about,
              experiences: [
                ...about.experiences,
                {
                  title: makeLocalizedText(),
                  company: makeLocalizedText(),
                  description: makeLocalizedText(),
                  period: makeLocalizedText(),
                  startDate: '',
                },
              ],
            }))}
          >
            <Plus size={16} />
            Anadir
          </button>
        </div>
        <div className="admin-stack">
          {draft.about.experiences.map((experience, index) => (
            <div className="admin-item" key={`experience-${index}`}>
              <div className="admin-item-header">
                <strong>{experience.title.es || 'Experiencia sin titulo'}</strong>
                <button
                  className="admin-icon-button admin-danger"
                  type="button"
                  aria-label="Eliminar experiencia"
                  onClick={() => updateDraft('about', about => ({
                    ...about,
                    experiences: about.experiences.filter((_, itemIndex) => itemIndex !== index),
                  }))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <BilingualField label="Puesto" value={experience.title} onChange={(title) => updateDraft('about', about => ({
                ...about,
                experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item),
              }))} />
              <BilingualField label="Empresa" value={experience.company} onChange={(company) => updateDraft('about', about => ({
                ...about,
                experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, company } : item),
              }))} />
              <BilingualField label="Periodo" value={experience.period ?? makeLocalizedText()} onChange={(period) => updateDraft('about', about => ({
                ...about,
                experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, period } : item),
              }))} />
              <BilingualField label="Descripcion" textarea value={experience.description} onChange={(description) => updateDraft('about', about => ({
                ...about,
                experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item),
              }))} />
              <div className="admin-two-cols">
                <Field label="Fecha inicio" type="date" value={experience.startDate} onChange={(startDate) => updateDraft('about', about => ({
                  ...about,
                  experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, startDate } : item),
                }))} />
                <Field label="Fecha fin" type="date" value={experience.endDate ?? ''} onChange={(endDate) => updateDraft('about', about => ({
                  ...about,
                  experiences: about.experiences.map((item, itemIndex) => itemIndex === index ? { ...item, endDate: endDate || undefined } : item),
                }))} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>Educacion</h2>
          <button
            className="admin-button"
            type="button"
            onClick={() => updateDraft('about', about => ({
              ...about,
              education: [
                ...about.education,
                {
                  degree: makeLocalizedText(),
                  institution: makeLocalizedText(),
                  description: makeLocalizedText(),
                  period: makeLocalizedText(),
                },
              ],
            }))}
          >
            <Plus size={16} />
            Anadir
          </button>
        </div>
        <div className="admin-stack">
          {draft.about.education.map((education, index) => (
            <div className="admin-item" key={`education-${index}`}>
              <div className="admin-item-header">
                <strong>{education.degree.es || 'Formacion sin titulo'}</strong>
                <button
                  className="admin-icon-button admin-danger"
                  type="button"
                  aria-label="Eliminar educacion"
                  onClick={() => updateDraft('about', about => ({
                    ...about,
                    education: about.education.filter((_, itemIndex) => itemIndex !== index),
                  }))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <BilingualField label="Titulo" value={education.degree} onChange={(degree) => updateDraft('about', about => ({
                ...about,
                education: about.education.map((item, itemIndex) => itemIndex === index ? { ...item, degree } : item),
              }))} />
              <BilingualField label="Centro" value={education.institution} onChange={(institution) => updateDraft('about', about => ({
                ...about,
                education: about.education.map((item, itemIndex) => itemIndex === index ? { ...item, institution } : item),
              }))} />
              <BilingualField label="Periodo" value={education.period ?? makeLocalizedText()} onChange={(period) => updateDraft('about', about => ({
                ...about,
                education: about.education.map((item, itemIndex) => itemIndex === index ? { ...item, period } : item),
              }))} />
              <BilingualField label="Descripcion" textarea value={education.description} onChange={(description) => updateDraft('about', about => ({
                ...about,
                education: about.education.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item),
              }))} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="admin-split">
      <aside className="admin-list-panel">
        <div className="admin-list-header">
          <h2>Proyectos</h2>
          <button
            className="admin-button"
            type="button"
            onClick={() => {
              const newProject = makeEmptyProject(nextProjectId(draft.projects));
              updateDraft('projects', projects => [...projects, newProject]);
              setSelectedProjectIndex(draft.projects.length);
            }}
          >
            <Plus size={16} />
            Nuevo
          </button>
        </div>
        <div className="admin-project-list">
          {draft.projects.map((project, index) => (
            <button
              className={`admin-list-row ${selectedProjectIndex === index ? 'active' : ''}`}
              key={project.id}
              type="button"
              onClick={() => setSelectedProjectIndex(index)}
            >
              <span>{project.title.es || project.title.en || `Proyecto ${project.id}`}</span>
              <small>{project.featured ? 'Destacado' : 'Secundario'}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>{selectedProject?.title.es || 'Proyecto'}</h2>
          <div className="admin-actions">
            <button
              className="admin-button admin-danger"
              type="button"
              disabled={!selectedProject}
              onClick={() => {
                updateDraft('projects', projects => projects.filter((_, index) => index !== selectedProjectIndex));
                setSelectedProjectIndex(Math.max(0, selectedProjectIndex - 1));
              }}
            >
              <Trash2 size={16} />
              Eliminar
            </button>
            {renderSaveButton('projects')}
          </div>
        </div>
        {selectedProject && (
          <div className="admin-stack">
            <div className="admin-two-cols">
              <Field label="ID" type="number" value={selectedProject.id} onChange={(id) => updateProject(selectedProjectIndex, project => ({ ...project, id: Number(id) || project.id }))} />
              <label className="admin-check">
                <input type="checkbox" checked={selectedProject.featured ?? false} onChange={(event) => updateProject(selectedProjectIndex, project => ({ ...project, featured: event.target.checked }))} />
                <span>Proyecto destacado</span>
              </label>
            </div>
            <BilingualField label="Titulo" value={selectedProject.title} onChange={(title) => updateProject(selectedProjectIndex, project => ({ ...project, title }))} />
            <BilingualField label="Descripcion corta" textarea value={selectedProject.description} onChange={(description) => updateProject(selectedProjectIndex, project => ({ ...project, description }))} />
            <div className="admin-two-cols">
              <Field label="GitHub" value={selectedProject.github} onChange={(github) => updateProject(selectedProjectIndex, project => ({ ...project, github }))} />
              <Field label="Demo" value={selectedProject.demo} onChange={(demo) => updateProject(selectedProjectIndex, project => ({ ...project, demo }))} />
            </div>
            <Area label="Tecnologias separadas por coma" value={selectedProject.tech.join(', ')} onChange={(tech) => updateProject(selectedProjectIndex, project => ({ ...project, tech: splitComma(tech) }))} rows={2} />
            {(['es', 'en'] as Lang[]).map(lang => (
              <div className="admin-item" key={`project-details-${lang}`}>
                <div className="admin-item-header">
                  <strong>Detalle {lang.toUpperCase()}</strong>
                </div>
                <Area label="Overview" value={joinBlocks(selectedProject.details[lang].overview)} onChange={(value) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], overview: splitBlocks(value) } },
                }))} rows={5} />
                <Area label="Desafio" value={joinBlocks(selectedProject.details[lang].challenge)} onChange={(value) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], challenge: splitBlocks(value) } },
                }))} rows={5} />
                <Area label="Solucion" value={joinBlocks(selectedProject.details[lang].solution)} onChange={(value) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], solution: splitBlocks(value) } },
                }))} rows={5} />
                <Area label="Features, una por linea" value={selectedProject.details[lang].features.join('\n')} onChange={(value) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], features: splitLines(value) } },
                }))} rows={5} />
                <Area label="Detalles tecnicos" value={selectedProject.details[lang].techDetails} onChange={(techDetails) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], techDetails } },
                }))} />
                <Area label="Resultados" value={selectedProject.details[lang].results} onChange={(results) => updateProject(selectedProjectIndex, project => ({
                  ...project,
                  details: { ...project.details, [lang]: { ...project.details[lang], results } },
                }))} />
                <div className="admin-two-cols">
                  <Field label="Fecha" value={selectedProject.details[lang].date ?? ''} onChange={(date) => updateProject(selectedProjectIndex, project => ({
                    ...project,
                    details: { ...project.details, [lang]: { ...project.details[lang], date } },
                  }))} />
                  <Field label="Equipo" value={selectedProject.details[lang].team ?? ''} onChange={(team) => updateProject(selectedProjectIndex, project => ({
                    ...project,
                    details: { ...project.details, [lang]: { ...project.details[lang], team } },
                  }))} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderSkillsTab = () => (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Habilidades</h2>
        <div className="admin-actions">
          <button
            className="admin-button"
            type="button"
            onClick={() => updateDraft('skills', skills => ({
              ...skills,
              categories: [...skills.categories, { title: makeLocalizedText(), skills: [] }],
            }))}
          >
            <Plus size={16} />
            Categoria
          </button>
          {renderSaveButton('skills')}
        </div>
      </div>
      <div className="admin-stack">
        {draft.skills.categories.map((category, categoryIndex) => (
          <div className="admin-item" key={`category-${categoryIndex}`}>
            <div className="admin-item-header">
              <strong>{category.title.es || 'Categoria sin titulo'}</strong>
              <div className="admin-actions">
                <button
                  className="admin-button"
                  type="button"
                  onClick={() => updateDraft('skills', skills => ({
                    ...skills,
                    categories: skills.categories.map((item, itemIndex) => itemIndex === categoryIndex
                      ? { ...item, skills: [...item.skills, { name: '', description: makeLocalizedText() }] }
                      : item),
                  }))}
                >
                  <Plus size={16} />
                  Skill
                </button>
                <button
                  className="admin-icon-button admin-danger"
                  type="button"
                  aria-label="Eliminar categoria"
                  onClick={() => updateDraft('skills', skills => ({
                    ...skills,
                    categories: skills.categories.filter((_, itemIndex) => itemIndex !== categoryIndex),
                  }))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <BilingualField label="Categoria" value={category.title} onChange={(title) => updateDraft('skills', skills => ({
              ...skills,
              categories: skills.categories.map((item, itemIndex) => itemIndex === categoryIndex ? { ...item, title } : item),
            }))} />
            {category.skills.map((skill, skillIndex) => (
              <div className="admin-subitem" key={`skill-${categoryIndex}-${skillIndex}`}>
                <div className="admin-two-cols admin-two-cols-tight">
                  <Field label="Nombre" value={skill.name} onChange={(name) => updateDraft('skills', skills => ({
                    ...skills,
                    categories: skills.categories.map((item, itemIndex) => itemIndex === categoryIndex
                      ? {
                          ...item,
                          skills: item.skills.map((innerSkill, innerIndex) => innerIndex === skillIndex ? { ...innerSkill, name } : innerSkill),
                        }
                      : item),
                  }))} />
                  <button
                    className="admin-icon-button admin-danger admin-align-end"
                    type="button"
                    aria-label="Eliminar skill"
                    onClick={() => updateDraft('skills', skills => ({
                      ...skills,
                      categories: skills.categories.map((item, itemIndex) => itemIndex === categoryIndex
                        ? { ...item, skills: item.skills.filter((_, innerIndex) => innerIndex !== skillIndex) }
                        : item),
                    }))}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <BilingualField label="Descripcion" textarea value={skill.description} onChange={(description) => updateDraft('skills', skills => ({
                  ...skills,
                  categories: skills.categories.map((item, itemIndex) => itemIndex === categoryIndex
                    ? {
                        ...item,
                        skills: item.skills.map((innerSkill, innerIndex) => innerIndex === skillIndex ? { ...innerSkill, description } : innerSkill),
                      }
                    : item),
                }))} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="admin-bilingual admin-spaced">
        <Area label="Otras competencias ES, una por linea" value={draft.skills.additionalSkills.es.join('\n')} onChange={(value) => updateDraft('skills', skills => ({
          ...skills,
          additionalSkills: { ...skills.additionalSkills, es: splitLines(value) },
        }))} rows={7} />
        <Area label="Otras competencias EN, una por linea" value={draft.skills.additionalSkills.en.join('\n')} onChange={(value) => updateDraft('skills', skills => ({
          ...skills,
          additionalSkills: { ...skills.additionalSkills, en: splitLines(value) },
        }))} rows={7} />
      </div>
    </section>
  );

  const renderInterfaceTab = () => (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Textos de interfaz</h2>
        {renderSaveButton('translations')}
      </div>
      <label className="admin-search">
        <Search size={16} />
        <input value={translationFilter} onChange={(event) => setTranslationFilter(event.target.value)} placeholder="Buscar clave o texto" />
      </label>
      <div className="admin-translation-grid">
        {filteredTranslationKeys.map(key => (
          <div className="admin-translation-row" key={key}>
            <code>{key}</code>
            <input
              value={draft.translations.es?.[key] ?? ''}
              aria-label={`${key} ES`}
              onChange={(event) => updateDraft('translations', translations => ({
                ...translations,
                es: { ...(translations.es ?? {}), [key]: event.target.value },
              }))}
            />
            <input
              value={draft.translations.en?.[key] ?? ''}
              aria-label={`${key} EN`}
              onChange={(event) => updateDraft('translations', translations => ({
                ...translations,
                en: { ...(translations.en ?? {}), [key]: event.target.value },
              }))}
            />
          </div>
        ))}
      </div>
    </section>
  );

  const renderContactTab = () => (
    <div className="admin-editor-grid">
      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>Metodos de contacto</h2>
          <div className="admin-actions">
            <button
              className="admin-button"
              type="button"
              onClick={() => updateDraft('settings', settings => ({
                ...settings,
                contactMethods: [
                  ...settings.contactMethods,
                  { id: `contact-${Date.now()}`, type: 'custom', title: makeLocalizedText(), value: '', href: '' },
                ],
              }))}
            >
              <Plus size={16} />
              Metodo
            </button>
            {renderSaveButton('settings')}
          </div>
        </div>
        <div className="admin-stack">
          {draft.settings.contactMethods.map((method, index) => (
            <div className="admin-item" key={method.id}>
              <div className="admin-item-header">
                <strong>{method.value || method.id}</strong>
                <button
                  className="admin-icon-button admin-danger"
                  type="button"
                  aria-label="Eliminar metodo"
                  onClick={() => updateDraft('settings', settings => ({
                    ...settings,
                    contactMethods: settings.contactMethods.filter((_, itemIndex) => itemIndex !== index),
                  }))}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="admin-two-cols">
                <Field label="ID" value={method.id} onChange={(id) => updateDraft('settings', settings => ({
                  ...settings,
                  contactMethods: settings.contactMethods.map((item, itemIndex) => itemIndex === index ? { ...item, id } : item),
                }))} />
                <label className="admin-field">
                  <span>Tipo</span>
                  <select value={method.type} onChange={(event) => updateDraft('settings', settings => ({
                    ...settings,
                    contactMethods: settings.contactMethods.map((item, itemIndex) => itemIndex === index
                      ? { ...item, type: event.target.value as ContactMethodType }
                      : item),
                  }))}>
                    {contactTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
              </div>
              <BilingualField label="Titulo" value={method.title} onChange={(title) => updateDraft('settings', settings => ({
                ...settings,
                contactMethods: settings.contactMethods.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item),
              }))} />
              <div className="admin-two-cols">
                <Field label="Texto visible" value={method.value} onChange={(value) => updateDraft('settings', settings => ({
                  ...settings,
                  contactMethods: settings.contactMethods.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item),
                }))} />
                <Field label="Enlace" value={method.href} onChange={(href) => updateDraft('settings', settings => ({
                  ...settings,
                  contactMethods: settings.contactMethods.map((item, itemIndex) => itemIndex === index ? { ...item, href } : item),
                }))} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-header">
          <h2>CV y EmailJS</h2>
        </div>
        <div className="admin-stack">
          <div className="admin-item">
            <div className="admin-item-header"><strong>CV</strong></div>
            <div className="admin-bilingual">
              {(['es', 'en'] as Lang[]).map(lang => (
                <div className="admin-stack" key={`cv-${lang}`}>
                  <Field label={`Ruta CV ${lang.toUpperCase()}`} value={draft.settings.cvDownloads[lang].href} onChange={(href) => updateDraft('settings', settings => ({
                    ...settings,
                    cvDownloads: { ...settings.cvDownloads, [lang]: { ...settings.cvDownloads[lang], href } },
                  }))} />
                  <Field label={`Nombre archivo ${lang.toUpperCase()}`} value={draft.settings.cvDownloads[lang].fileName} onChange={(fileName) => updateDraft('settings', settings => ({
                    ...settings,
                    cvDownloads: { ...settings.cvDownloads, [lang]: { ...settings.cvDownloads[lang], fileName } },
                  }))} />
                </div>
              ))}
            </div>
          </div>
          <div className="admin-item">
            <div className="admin-item-header"><strong>EmailJS</strong></div>
            <Field label="Service ID" value={draft.settings.emailJs.serviceId} onChange={(serviceId) => updateDraft('settings', settings => ({
              ...settings,
              emailJs: { ...settings.emailJs, serviceId },
            }))} />
            <Field label="Template ID" value={draft.settings.emailJs.templateId} onChange={(templateId) => updateDraft('settings', settings => ({
              ...settings,
              emailJs: { ...settings.emailJs, templateId },
            }))} />
            <Field label="Public key" value={draft.settings.emailJs.publicKey} onChange={(publicKey) => updateDraft('settings', settings => ({
              ...settings,
              emailJs: { ...settings.emailJs, publicKey },
            }))} />
            <Field label="To email" value={draft.settings.emailJs.toEmail} onChange={(toEmail) => updateDraft('settings', settings => ({
              ...settings,
              emailJs: { ...settings.emailJs, toEmail },
            }))} />
          </div>
        </div>
      </section>
    </div>
  );

  const renderSpaceTab = () => (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>Sistema 3D</h2>
        {renderSaveButton('space')}
      </div>
      <div className="admin-stack">
        {draft.space.planets.map((planet, index) => (
          <div className="admin-item" key={planet.id}>
            <div className="admin-item-header">
              <strong>{planet.name.es}</strong>
            </div>
            <BilingualField label="Nombre" value={planet.name} onChange={(name) => updateDraft('space', space => ({
              ...space,
              planets: space.planets.map((item, itemIndex) => itemIndex === index ? { ...item, name } : item),
            }))} />
            <BilingualField label="Descripcion" textarea value={planet.description} onChange={(description) => updateDraft('space', space => ({
              ...space,
              planets: space.planets.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item),
            }))} />
            <div className="admin-two-cols">
              <Field label="Color" type="color" value={planet.color} onChange={(color) => updateDraft('space', space => ({
                ...space,
                planets: space.planets.map((item, itemIndex) => itemIndex === index ? { ...item, color } : item),
              }))} />
              <label className="admin-field">
                <span>Tipo planeta</span>
                <select value={planet.planetType} onChange={(event) => updateDraft('space', space => ({
                  ...space,
                  planets: space.planets.map((item, itemIndex) => itemIndex === index
                    ? { ...item, planetType: event.target.value as SpacePlanetType }
                    : item),
                }))}>
                  {planetTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
            </div>
            <div className="admin-four-cols">
              {(['size', 'orbitRadius', 'orbitSpeed'] as Array<keyof Pick<SpacePlanetContent, 'size' | 'orbitRadius' | 'orbitSpeed'>>).map(field => (
                <Field
                  key={field}
                  label={field}
                  type="number"
                  value={planet[field]}
                  onChange={(value) => updateDraft('space', space => ({
                    ...space,
                    planets: space.planets.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: Number(value) || 0 } : item),
                  }))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAdvancedTab = () => (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2>JSON completo</h2>
        <div className="admin-actions">
          <button
            className="admin-button"
            type="button"
            onClick={() => {
              try {
                setDraft(JSON.parse(advancedJson) as CMSContentData);
                showToast('JSON aplicado al editor');
              } catch {
                showToast('El JSON no es valido', 'error');
              }
            }}
          >
            Aplicar JSON
          </button>
          <button className="admin-button admin-button-primary" type="button" onClick={() => void saveAll()} disabled={savingDoc !== null}>
            {savingDoc === 'all' ? <Loader2 size={16} className="admin-spin" /> : <Save size={16} />}
            Guardar todo
          </button>
        </div>
      </div>
      <Area label="Contenido completo" value={advancedJson} onChange={setAdvancedJson} rows={28} />
    </section>
  );

  const renderCurrentTab = () => {
    if (activeTab === 'pages') return renderPagesTab();
    if (activeTab === 'projects') return renderProjectsTab();
    if (activeTab === 'skills') return renderSkillsTab();
    if (activeTab === 'interface') return renderInterfaceTab();
    if (activeTab === 'contact') return renderContactTab();
    if (activeTab === 'space') return renderSpaceTab();
    return renderAdvancedTab();
  };

  if (checkingAuth) {
    return (
      <div className="admin-shell admin-centered">
        <Loader2 size={28} className="admin-spin" />
        <span>Comprobando autenticacion...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-login-shell">
        <form className="admin-login" onSubmit={(event) => void handleLogin(event)}>
          <div className="admin-login-icon"><ShieldCheck size={28} /></div>
          <h1>Editor de contenido</h1>
          <p>Acceso protegido con Firebase Auth.</p>
          {!isFirebaseCmsEnabled && (
            <div className="admin-warning">
              <AlertCircle size={16} />
              El sitio publico solo leera estos datos si VITE_FIREBASE_CMS_ENABLED=true.
            </div>
          )}
          <Field label="Email" type="email" value={loginEmail} onChange={setLoginEmail} />
          <Field label="Contrasena" type="password" value={loginPassword} onChange={setLoginPassword} />
          {authError && <div className="admin-error">{authError}</div>}
          <button className="admin-button admin-button-primary admin-login-button" type="submit" disabled={!authApi}>
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div>
          <h1>Editor de contenido</h1>
          <p>{user.email}</p>
        </div>
        <div className="admin-actions">
          <button className="admin-button" type="button" onClick={() => void loadCMSContent()} disabled={loadingContent || savingDoc !== null}>
            {loadingContent ? <Loader2 size={16} className="admin-spin" /> : <RefreshCw size={16} />}
            Recargar
          </button>
          <button className="admin-button" type="button" onClick={restoreDefaults} disabled={savingDoc !== null}>
            Restaurar defaults
          </button>
          <button className="admin-button admin-button-primary" type="button" onClick={() => void saveAll()} disabled={savingDoc !== null}>
            {savingDoc === 'all' ? <Loader2 size={16} className="admin-spin" /> : <Save size={16} />}
            Guardar todo
          </button>
          <button className="admin-icon-button" type="button" aria-label="Cerrar sesion" onClick={() => void handleLogout()}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {!isFirebaseCmsEnabled && (
        <div className="admin-warning admin-warning-inline">
          <AlertCircle size={16} />
          Edicion disponible, pero el portfolio desplegado necesita `VITE_FIREBASE_CMS_ENABLED=true` para leer Firebase.
        </div>
      )}

      <nav className="admin-tabs" aria-label="Secciones del editor">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {loadingContent ? (
          <div className="admin-centered">
            <Loader2 size={24} className="admin-spin" />
            <span>Cargando contenido...</span>
          </div>
        ) : renderCurrentTab()}
      </main>

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ContentAdmin;
