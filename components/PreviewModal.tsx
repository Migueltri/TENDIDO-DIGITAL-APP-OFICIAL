import React from 'react';
import { Article, Author } from '../types';
import { X, Calendar, User, Tag } from 'lucide-react';

interface PreviewModalProps {
  article: Article;
  author?: Author;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ article, author, onClose }) => {
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        
        {/* Header del Modal */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Vista Previa de la Noticia
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido de la Vista Previa (Scrollable) */}
        <div className="overflow-y-auto flex-1 p-6 md:p-10 bg-white">
          <article className="max-w-3xl mx-auto">
            
            {/* Categoría */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-wider rounded-full">
                {article.category}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight mb-6 font-serif">
              {article.title}
            </h1>

            {/* Metadatos (Autor y Fecha) */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
              {author && (
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <User size={16} />
                    </div>
                  )}
                  {author.name}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {formatDate(article.date)}
              </div>
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag size={16} />
                  <span>{article.tags.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Imagen Principal */}
            {article.imageUrl && (
              <figure className="mb-10 rounded-xl overflow-hidden shadow-md">
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-auto object-cover max-h-[500px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                  }}
                />
              </figure>
            )}

            {/* Contenido HTML */}
            <div 
              className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </article>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};


export default PreviewModal;
