import React from 'react';
import { Article, Author, Category } from '../types';
import { X, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PreviewModalProps {
  article: Article;
  author?: Author;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ article, author, onClose }) => {
  // Formatear fecha al estilo español
  const formattedDate = new Date(article.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="bg-brand-red text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
              Vista Previa
            </span>
            <span className="text-sm text-gray-500 font-medium">
              Así se verá en tendidodigital.es
            </span>
          </div>
          <div className="flex items-center gap-3">
            {article.isPublished && (
              <a 
                href={`https://tendidodigital.es/noticia/${article.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-brand-red hover:text-red-700 transition-colors"
              >
                <ExternalLink size={16} />
                Ver en la web real
              </a>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido de la Vista Previa (Simulando la web real) */}
        <div className="overflow-y-auto p-0 m-0 bg-white">
          <div className="max-w-3xl mx-auto py-8 px-6 md:px-8">
            
            {/* Categoría */}
            <div className="mb-4">
              <span className="text-brand-red font-bold uppercase tracking-widest text-sm">
                {article.category === Category.CRONICAS ? 'Crónica' : 
                 article.category === Category.ENTREVISTAS ? 'Entrevista' : 
                 article.category === Category.OPINION ? 'Opinión' : 'Noticia'}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 font-serif">
              {article.title}
            </h1>

            {/* Resumen / Entradilla */}
            {article.summary && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
                {article.summary}
              </p>
            )}

            {/* Meta info (Autor y Fecha) */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
              {author?.imageUrl ? (
                <img src={author.imageUrl} alt={author.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                  {author?.name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{author?.name || 'Redacción'}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>

            {/* Imagen Principal */}
            {article.imageUrl && (
              <div className="mb-10">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-auto rounded-xl shadow-md object-cover max-h-[500px]"
                />
                {(article.imageCaption || article.photoCredit) && (
                  <div className="mt-3 text-sm text-gray-500 flex justify-between">
                    <span>{article.imageCaption}</span>
                    {article.photoCredit && <span className="italic">Foto: {article.photoCredit}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Ficha Técnica (Solo Crónicas) */}
            {article.category === Category.CRONICAS && (article.bullfightLocation || article.bullfightCattle) && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-200 pb-2">Ficha del Festejo</h3>
                <div className="space-y-3 text-gray-700">
                  {article.bullfightLocation && (
                    <p><span className="font-semibold">Plaza:</span> {article.bullfightLocation}</p>
                  )}
                  {article.bullfightCattle && (
                    <p><span className="font-semibold">Ganadería:</span> {article.bullfightCattle}</p>
                  )}
                  {article.bullfightSummary && (
                    <p><span className="font-semibold">Resumen:</span> {article.bullfightSummary}</p>
                  )}
                  {article.bullfightResults && article.bullfightResults.length > 0 && (
                    <div className="mt-4">
                      <span className="font-semibold block mb-2">Resultado:</span>
                      <ul className="list-disc pl-5 space-y-1">
                        {article.bullfightResults.map((res, idx) => (
                          <li key={idx}>
                            <span className="font-medium">{res.bullfighter}:</span> {res.result}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contenido Principal (HTML) */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-brand-red hover:prose-a:text-red-800 prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Galería de Imágenes */}
            {article.contentImages && article.contentImages.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-2xl font-bold font-serif mb-6 text-gray-900">Galería de Imágenes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {article.contentImages.map((img, idx) => {
                    // Manejar compatibilidad hacia atrás si img es solo un string
                    const url = typeof img === 'string' ? img : img.url;
                    const caption = typeof img === 'string' ? '' : img.caption;
                    const credit = typeof img === 'string' ? '' : img.credit;

                    return (
                      <div key={idx} className="flex flex-col">
                        <img 
                          src={url} 
                          alt={caption || `Imagen de galería ${idx + 1}`} 
                          className="w-full h-auto rounded-xl shadow-md object-cover aspect-video"
                        />
                        {(caption || credit) && (
                          <div className="mt-2 text-sm text-gray-500 flex justify-between">
                            <span>{caption}</span>
                            {credit && <span className="italic">Foto: {credit}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
