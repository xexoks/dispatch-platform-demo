# Consola de Preparación de Despacho · DEMO

Consola web **de demostración** para preparar el despacho de un evento: se registra un evento con
coordenadas, se ubica en un mapa interactivo y se calculan las bases más cercanas con su distancia y rumbo.

Es un proyecto de **portafolio** de desarrollo full stack (en esta primera versión, solo frontend).

> [!IMPORTANT]
> **Todos los datos son ficticios y están marcados como DEMO.**
> Las bases ("Base DEMO Alfa", "Base DEMO Bravo"…) y sus coordenadas se inventaron para esta demo, ubicadas de
> forma aproximada sobre una grilla redondeada dentro de una "Zona DEMO Chile Central".
> **No representan instalaciones reales ni ubicaciones operacionales**, y el proyecto no tiene relación con ninguna
> organización, institución ni sistema real.

---

## Funcionalidades

| # | Función | Detalle |
|---|---------|---------|
| 1 | Formulario de evento | Nombre, tipo, prioridad, latitud y longitud en grados decimales (WGS84). Se valida por campo y acepta punto o coma decimal. |
| 2 | Mapa interactivo | Mapa vectorial MapLibre con tema oscuro. Con un clic en el mapa se fija la ubicación y se rellena el formulario. Muestra las coordenadas bajo el cursor y la escala. |
| 3 | Ficha del evento | ID `DEMO-EVT-0001`, tipo, prioridad, hora de creación y coordenadas en decimal y en GMS. Permite copiar las coordenadas. |
| 4 | Bases cercanas | Las 4 bases DEMO más cercanas, con distancia ortodrómica (km) y rumbo inicial (° y rosa de 16 puntos). Se dibujan en el mapa con líneas de rumbo. |
| 5 | Módulos futuros | Tarjetas **Recursos**, **Meteorología** y **Cobertura** marcadas como *Próximamente*. |
| 6 | Diseño | Interfaz oscura, sobria y operacional, adaptable a escritorio, tablet y móvil. |

## Stack

- **React 19** + **TypeScript** (modo `strict`)
- **Vite** (servidor de desarrollo y build)
- **MapLibre GL JS** (mapa vectorial, sin tokens)
- **OpenFreeMap**: estilo `dark` público, **sin claves de API**
- **Vitest** (pruebas unitarias) y **ESLint** (`typescript-eslint` y `react-hooks`)
- Sin backend: el estado vive en memoria del navegador y se pierde al recargar.

## Requisitos

- **Node.js ≥ 22.13** (lo exigen Vite, Vitest y ESLint en las versiones usadas)
- npm ≥ 10
- Conexión a internet para descargar las teselas del mapa base. Sin conexión, el formulario y los cálculos
  siguen funcionando y la app muestra un aviso.

## Instalación y uso

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>.

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Chequeo de tipos y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción en local |
| `npm run typecheck` | Solo el chequeo de tipos de TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Pruebas unitarias (Vitest) |

No se necesitan variables de entorno ni archivos `.env`.

## Estructura

```
src/
├── App.tsx                    # Composición del layout y estado compartido formulario ↔ mapa
├── main.tsx                   # Punto de entrada
├── types/dispatch.ts          # Tipos del dominio: Coordinates, DispatchEvent, Base, NearbyBase
├── data/demoBases.ts          # Catálogo FICTICIO "Zona DEMO Chile Central" (12 bases)
├── lib/
│   ├── geo.ts                 # Haversine, rumbo, rosa de 16 puntos, validación y formato GMS
│   ├── nearestBases.ts        # Selección de las N bases más cercanas
│   └── *.test.ts              # Pruebas unitarias
├── hooks/useDispatchEvent.ts  # Estado del evento activo y sus bases cercanas
├── components/
│   ├── layout/TopBar.tsx      # Barra superior, insignia DEMO y reloj
│   ├── EventForm.tsx          # Formulario con validación
│   ├── MapView.tsx            # Integración con MapLibre (capas GeoJSON y marcadores)
│   ├── EventCard.tsx          # Ficha del evento
│   ├── NearbyBasesList.tsx    # Lista de bases cercanas
│   ├── ComingSoonCard.tsx     # Tarjetas "Próximamente"
│   └── icons.tsx              # Iconos SVG propios
└── styles/
    ├── tokens.css             # Tokens de diseño (colores, radios, tipografías)
    └── global.css             # Estilos globales y de componentes
```

