const fs = require('fs');
const path = require('path');

// Cargamos tu backup de 40MB
const data = JSON.parse(fs.readFileSync('./backup.json', 'utf8'));

console.log(`Procesando ${data.articles.length} noticias...`);

data.articles = data.articles.map((article, index) => {
    if (article.image && article.image.startsWith('data:image')) {
        // Extraemos la extensión (jpg, png, etc)
        const extension = article.image.split(';')[0].split('/')[1];
        const fileName = `noticia-${article.id || index}.${extension}`;
        const filePath = path.join(__dirname, 'public/images/noticias', fileName);

        // Convertimos el texto Base64 en un archivo real
        const base64Data = article.image.replace(/^data:image\/\w+;base64,/, "");
        fs.writeFileSync(filePath, base64Data, 'base64');

        // IMPORTANTE: Sustituimos la imagen pesada por la ruta del archivo
        article.image = `/images/noticias/${fileName}`;
        console.log(`✅ Imagen extraída: ${fileName}`);
    }
    return article;
});

// Guardamos el nuevo db.json ultra ligero
fs.writeFileSync('./db_ligero.json', JSON.stringify(data));
console.log("¡LISTO! El archivo 'db_ligero.json' ahora pesa poquísimo y las fotos están en /public/images/noticias/");
