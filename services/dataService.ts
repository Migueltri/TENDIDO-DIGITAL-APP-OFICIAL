import LZString from 'lz-string';
import { Article, ArchivedArticle, Author, Category } from '../types';

// DATOS INICIALES DE AUTORES CON NUEVAS IMÁGENES
const INITIAL_AUTHORS: Author[] = [
  { id: '1', name: 'Eduardo Elvira', role: 'Director', imageUrl: '/images/eduardo.jpg', systemRole: 'ADMIN' },
  { id: '2', name: 'Nerea F.Elena', role: 'Redacción', imageUrl: '/images/nerea.jpg', systemRole: 'EDITOR' },
  { id: '3', name: 'Manolo Herrera', role: 'Redacción', imageUrl: '/images/manolo.jpg', systemRole: 'EDITOR' },
  { id: '4', name: 'Rubén Sánchez', role: 'Redacción', imageUrl: '/images/ruben.jpg', systemRole: 'EDITOR' },
  { id: '5', name: 'Iris Rodríguez', role: 'Redacción', imageUrl: '/images/iris.jpg', systemRole: 'EDITOR' },
  { id: '6', name: 'Antonio Tortosa', role: 'Redacción', imageUrl: '/images/antonio.jpg', systemRole: 'EDITOR' },
  { id: '7', name: 'Inés Sáez', role: 'Redacción', imageUrl: '/images/ines.jpg', systemRole: 'EDITOR' },
  { id: '8', name: 'Enrique Salazar', role: 'Redacción', imageUrl: '/images/enrique.jpg', systemRole: 'EDITOR' },
];

export const INITIAL_ARTICLES: Article[] = [
  { 
    id: '1009',
    title: `El escritor Rubén Amón ensalza la dimensión taurina de El Puerto en la presentación de “Morante, punto y aparte”`,
    summary: "El teniente de alcalde de Gran Ciudad, Javier Bello, ha acompañado a la Academia de Bellas Artes Santa Cecilia en un acto que refuerza la agenda cultural de la ciudad.",
    content: `<p>El Auditorio Municipal Monasterio San Miguel, de El Puerto de Santa Maria, ha acogido la presentación de “Morante, punto y aparte”, la última obra del periodista y escritor Rubén Amón...</p>`,
    imageUrl: "/images/WhatsApp Image 2026-02-15 at 19.13.43.jpg",
    imageCaption: 'Presentación del libro en el Auditorio',
    photoCredit: 'Manolo Herrera',
    category: Category.ACTUALIDAD,
    authorId: '3', 
    date: new Date("2026-02-16T10:00:00").toISOString(),
    isPublished: true,
    contentImages: []
   },
  {
    id: '235',
    title: 'Sábado en el Carnaval del Toro de Ciudad Rodrigo',
    summary: 'Cuatro orejas y varios novillos aplaudidos en el arrastre en una tarde marcada por el viento, la huella taurina y el debut con entrega de Moisés Fraile.',
    content: '<p>En este sábado de carnaval, Ciudad Rodrigo vivió una tarde con una novillada de Talavante sensacional...</p>',
    imageUrl: '/images/ciud.jpg',
    imageCaption: 'Plaza Mayor durante el festejo',
    photoCredit: 'Tendido Digital',
    contentImages: [],
    category: Category.CRONICAS,
    authorId: '2', 
    date: new Date("2026-02-15T18:00:00").toISOString(),
    isPublished: true,
    bullfightLocation: 'Plaza Mayor de Ciudad Rodrigo',
    bullfightCattle: 'Novillos de las ganaderías de Talavante y un eral de El Pilar.',
    bullfightSummary: 'En este sábado de carnaval, Ciudad Rodrigo vivió una tarde con una novillada de Talavante sensacional, ofreciendo cada uno de ellos un juego más que notable.',
    bullfightResults: [
        { bullfighter: 'Diego Urdiales', result: 'una oreja' },
        { bullfighter: 'Alejandro Talavante', result: 'ovación' },
        { bullfighter: 'Pablo Aguado', result: 'una oreja' },
        { bullfighter: 'El Mene', result: 'una oreja' },
        { bullfighter: 'Moisés Fraile', result: 'ovación' }
    ]
  },
];

const STORAGE_KEYS = {
  ARTICLES: 'td_articles_v4',
  AUTHORS: 'td_authors_v10', 
  ARCHIVE: 'td_archive_v4', 
};

// --- NUEVO: SISTEMA DE CACHÉ EN MEMORIA (RAM) ---
// La clave del rendimiento: Almacena los datos en variables rápidas
// y evita bloqueos del hilo principal al cambiar de página.
let memoryCache = {
    articles: null as Article[] | null,
    archive: null as ArchivedArticle[] | null,
    authors: null as Author[] | null
};

// --- SISTEMA DE AUTO-GUARDADO (AUTO-SYNC) ---
let autoSaveTimer: any = null;
let syncCallback: (() => Promise<void>) | null = null;