## Cálculos geográficos

Todos los cálculos están en [`src/lib/geo.ts`](src/lib/geo.ts) y tienen pruebas unitarias.

- **Distancia:** fórmula de *haversine* sobre una esfera de radio medio 6371,0088 km. Es una distancia en
  línea recta (ortodrómica): **no considera rutas, relieve ni accesos**.
- **Rumbo:** rumbo inicial (azimut) desde el evento hacia cada base, en grados `[0, 360)` medidos desde el
  norte en sentido horario. Se convierte a la rosa de 16 puntos en español (`N, NNE, NE … O, ONO, NO, NNO`).
- **Bases cercanas:** se calcula la distancia a todas las bases del catálogo, se ordenan y se toman las 4
  primeras. Con un catálogo pequeño, O(n log n) es más que suficiente.
- **Validación:** latitud en `[-90, 90]` y longitud en `[-180, 180]`, en grados decimales.

## Decisiones técnicas

- **Sin backend en v0.1.** Así la demo se ejecuta con `npm install && npm run dev`, sin infraestructura. El
  dominio (`types/`, `lib/`) no depende de React, lo que facilita moverlo a una API más adelante.
- **Mapa sin claves.** Se usa OpenFreeMap porque es abierto y no requiere tokens, así que no hay secretos en el
  repositorio.
- **Worker de MapLibre.** MapLibre 6 se distribuye como módulos ES y carga su *web worker* relativo a su propio
  módulo, ruta que el empaquetado de Vite no conserva. Se importa con
  `maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url` y se registra con `setWorkerUrl()`, de modo que
  funciona tanto en desarrollo como en producción.
- **Integración imperativa del mapa.** El mapa se crea una sola vez. Bases y líneas de rumbo son fuentes
  GeoJSON que se actualizan con `setData()`, y los marcadores de evento y borrador son elementos HTML. Así se
  evitan recrear el mapa en cada render.
- **Estado compartido formulario ↔ mapa.** Las coordenadas en borrador viven en `App` como texto. Un clic en el
  mapa rellena el formulario, y lo que se escribe en el formulario mueve el marcador.
- **Accesibilidad.** Formularios con `label`, errores enlazados con `aria-describedby`, foco visible y respeto
  de `prefers-reduced-motion`.

## Mapa base y atribución

Las teselas y el estilo provienen de [OpenFreeMap](https://openfreemap.org), con datos de
[OpenMapTiles](https://openmaptiles.org) y © colaboradores de [OpenStreetMap](https://www.openstreetmap.org/copyright).
La atribución se muestra siempre en la esquina inferior derecha del mapa.

## Hoja de ruta

- [ ] Backend (API REST) con persistencia de eventos
- [ ] **Recursos:** disponibilidad simulada por base
- [ ] **Meteorología:** viento, temperatura y humedad simulados en el punto del evento
- [ ] **Cobertura:** capa simulada de cobertura de comunicaciones
- [ ] Historial de eventos y exportación
- [ ] Pruebas de componentes (Testing Library) y E2E (Playwright)

## Limitaciones conocidas

- Los datos se pierden al recargar la página (no hay persistencia).
- El catálogo de bases es fijo. Si el evento queda lejos de la Zona DEMO, la lista muestra igual las 4 más
  cercanas, aunque estén a cientos de kilómetros.
- El mapa base depende de un servicio público externo.

## Derechos

© 2026. Todos los derechos reservados.
El código se publica solo para que pueda consultarse como portafolio. No se concede licencia de uso,
copia, modificación ni distribución sin autorización expresa del autor.
