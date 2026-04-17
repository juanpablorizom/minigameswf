---
name: ui-ux-brain
description: >
  Cerebro maestro de UI/UX design. Úsalo SIEMPRE que el usuario pida diseñar
  interfaces, componentes, pantallas, apps, landing pages, dashboards, o cualquier
  cosa visual. También actívalo cuando el usuario haga vibe coding con frontend,
  pida revisar un diseño, preguntar sobre colores, tipografía, espaciado,
  accesibilidad, sistemas de diseño, wireframes, flujos de usuario, prototipos,
  microinteracciones, o cualquier concepto de UX/UI. Si hay duda: úsalo.
  Aplica también para prompts como "hazlo más bonito", "mejora la UI",
  "¿está bien este diseño?", "crea un componente", o "qué colores uso".
---

# 🧠 Cerebro UI/UX — Guía Maestra de Diseño

Este skill contiene los principios, reglas y decisiones accionables para diseñar
interfaces de alta calidad. Está organizado por capas: desde fundamentos visuales
hasta sistemas completos.

## Cómo usar este skill

Consulta las secciones según el problema:

| Necesidad | Sección |
|-----------|---------|
| El diseño se ve plano o sin jerarquía | § Jerarquía Visual |
| Elegir colores o paleta | § Color |
| Tipografía y textos | § Tipografía |
| Spacing / layout inconsistente | § Espaciado y Grid |
| Botones, inputs, iconos | § Componentes |
| Modo oscuro | § Dark Mode |
| Animaciones y feedback | § Motion |
| Accesibilidad | § A11y |
| Flujos y arquitectura | § UX Estratégico |
| Diseño responsivo | § Responsivo |
| Sistema de diseño / tokens | § Design System |
| Más profundidad en cualquier tema | → `references/fundamentos.md` |

---

## § Signifiers — La interfaz debe hablar sola

El usuario nunca debe leer instrucciones para entender cómo funciona algo.

- **Agrupación**: un contenedor alrededor de elementos indica que están relacionados
- **Selección**: el mismo contenedor con estilo distinto (borde, fondo) = seleccionado
- **Inactividad**: gris claro = inactivo, no hará nada al clic
- **Affordances**: usa hover states, resaltados en navegación, tooltips — que el usuario *vea* que algo es clickeable
- **Acción completada**: no solo cambies el color del botón; añade un chip/toast animado que confirme

---

## § Jerarquía Visual

Regla de oro: el contraste crea jerarquía. Sin contraste, todo parece igual de importante.

### Herramientas de jerarquía (en orden de poder)
1. **Tamaño** — lo más grande manda
2. **Peso tipográfico** — bold > regular > light
3. **Color y saturación** — color llama, gris se retira
4. **Posición** — arriba-izquierda se lee primero
5. **Espacio en blanco** — aislar = jerarquía

### Reglas concretas
- El elemento más importante: grande, bold, arriba, con color
- Precios: alineados a la derecha, con color, arriba de detalles secundarios
- Prefiere iconos + líneas sobre palabras ("→" en vez de "Desde / Hasta")
- Las imágenes crean jerarquía automáticamente — úsalas siempre que puedas
- Si tu diseño parece una hoja de cálculo: falta contraste

---

## § Color

### Paleta base
```
Primario-500  → Color de marca (acciones principales)
Primario-100  → Fondos sutiles, chips, badges
Primario-700  → Hover / pressed states
Primario-900  → Texto sobre fondos claros

Neutros:
  50–200  → Fondos, divisores
  400–600 → Texto secundario, placeholders
  800–900 → Texto principal

Semánticos (reservados, no decorativos):
  Verde   → Éxito, confirmación
  Rojo    → Error, peligro, destructivo
  Amarillo → Advertencia
  Azul    → Información, confianza
```

### Reglas de color
- Empieza con el color primario. Acláralo para fondos, oscurécelo para texto
- El color tiene significado: nunca uses rojo para algo positivo
- Contraste texto normal: ≥ 4.5:1 (WCAG AA)
- Contraste texto grande (+18px bold): ≥ 3:1
- Contraste iconos/UI: ≥ 3:1
- Nunca transmitas información **solo** con color — añade icono o texto

### Dark Mode específico
- **Cero sombras** en dark mode — no funcionan
- Profundidad = **color más claro** para elementos encima del fondo
- Reduce saturación y brillo de chips y badges
- Oscurece ligeramente textos secundarios para crear jerarquía
- Reduce contraste de bordes (no uses negro puro ni blanco puro)

---

## § Tipografía

### Escala para apps/dashboards (densidad alta)
```
Display : 48–64px / weight 700 / tracking -2% / line-height 110%
H1      : 32–40px / weight 600–700
H2      : 24–28px / weight 600
H3      : 18–22px / weight 500–600
Body    : 16px    / weight 400 / line-height 150–160%
Small   : 14px    / weight 400
Caption : 12px    / weight 400
```

