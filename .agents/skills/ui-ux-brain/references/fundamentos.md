# Referencia Profunda: UX Estratégico y Procesos

Este archivo se consulta cuando se necesita profundidad en investigación, arquitectura,
flujos, prototipado, testing o métricas. El SKILL.md principal cubre los principios
visuales day-to-day.

---

## Tabla de Contenido

1. [Investigación de Usuario](#investigación-de-usuario)
2. [Artefactos de Investigación](#artefactos-de-investigación)
3. [Arquitectura de Información](#arquitectura-de-información)
4. [Flujos y Wireframes](#flujos-y-wireframes)
5. [Prototipado](#prototipado)
6. [Pruebas de Usabilidad](#pruebas-de-usabilidad)
7. [Métricas UX](#métricas-ux)
8. [Herramientas](#herramientas)

---

## Investigación de Usuario

### Cuándo usar cada método

| Pregunta | Método | Muestra |
|----------|--------|---------|
| ¿Por qué los usuarios hacen X? | Entrevistas 1:1 | 5–8 personas |
| ¿Cuántos usuarios tienen el problema? | Encuesta | 100+ respuestas |
| ¿Cómo usan el producto en contexto real? | Observación contextual | 3–5 sesiones |
| ¿Pueden completar esta tarea? | Prueba de usabilidad | 5 usuarios detectan 85% de problemas |
| ¿Qué variante convierte más? | A/B test | Significancia estadística |
| ¿Dónde se atascan? | Heatmaps + session recording | Mixpanel, Hotjar |

### Entrevistas — Guía rápida
- Preguntas abiertas: "Cuéntame la última vez que intentaste [tarea]"
- Nunca preguntes "¿usarías esto?" (siempre dicen sí)
- Escucha el comportamiento real, no las intenciones
- 30–60 min por entrevista
- Graba con permiso, no solo tomes notas

---

## Artefactos de Investigación

### Persona
```
Nombre ficticio + foto representativa
─────────────────────────────────────
Edad / Ocupación / Ciudad
─────────────────────────────────────
MOTIVACIONES          FRUSTRACIONES
• ...                 • ...
─────────────────────────────────────
METAS                 COMPORTAMIENTOS
• ...                 • ...
─────────────────────────────────────
CITA: "..."
```

Errores comunes:
- Basarlas en suposiciones (no en datos reales)
- Crear más de 4 (2–3 es suficiente)
- No compartirlas con el equipo de desarrollo

### Jobs to Be Done (JTBD)
```
Cuando [SITUACIÓN],
quiero [MOTIVACIÓN],
para poder [RESULTADO ESPERADO].
```

### Customer Journey Map

| Etapa | Awareness | Consideración | Decisión | Uso | Retención |
|-------|-----------|---------------|----------|-----|-----------|
| Acciones | | | | | |
| Pensamientos | | | | | |
| Emociones | 😐 | 🤔 | 😰 | 😊 | 😍 |
| Pain Points | | | | | |
| Oportunidades | | | | | |

---

## Arquitectura de Información

### Card Sorting
- **Abierto**: el usuario crea sus propias categorías
- **Cerrado**: el usuario ubica tarjetas en categorías predefinidas

### Tree Testing
Valida si los usuarios encuentran contenido en la estructura de navegación.

### Sitemap básico
```
Home
├── Sección A
│   ├── Sub A1
│   └── Sub A2
├── Sección B
└── Contacto
```

---

## Flujos y Wireframes

### Tipos de flujos
- **User Flow**
- **Task Flow**
- **Screen Flow**

### Fidelidad correcta según objetivo
| Objetivo | Fidelidad | Herramienta |
|----------|-----------|-------------|
| Explorar ideas rápido | Lo-fi papel | Papel + lápiz |
| Validar flujos y layout | Mid-fi digital | Figma (grises) |
| Prueba de usabilidad | Hi-fi | Figma con estilos |
| Demo al cliente | Hi-fi animado | Figma + ProtoPie |

### Anotaciones en wireframes
Documenta:
- comportamientos de interacción
- estados condicionales
- reglas de negocio
- contenido dinámico vs estático

---

## Prototipado

### Herramientas por caso
| Caso | Herramienta |
|------|-------------|
| 90% de los prototipos | Figma |
| Microinteracciones avanzadas | ProtoPie |
| Prototipo código-like | Framer |
| Demo rápido para stakeholders | Figma + Loom |

---

## Pruebas de Usabilidad

### Heurísticas de Nielsen
1. **Visibilidad del estado**
2. **Mundo real**
3. **Control y libertad**
4. **Consistencia**
5. **Prevención de errores**
6. **Reconocer antes que recordar**
7. **Flexibilidad**
8. **Minimalismo**
9. **Recuperación de errores**
10. **Ayuda**

### System Usability Scale (SUS)
10 preguntas, escala 1–5. Score 0–100.

---

## Métricas UX

### Framework HEART
| Dimensión | Qué mide | Ejemplo de métrica |
|-----------|---------|-------------------|
| **H**appiness | Satisfacción subjetiva | CSAT, NPS, SUS |
| **E**ngagement | Nivel de uso | Sesiones/semana |
| **A**doption | Nuevos usuarios/features | Registros |
| **R**etention | Usuarios que vuelven | Churn rate |
| **T**ask Success | Eficiencia en tareas | Completion rate |

### KPIs prioritarios
- **Task Completion Rate**
- **Time on Task**
- **Error Rate**
- **NPS**
- **Conversion Rate**

---

## Herramientas

### Diseño
| Herramienta | Fortaleza |
|-------------|-----------|
| Figma | Diseño + prototipo + colaboración |
| ProtoPie | Animaciones complejas |
| Framer | Diseño + código para demos |

### Investigación
| Herramienta | Uso |
|-------------|-----|
| Maze | Tests no moderados |
| Hotjar | Heatmaps, recordings |
| Optimal Workshop | Card sorting, tree testing |
| Dovetail | Repositorio de insights |