export const setSyncCallback = (callback: () => Promise<void>) => {
    syncCallback = callback;
};

export const stopAutoSync = () => {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = null;
    }
};

export const triggerCloudSync = () => {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(async () => {
    try {
      if (syncCallback) {
          console.log("☁️ Auto-sync iniciado...");
          await syncCallback();
      }
    } catch (error) {
      console.error("❌ Error Auto-sync:", error);
    }
  }, 2000);
};

export const getAuthors = (): Author[] => {
  if (memoryCache.authors) return memoryCache.authors; // Lee la RAM al instante

  const stored = localStorage.getItem(STORAGE_KEYS.AUTHORS);
  if (!stored) {
    const initialJson = JSON.stringify(INITIAL_AUTHORS);
    localStorage.setItem(STORAGE_KEYS.AUTHORS, LZString.compressToUTF16(initialJson));
    memoryCache.authors = INITIAL_AUTHORS;
    return INITIAL_AUTHORS;
  }
  
  let parsed;
  try {
      const decompressed = LZString.decompressFromUTF16(stored);
      if (decompressed) {
          parsed = JSON.parse(decompressed);
      } else {
          parsed = JSON.parse(stored);
      }
  } catch (e) {
      parsed = JSON.parse(stored);
  }
  
  if (Array.isArray(parsed) && parsed.length === 0) {
      const initialJson = JSON.stringify(INITIAL_AUTHORS);
      localStorage.setItem(STORAGE_KEYS.AUTHORS, LZString.compressToUTF16(initialJson));
      memoryCache.authors = INITIAL_AUTHORS;
      return INITIAL_AUTHORS;
  }
  
  memoryCache.authors = parsed;
  return parsed;
};

export const saveAuthor = (author: Author, skipSync = false): void => {
  const authors = getAuthors();
  const existingIndex = authors.findIndex((a) => String(a.id) === String(author.id));
  
  const authorToSave = { ...author, lastModified: new Date().toISOString() };

  if (existingIndex >= 0) {
    authors[existingIndex] = authorToSave;
  } else {
    authors.push(authorToSave);
  }
  saveAuthorsToLocal(authors);
  
  if (!skipSync) triggerCloudSync();
};

export const saveAuthorsToLocal = (authors: Author[]): void => {
    memoryCache.authors = authors; // Actualiza la caché
    try {
        const json = JSON.stringify(authors);
        const compressed = LZString.compressToUTF16(json);
        localStorage.setItem(STORAGE_KEYS.AUTHORS, compressed);
    } catch (e: any) {
        if (e.name === 'QuotaExceededError' || e.message?.includes('quota') || e.message?.includes('exceeded')) {
            console.error("Quota exceeded when saving authors.");
            throw new Error("QuotaExceededError");
        } else {
            throw e;
        }
    }
};

export const deleteAuthor = (id: string): void => {
  const authors = getAuthors().filter((a) => String(a.id) !== String(id));
  saveAuthorsToLocal(authors);
  triggerCloudSync();
};

export const getArticles = (): Article[] => {
  if (memoryCache.articles) return memoryCache.articles; // Lectura instantánea

  const stored = localStorage.getItem(STORAGE_KEYS.ARTICLES);
  if (!stored) {
    const initialJson = JSON.stringify(INITIAL_ARTICLES);
    localStorage.setItem(STORAGE_KEYS.ARTICLES, LZString.compressToUTF16(initialJson));
    memoryCache.articles = INITIAL_ARTICLES;
    return INITIAL_ARTICLES;
  }
  
  let articles;
  try {
      const decompressed = LZString.decompressFromUTF16(stored);
      if (decompressed) {
          articles = JSON.parse(decompressed);
      } else {
          articles = JSON.parse(stored);
      }
  } catch (e) {
      articles = JSON.parse(stored);
  }
  
  const updatedArticles = articles.map((a: any) => {
      if (a.contentImages && a.contentImages.length > 0 && typeof a.contentImages[0] === 'string') {
          a.contentImages = a.contentImages.map((img: string) => ({ url: img, caption: '' }));
      }
      return a;
  });
  
  memoryCache.articles = updatedArticles;
  return updatedArticles;
};

export const saveArticlesToLocal = (articles: Article[]): void => {
    memoryCache.articles = articles; // Actualiza la caché en tiempo real
    let currentArticles = [...articles];
    let saved = false;
    
    while (!saved && currentArticles.length > 0) {
        try {
            const json = JSON.stringify(currentArticles);
            const compressed = LZString.compressToUTF16(json);
            localStorage.setItem(STORAGE_KEYS.ARTICLES, compressed);
            saved = true;
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.message?.includes('quota') || e.message?.includes('exceeded')) {
                const publishedArticles = currentArticles.filter(a => a.isPublished);
                if (publishedArticles.length > 1) {
                    publishedArticles.sort((a, b) => new Date(a.lastModified || a.date).getTime() - new Date(b.lastModified || b.date).getTime());
                    const oldestId = publishedArticles[0].id;
                    currentArticles = currentArticles.filter(a => a.id !== oldestId);
                } else {
                    console.error("Quota exceeded and no safe articles left to drop.");
                    throw new Error("QuotaExceededError");
                }
            } else {
                console.error("Error saving active articles:", e);
                throw e;
            }
        }
    }
    
    if (currentArticles.length < articles.length) {
        console.warn(`Dropped ${articles.length - currentArticles.length} articles from local storage due to quota.`);
        memoryCache.articles = currentArticles; 
    }
};

