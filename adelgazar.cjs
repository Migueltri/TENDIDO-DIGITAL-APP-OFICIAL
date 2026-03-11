const fs = require('fs');
const path = require('path');

// RUTAS CORREGIDAS SEGÚN TU CAPTURA
const backupPath = './public/backup.json'; 
const outputPath = './public/data/db.json'; // Lo guardamos directo donde debe ir
const imagesDir = path.join(__dirname, 'public/images/noticias');

if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

if (!fs.existsSync(backupPath)) {
    console.error("❌ ERROR: No se encuentra el archivo en " + backupPath);
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
console.log(`🚀 Procesando ${data.articles.length} noticias...`);

let imagenesExtraidas = 0;

data.articles = data.articles.map((article, index) => {
    // CAMBIADO A imageUrl QUE ES COMO SALE EN TU FOTO
    if (article.imageUrl && article.imageUrl.length > 100) {
        try {
            const extension = article.imageUrl.split(';')[0].split('/')[1] || 'jpg';
            const fileName = `noticia-${article.id || index}.${extension}`;
            const filePath = path.join(imagesDir, fileName);

            const base64Data = article.imageUrl.replace(/^data:image\/\w+;base64,/, "");
            fs.writeFileSync(filePath, base64Data, 'base64');

            // Sustituimos imageUrl por la ruta del archivo
            article.imageUrl = `/images/noticias/${fileName}`;
            imagenesExtraidas++;
        } catch (err) {
            console.error(`❌ Error en noticia ${index}:`, err.message);
        }
    }
    return article;
});

fs.writeFileSync(outputPath, JSON.stringify(data));

console.log("----------------------------------------------");
console.log(`✅ ¡ÉXITO TOTAL!`);
console.log(`📸 Imágenes extraídas: ${imagenesExtraidas}`);
console.log(`💾 Archivo guardado en: ${outputPath}`);
console.log(`⚖️ Nuevo peso: ${Math.round(fs.statSync(outputPath).size / 1024)} KB`);
console.log("----------------------------------------------");