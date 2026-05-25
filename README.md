# Catrachópolis

Juego de tablero multijugador hondureño en tiempo real inspirado en San Pedro Sula.

## Aviso De Uso

- Proyecto educativo, gratuito y sin fines comerciales.
- No contiene compras, pagos ni monetizacion.
- `Catrachópolis` es una identidad original e independiente del proyecto.
- No esta afiliado, patrocinado ni respaldado por marcas comerciales de juegos de mesa.
- La intencion educativa/no comercial no sustituye una revision legal si el proyecto se distribuye ampliamente.

## Ejecutar Localmente

Requiere Node.js 20 a 24.

```bash
npm install
npm start
```

Abre `http://localhost:3000`.

Para desarrollo con reinicio automatico:

```bash
npm run dev
```

## Configuracion

Copia `.env.example` a `.env` para personalizar el servidor local:

```env
PORT=3000
HOST=0.0.0.0
```

La ruta `GET /health` responde el estado basico usado por el hosting.

## Publicar En Render

El repositorio incluye `render.yaml`, listo para crear un Web Service de Node con
Socket.IO, health checks y plan gratuito.

1. Sube este proyecto a un repositorio de GitHub.
2. En Render, selecciona **New > Blueprint** y conecta el repositorio.
3. Render detectara `render.yaml`; confirma la creacion del servicio `gamebeta`.
4. Cuando termine el despliegue, abre la URL publica asignada por Render.

El juego mantiene salas y partidas en memoria del proceso. Si el servidor se
reinicia o escala a mas de una instancia, las partidas activas no se conservan.

## Subir A GitHub

```bash
git init
git add .
git commit -m "Preparar Gamebeta para despliegue"
git branch -M main
git remote add origin https://github.com/USERNAME/Gamebeta.git
git push -u origin main
```

## Estructura

- `server.js`: servidor Express y eventos Socket.IO.
- `public/`: interfaz web, estilos y recursos.
- `render.yaml`: configuracion de despliegue.
- `NOTICE.md`: aviso de uso educativo y propiedad intelectual.