export const getArchivedArticles = (): ArchivedArticle[] => {
    if (memoryCache.archive) return memoryCache.archive; 

    const stored = localStorage.getItem(STORAGE_KEYS.ARCHIVE);
    if (!stored) {
        memoryCache.archive = [];
        return [];
    }
    
    try {
        const decompressed = LZString.decompressFromUTF16(stored);
        if (decompressed) {
            const parsed = JSON.parse(decompressed);
            memoryCache.archive = parsed;
            return parsed;
        } else {
            const parsed = JSON.parse(stored);
            memoryCache.archive = parsed;
            return parsed;
        }
    } catch (e) {
        const parsed = JSON.parse(stored);
        memoryCache.archive = parsed;
        return parsed;
    }
};

export const saveArchivedArticlesToLocal = (archived: ArchivedArticle[]): void => {
    memoryCache.archive = archived; 
    let currentArchive = [...archived];
    let saved = false;
    while (!saved && currentArchive.length > 0) {
        try {
            const json = JSON.stringify(currentArchive);
            const compressed = LZString.compressToUTF16(json);
            localStorage.setItem(STORAGE_KEYS.ARCHIVE, compressed);
            saved = true;
        } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.message?.includes('quota') || e.message?.includes('exceeded')) {
                if (currentArchive.length > 1) {
                    currentArchive.pop();
                } else {
                    console.error("Quota exceeded and no archived articles left to drop.");
                    throw new Error("QuotaExceededError");
                }
            } else {
                console.error("Error saving archive:", e);
                throw e;
            }
        }
    }
    
    if (currentArchive.length < archived.length) {
        console.warn(`Dropped ${archived.length - currentArchive.length} archived articles from local storage due to quota.`);
        memoryCache.archive = currentArchive; 
    }
};

export const saveArticle = (article: Article, skipSync = false): void => {
  const articles = getArticles();
  const existingIndex = articles.findIndex((a) => String(a.id) === String(article.id));
  
  const articleToSave = { ...article, lastModified: new Date().toISOString() };
  
  if (existingIndex >= 0) {
    articles[existingIndex] = articleToSave;
  } else {
    articles.unshift(articleToSave); 
  }
  
  saveArticlesToLocal(articles);
  
  if (!skipSync) triggerCloudSync();
};

export const deleteArticle = (id: string, userId: string = 'system'): void => {
  const articles = getArticles();
  const articleToArchive = articles.find((a) => String(a.id) === String(id));
  
  if (articleToArchive) {
      const archived: ArchivedArticle = {
          ...articleToArchive,
          archivedAt: new Date().toISOString(),
          archivedBy: userId
      };

      const archive = getArchivedArticles();
      const existingArchiveIndex = archive.findIndex(a => String(a.id) === String(id));
      if (existingArchiveIndex >= 0) {
          archive[existingArchiveIndex] = archived;
      } else {
          archive.unshift(archived);
      }
      
      saveArchivedArticlesToLocal(archive);

      const newArticles = articles.filter((a) => String(a.id) !== String(id));
      saveArticlesToLocal(newArticles);
      
      triggerCloudSync();
  }
};

export const restoreArticle = (id: string, skipSync = false): boolean => {
    const archive = getArchivedArticles();
    const articleToRestore = archive.find(a => String(a.id) === String(id));

    if (articleToRestore) {
        const activeArticle: Article = {
            id: String(articleToRestore.id), 
            title: articleToRestore.title,
            summary: articleToRestore.summary,
            content: articleToRestore.content,
            imageUrl: articleToRestore.imageUrl,
            imageCaption: articleToRestore.imageCaption || '', 
            photoCredit: articleToRestore.photoCredit || '',   
            contentImages: articleToRestore.contentImages || [],
            category: articleToRestore.category,
            authorId: String(articleToRestore.authorId), 
            date: articleToRestore.date,
            isPublished: false, 
            
            bullfightLocation: articleToRestore.bullfightLocation || '',
            bullfightCattle: articleToRestore.bullfightCattle || '',
            bullfightSummary: articleToRestore.bullfightSummary || '',
            bullfightResults: articleToRestore.bullfightResults || []
        };

        saveArticle(activeArticle, true);

        const newArchive = archive.filter(a => String(a.id) !== String(id));
        saveArchivedArticlesToLocal(newArchive);
        
        if (!skipSync) triggerCloudSync();
        return true;
    }
    return false;
};

export const getArticleById = (id: string): Article | undefined => {
  return getArticles().find((a) => String(a.id) === String(id));
};
