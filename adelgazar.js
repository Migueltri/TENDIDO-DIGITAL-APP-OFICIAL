const fs = require('fs');
const path = require('path');

const backupPath = './backup.json';
const outputPath = './db_ligero.json';
const imagesDir = path.join(__dirname, 'public/images/noticias');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

const rawData = fs.readFileSync(backupPath, 'utf8');
const data = JSON.parse(rawData);

console.log(`🧐 Analizando ${data.articles.length} noticias...`);

let imagenesExtraidas = 0;

data.articles = data.articles.map((article, index) => {
    // Si la propiedad image existe y es un texto muy largo (más de 100 caracteres)
    if (article.image && article.image.length > 100) {
        try {
            // Generamos un nombre único
            const fileName = `noticia-${article.id || index}.jpg`;
            const filePath = path.join(imagesDir, fileName);

            // Limpiamos el prefijo Base64 si existe, si no, lo tomamos tal cual
            const base64Data = article.image.replace(/^data:image\/\w+;base64,/, "");
            
            // Escribimos el archivo físico
            fs.writeFileSync(filePath, base64Data, 'base64');

            // SUSTITUIMOS EL TEXTO POR LA RUTA (Esto es lo que reduce el peso)
            article.image = `/images/noticias/${fileName}`;
            imagenesExtraidas++;
        } catch (err) {
            console.error(`❌ Error en noticia ${index}:`, err.message);
        }
    }
    return article;
});

// Guardamos el JSON (esta vez sin espacios innecesarios para que pese menos aún)
fs.writeFileSync(outputPath, JSON.stringify(data));

console.log("----------------------------------------------");
console.log(`✅ ¡OPERACIÓN COMPLETADA!`);
console.log(`📸 Imágenes convertidas a archivos: ${imagenesExtraidas}`);
console.log(`💾 Nuevo peso estimado: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
console.log("----------------------------------------------");
