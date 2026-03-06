import heic2any from 'heic2any';

/**
 * Servicio de utilidad para procesar imágenes antes de subirlas.
 * Reduce el tamaño y la calidad para optimizar el rendimiento de GitHub API.
 * Ahora incluye soporte nativo para fotos .HEIC de iPhone.
 */

export const compressImage = async (file: File, maxWidth = 1200, quality = 0.8): Promise<string> => {
    let fileToProcess: File | Blob = file;

    // 1. Detectar si es una imagen nativa de Apple (.HEIC o .HEIF)
    const fileName = file.name ? file.name.toLowerCase() : '';
    if (file.type === 'image/heic' || file.type === 'image/heif' || fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
        try {
            // Traducir el archivo de Apple a un formato que el navegador entienda (JPEG)
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: quality
            });
            
            // heic2any puede devolver un array en raras ocasiones. Cogemos el primero si es así.
            fileToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        } catch (error) {
            console.error("Error convirtiendo formato HEIC a JPEG:", error);
            throw new Error("No se pudo procesar el formato de la foto del iPhone. Intenta usar otra imagen.");
        }
    }

    // 2. Proceso normal de compresión por Canvas (para todas las fotos)
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileToProcess);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                const elem = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calcular nuevas dimensiones manteniendo ratio
                if (width > maxWidth) {
                    height = height * (maxWidth / width);
                    width = maxWidth;
                }

                elem.width = width;
                elem.height = height;

                const ctx = elem.getContext('2d');
                if (!ctx) {
                    reject(new Error("No se pudo obtener el contexto del canvas"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a JPEG comprimido (Base64) final
                const dataUrl = elem.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
