# Invitación · Gran Premio de la Calidad · MiRed IPS (Remotion)

Video vertical **1080×1920 · 30 fps · ~68 s** con voz en off, música original, subtítulos y fuente institucional **Volkswagen Serial**.

| Escena | Contenido |
|---|---|
| Intro | Semáforo F1 + mascota → "Gran Premio de la Calidad" (Día Mundial de la Calidad) |
| Objetivo | 7 pilares de la cultura de calidad, sincronizados con la voz |
| Vuelta 1 · 30 NOV | Recorrido por sedes: Paso Palmas, Paso Galán, Camino Ciudadela · 8:30 a. m. – 1:00 p. m. |
| Vuelta 2 · 2 DIC | Pit Lane: experiencias exitosas · Auditorio Rómulo Rodado, CUD Adelita de Char · 8:30 a. m. – 1:00 p. m. |
| Gran final · 3 DIC | La Gran Carrera de la Calidad · Auditorio Rómulo Rodado y Lobby, CUD Adelita de Char · 8:00 a. m. – 4:30 p. m. |
| Frase | "La meta no es llegar primero. Es avanzar juntos, de forma segura y haciendo las cosas bien." |
| Cierre | ¡Te esperamos en la pista! + fechas + mascota + logos |

Ilustraciones (carro F1, pista, trofeo, medalla, mascota) dibujadas en código en `src/art.tsx`.

## Uso

```bash
npm install
# Fuente: copia los .otf de Volkswagen Serial a public/fonts/ (no se publican en git por licencia)
npm run voice            # (opcional) regenera la voz desde src/guion.json
npm run music            # (opcional) regenera la música original
npm run render           # -> out/video_final.mp4
npm run studio           # vista previa interactiva
```

Para cambiar el texto de la voz: edita `src/guion.json` y ejecuta `npm run voice && npm run music && npm run render`.

Clips reales opcionales: cualquier `.mp4` en `public/clips/` se usa como fondo con zoom/pan (`<OffthreadVideo>`).