> **Regla dashboards/apps**: los tamaños casi nunca superan 24px  
> **Regla landing pages**: máximo 6 tamaños distintos en toda la página

### Hack profesional para títulos
Aplica esto a cualquier heading grande para que se vea inmediatamente profesional:
- `letter-spacing: -2% a -3%`
- `line-height: 110% a 120%`

### Reglas tipográficas
- Una sola fuente sans-serif para toda la app — rara vez necesitas dos
- Longitud de línea óptima: 45–75 caracteres
- Body text: `line-height` 1.5–1.6
- Nunca texto bajo 12px en producción

---

## § Espaciado y Grid

### Sistema base-4 (regla de oro)
Todos los espaciados deben ser múltiplos de 4:
```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px
```
Esto permite dividir siempre a la mitad — consistencia garantizada.

### Grid por dispositivo
```
Mobile:  4 columnas | gutter 16px | margin 16–24px
Tablet:  8 columnas | gutter 20px | margin 24–32px
Desktop: 12 columnas | gutter 24–32px | margin 40–80px
```

### Whitespace — la regla más importante
- Los elementos necesitan respirar. El espacio en blanco no es espacio "perdido"
- Agrupa elementos relacionados **cerca** entre sí
- Separa grupos diferentes con **más** espacio
- El whitespace comunica calidad y lujo

---

## § Componentes

### Botones
```
Padding: horizontal = 2× el vertical
Ej: padding: 10px 20px (ratio 1:2)

Estados mínimos obligatorios:
  Default → Hover → Active/Pressed → Disabled → (Loading si aplica)

Variantes:
  Primary   → 1 por pantalla máximo
  Secondary → acciones alternativas
  Ghost     → sin fondo, borde sutil, reveal en hover
  Destructive → rojo, para acciones irreversibles

Texto: verbo de acción ("Guardar cambios", no "OK")
```

### Iconos
- Tamaño del icono = `line-height` del texto que lo acompaña
- Si `line-height` es 24px → icono 24px
- Iconos sin texto → siempre `aria-label`

### Inputs / Formularios
```
Anatomía:
  Label (siempre visible, no solo placeholder)
  ┌─────────────────────────────┐
  │ Placeholder / Valor         │
  └─────────────────────────────┘
  Helper text / Mensaje de error

Estados: Default → Focus (outline claro) → Error → Success → Disabled

Errores: descriptivos + con solución
  ❌ "Email inválido"
  ✅ "Ingresa un email válido (ej: nombre@correo.com)"
```

### Overlays sobre imágenes
- No oscurezcas toda la imagen con overlay opaco
- Usa **gradiente lineal**: imagen clara → fondo sólido donde va el texto
- Para look moderno: añade **progressive blur** encima del gradiente

### Modales
- Siempre permitir cerrar: X, click en backdrop, tecla Escape
- Máximo 2 acciones (confirmar + cancelar)
- No usar para contenido extenso ni flujos multi-paso
- Gestionar focus trap dentro del modal

### Estados vacíos (Empty States)
```
Estructura:
  1. Ilustración contextual
  2. Título (qué falta)
  3. Descripción (por qué está vacío)
  4. CTA principal (qué hacer)
```

### Sombras
- En **light mode**: reduce opacidad, aumenta blur. Si la sombra es lo primero que notas → demasiado fuerte
- Usa sombras **sutiles** para tarjetas, **fuertes** solo para elementos que flotan (popovers, tooltips, menús)
- En **dark mode**: no uses sombras — usa diferencia de color para profundidad

---

## § Motion y Microinteracciones

### Duraciones
```
Hover / click feedback   : 80–150ms
Transición de componente : 200–300ms
Transición de pantalla   : 300–500ms
Entrada de pantalla      : 400–600ms
```

### Easing
```
Ease Out  (elementos entrando)  : cubic-bezier(0,0,0.2,1)
Ease In   (elementos saliendo)  : cubic-bezier(0.4,0,1,1)
Ease InOut (transiciones UI)    : cubic-bezier(0.4,0,0.2,1)
```

### Reglas de motion
- Toda acción del usuario necesita feedback visual
- "Copiar" → no solo cambiar color; un chip se desliza confirmando la acción
- Animaciones deben ser **intencionales**, no decorativas
- Una animación bien ejecutada > diez microinteracciones dispersas
- Respeta `prefers-reduced-motion` — desactiva animaciones si el usuario lo pide

---

## § Accesibilidad (A11y)

### Mínimo obligatorio (WCAG AA)
- Contraste texto: ≥ 4.5:1
