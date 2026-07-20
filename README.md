# El Espía Narrador — Biblioteca de audionovelas

Catálogo web estático (HTML + CSS + JavaScript Vanilla, sin frameworks) para el proyecto de audionovelas **El Espía Narrador**. No reproduce audio: cada tarjeta lleva al oyente a la colección correspondiente en Patreon.

```
/
├── index.html
├── style.css
├── script.js
├── novelas.json      ← toda la información del catálogo vive aquí
├── README.md
└── img/
    ├── logo/         (logo y favicon)
    ├── covers/        (portadas, formato vertical 2:3)
    ├── banners/       (imágenes anchas para el modal)
    └── icons/
```

---

## 1. Cómo agregar una novela nueva

No se toca el HTML. Basta con abrir `novelas.json` y agregar un nuevo objeto al final de la lista (recuerda la coma antes de la llave `{` si no es el último elemento):

```json
{
  "id": 11,
  "titulo": "Nombre de tu novela",
  "autor": "El Espía Narrador",
  "genero": "Fantasía",
  "estado": "En emisión",
  "capitulos": 12,
  "descripcion": "Una frase corta que resume la historia.",
  "sinopsis": "Un párrafo más largo que aparece en la tarjeta al pasar el mouse y en el modal de detalle.",
  "cover": "img/covers/nombre-archivo.webp",
  "banner": "img/banners/nombre-archivo.webp",
  "patreon": "https://www.patreon.com/cw/ElEspiaNarrador/collections/tu-coleccion",
  "fecha": "2026-07-19",
  "destacada": false,
  "adulto": false,
  "etiquetas": ["Etiqueta 1", "Etiqueta 2"]
}
```

Campos importantes:

- **`genero`**: debe coincidir exactamente con uno de los filtros existentes (`Ciencia ficción`, `Fantasía`, `Apocalipsis`, `Cultivación`, `Romance`, `Acción`). Si usas un género nuevo, agrega también un botón en la sección de filtros de `index.html` (es la única vez que tocarías el HTML).
- **`estado`**: usa `"En emisión"` o `"Completada"` tal cual, ya que los filtros de estado buscan ese texto exacto.
- **`fecha`**: formato `AAAA-MM-DD`, se usa para el orden "Más recientes".
- **`adulto`**: `true` o `false`. Si es `true`, la tarjeta muestra una insignia roja "+18" y la novela aparece al usar el filtro "+18". Déjalo en `false` si no aplica.

En cuanto guardes el archivo y recargues la página, la novela aparecerá automáticamente en el catálogo, en el buscador, en los filtros y en el orden. El sitio está preparado para manejar cientos o miles de entradas sin ningún cambio adicional.

---

## 2. Cómo cambiar el logo

1. Reemplaza el archivo `img/logo/espia-logo.svg` por tu propio logo (puede ser `.svg`, `.png` o `.webp`).
2. Si cambias la extensión, actualiza la ruta en `index.html`:

```html
<img src="img/logo/tu-logo.png" alt="El Espía Narrador" width="180" height="49">
```

3. El favicon (el ícono de la pestaña del navegador) está en `img/logo/favicon.svg` y se referencia en el `<head>` de `index.html`.

---

## 3. Cómo cambiar los colores

Todos los colores del sitio están centralizados como variables al inicio de `style.css`:

```css
:root{
  --bg: #0b0b0b;        /* fondo general */
  --panel: #181818;     /* paneles (header, chips) */
  --card: #202020;      /* tarjetas del catálogo */
  --gold: #D4AF37;       /* color principal */
  --gold-light: #FFD54F; /* color secundario / hover */
  --text: #f2f2f2;       /* texto principal */
  --text-muted: #b3b3ad; /* texto secundario */
}
```

Cambia estos valores y todo el sitio (botones, bordes, chips, modal) se actualiza automáticamente, ya que ningún color está escrito directamente en otro lugar del CSS.

---

## 4. Cómo cambiar las imágenes (portadas y banners)

- **Portadas** (`cover`): formato vertical, relación de aspecto 2:3 (por ejemplo 800×1200 px). Se muestran en la cuadrícula del catálogo y en el modal.
- **Banners** (`banner`): formato horizontal ancho (por ejemplo 1600×500 px). Se usan como imagen de fondo en la parte superior del modal de detalle.
- Formato recomendado: **WebP**, para que el sitio cargue rápido.
- Guarda los archivos en `img/covers/` y `img/banners/` respectivamente, y apunta a ellos desde `novelas.json` con la ruta relativa (ej. `"cover": "img/covers/mi-novela.webp"`).
- Todas las imágenes usan `loading="lazy"`, así que no se descargan hasta que el usuario se acerca a ellas al hacer scroll.

Este proyecto incluye portadas y banners de ejemplo en formato `.svg` para que puedas ver el diseño funcionando de inmediato; reemplázalos por tus propias artes cuando estén listas.

---

## 5. Cómo subir el proyecto a GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado si tienes GitHub Pro).
2. Sube todos los archivos de esta carpeta a la raíz del repositorio (o a una carpeta `docs/`, según prefieras).
3. En el repositorio, ve a **Settings → Pages**.
4. En **Source**, elige la rama (`main`) y la carpeta (`/root` o `/docs`).
5. Guarda. GitHub te dará una URL como `https://tu-usuario.github.io/tu-repositorio/`.
6. Cada vez que hagas `git push` con cambios (por ejemplo, un `novelas.json` actualizado), el sitio se actualizará solo en unos minutos.

---

## 6. Cómo subir el proyecto a Cloudflare Pages

1. Sube el proyecto a un repositorio de GitHub o GitLab (los mismos archivos del paso anterior).
2. Entra a [pages.cloudflare.com](https://pages.cloudflare.com) e inicia sesión.
3. Elige **Create a project → Connect to Git** y selecciona tu repositorio.
4. En la configuración de build:
   - **Framework preset:** ninguno / `None`.
   - **Build command:** déjalo vacío.
   - **Build output directory:** `/` (la raíz del proyecto).
5. Haz clic en **Save and Deploy**. Cloudflare te dará una URL tipo `https://tu-proyecto.pages.dev`.
6. Cada nuevo `push` a la rama conectada vuelve a desplegar el sitio automáticamente.

---

## Notas técnicas

- El sitio es 100% estático: no hay backend, no hay base de datos, no se guarda ningún dato del usuario.
- La búsqueda ignora mayúsculas/minúsculas y tildes, y filtra en tiempo real por título, autor, género y etiquetas.
- Los filtros y el orden se aplican en el navegador, sobre los datos ya cargados desde `novelas.json`.
- El código respeta la preferencia del sistema `prefers-reduced-motion` para desactivar animaciones si el usuario así lo eligió.
