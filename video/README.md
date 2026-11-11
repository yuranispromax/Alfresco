# Video · Gran Premio de la Calidad (Remotion)

Video vertical **1080×1920 · 30 fps · 15 s (450 frames)** creado a partir de la presentación *Gran premio de la calidad*.

| Escena | Frames | Contenido |
|---|---|---|
| 1 | 0–100 | Semáforo de salida F1 → título |
| 2 | 85–200 | 4 Pit Stops |
| 3 | 185–300 | Mapa de pista + "La calidad no se corre: se construye vuelta a vuelta" |
| 4 | 285–375 | Trofeo, medalla, Licencia Calidosa 2026 |
| 5 | 360–450 | Bandera a cuadros + logo MiRed IPS |

Transiciones: wipe, slide, fade (`@remotion/transitions`). Subtítulos sincronizados en `src/Captions.tsx`.

## Uso

```bash
npm install
npm run clips:download   # descarga clips reales libres (Wikimedia Commons, sin API key) a public/clips/
npm run music            # (opcional) regenera public/audio/musica.wav — música original por código
npm run render           # -> out/video_final.mp4
npm run studio           # vista previa interactiva
```

**Clips reales:** cualquier `.mp4/.webm/.mov` en `public/clips/` se detecta automáticamente
(`scripts/scan-assets.mjs`) y se usa como fondo con zoom/pan vía `<OffthreadVideo>`.
Si la carpeta está vacía, se usa un fondo animado de pista como respaldo.
Fuentes libres sugeridas para descargar a mano: mixkit.co, pixabay.com/videos, pexels.com/videos.

Fuentes Montserrat (SIL OFL) incluidas en `public/fonts`; imágenes de marca tomadas de la presentación.
