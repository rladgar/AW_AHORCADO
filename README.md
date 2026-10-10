# UNIDAD 1. Punto de partida. Dónde estamos?

# [Enlace al Juego](https://rladgar.github.io/AW_AHORCADO/)

## Índice

1. [Registro de Herramientas y Desglose de Contribución](#1-registro-de-herramientas-y-desglose-de-contribución)
   - [Herramientas utilizadas](#herramientas-utilizadas)
   - [Estimación porcentual del código](#estimación-porcentual-del-código)
2. [Bitácora de Interacción (Prompts Reales)](#2-bitácora-de-interacción-prompts-reales)
   - [Ejemplo 1 (Generación y Arquitectura)](#ejemplo-1-generación-y-arquitectura)
   - [Ejemplo 2 (Resolución de errores / Debugging)](#ejemplo-2-resolución-de-errores--debugging)
   - [Ejemplo 3 (Detección de fallos de la IA / Código erróneo)](#ejemplo-3-detección-de-fallos-de-la-ia--código-erróneo)
   - [Ejemplo 4 (Refactorización y Mejora visual)](#ejemplo-4-refactorización-y-mejora-visual)
3. [Autoevaluación Crítica y Reflexión Personal](#3-autoevaluación-crítica-y-reflexión-personal)
   - [1. Productividad vs. Comprensión](#1-productividad-vs-comprensión)
   - [2. Fricciones y bloqueos](#2-fricciones-y-bloqueos)
   - [3. Puntos ciegos](#3-puntos-ciegos)
   - [4. Impacto en mi forma de trabajar](#4-impacto-en-mi-forma-de-trabajar)

---

## 1. Registro de Herramientas y Desglose de Contribución

### Herramientas utilizadas

Para hacer esta práctica he utilizado las siguientes herramientas:

1. **Antigravity CLI (`agy`):** Es una herramienta para la terminal que se conecta con la IA y va creando y modificando los archivos del proyecto directamente en mi carpeta de trabajo. Me ha servido para no tener que estar copiando y pegando código a mano todo el rato.
2. **Modelo Gemini 3.8 Flash (con nivel Medium):** Ha sido la IA principal que usé dentro de la terminal. Se encargó de generar la lógica de JavaScript (el control de turnos, puntos, comprobación de letras), los estilos CSS y el dibujo en SVG del muñeco.
3. **Gemini (Chat web):** Lo utilicé al principio de la práctica para organizar la idea, entender bien lo que pedía el PDF de la práctica, decidir cómo dividir los archivos y preparar los prompts detallados antes de ejecutarlos en la terminal.
4. **Visual Studio Code con la extensión Live Server:** Para abrir la página en local, ir viendo los cambios en tiempo real y retocar cosas a mano.
5. **Herramientas de Desarrollador de Chrome (F12 / DevTools):** Muy importante para mirar la consola, comprobar si salían errores en rojo o avisos y revisar las etiquetas del SVG.
6. **GitHub:** Para ir guardando los cambios y tener el repositorio subido para la entrega.

### Estimación porcentual del código

* **Código directo de la IA (60%):** La estructura base de los archivos, la lista de las 1.000 palabras en el JSON, la lógica para sintetizar los sonidos y la fórmula matemática para calcular las puntuaciones.
* **Código refactorizado (25%):** Cosas que la IA me dio pero que le pedí cambiar con más prompts porque no me gustaban o no quedaban cómodas: la pantalla de inicio, cambiar de sitio el teclado y los marcadores, el botón de modo oscuro y arreglar el dibujo del muñeco.
* **Código propio (15%):** Probar el juego a mano, revisar que los archivos estuvieran bien conectados, corregir detalles de márgenes y tamaños en el CSS, mirar la consola para detectar errores y comprobar que las palabras no tuvieran tildes.

---

## 2. Bitácora de Interacción (Prompts Reales)

### Ejemplo 1 (Generación y Arquitectura)

* **Prompt de entrada enviado:**
> Actúa como un Ingeniero de Software Web Senior especializado en JavaScript Vanilla y CSS3. Vamos a implementar la aplicación web del Juego del Ahorcado para un entorno de producción, siguiendo estrictamente las especificaciones de negocio, arquitectura desacoplada y diseño UI/UX minimalista contemporáneo.
>
> ### 1. REGLAS DE NEGOCIO Y ESPECIFICACIONES EXACTAS
> - **Estados iniciales y flujo de partida:**
>   * Al cargar la web, el formulario de entrada de letra, el botón "Comprobar" y el teclado interactivo deben estar inactivos/deshabilitados.
>   * Al hacer clic en "Comenzar", se activa la partida: se rescata una palabra aleatoria de `words.json` y se extrae permanentemente con `.splice()` del array activo. Se reduce el contador "Palabras restantes en el juego". Si el contador llega a 0, se inhabilita el inicio de nuevas rondas.
>   * Si ya se estaba jugando una ronda previa, se limpian las casillas de texto de la palabra, se resetean los fallos (a 0) y el dibujo del ahorcado vuelve a su estado vacío.
> - **Cajas de texto de la palabra oculta:**
>   * Renderizar un conjunto dinámico de cuadros de texto individuales (tipo input/caja con lectura exclusiva) alineados horizontalmente, tantos como letras tenga la palabra asignada (longitud de 7 a 10 letras).
>   * La palabra se muestra siempre en mayúsculas.
> - **Validación de entrada y normalización:**
>   * Admite entrada mediante el cuadro de texto + botón "Comprobar", o pulsando la tecla física (`keydown`) o mediante el teclado en pantalla.
>   * Expresión regular obligatoria: `/^[a-zA-ZñÑ]$/`.
>   * Rechazar explícitamente caracteres con tildes (á, é, í, ó, ú), diéresis, números o caracteres especiales.
>   * Si la entrada no es válida o si la letra ya fue descubierta/intentada: disparar microinteracción de sacudida (shake CSS de 0.3s) con borde temporal rojo, sin consumir intentos, sin sumar fallos y limpiando el cuadro de texto.
>   * Toda letra válida se normaliza a mayúsculas para las comparaciones.
> - **Lógica de fallos y fórmula matemática de puntuación:**
>   * Máximo estricto: 7 fallos permitidos.
>   * Cada letra fallada suma 1 a "Num Fallos actuales" y dibuja el siguiente segmento del SVG.
>   * Si la letra acertada aparece múltiples veces en la palabra, `Num. letras acertadas` equivale a la cantidad total de apariciones reveladas en ese turno.
>   * Fórmula de puntuación por jugada acertada: Puntos Jugada = (Num. letras acertadas en el turno) * (7 - N.º fallos cometidos hasta el momento).
>   * Marcadores en pantalla reactivos:
>     - Puntuación Actual: Acumulada de la sesión.
>     - Puntuación última Jugada: Puntos ganados exclusivamente en el último acierto.
>     - Puntuación Máxima: Récord persistido en `localStorage`.
>     - Num Fallos actuales.
>     - Num Fallos permitidos: 7 (fijo).
>     - Palabras restantes en el juego.
> - **Ventanas emergentes nativas (<dialog>):**
>   * Victoria: Al adivinar todas las letras, abre modal `<dialog>` felicitando al usuario, indicando la palabra completada y la puntuación obtenida en esa ronda.
>   * Derrota: Al cometer el 7.º fallo, abre modal `<dialog>` notificando el fin del juego y revelando la palabra oculta sin sumar puntos adicionales.
>
> ### 2. UI/UX Y ANIMACIÓN DE TRAZADO SVG (MINIMALISMO ELEGANTE)
> - **Estética:** Interfaz limpia (estilo Bento UI / Software moderno), paleta de fondos claros (#F8FAFC, tarjetas en #FFFFFF), bordes sutiles (#E2E8F0), textos en carbón oscuro (#0F172A), verde esmeralda (#059669) para aciertos y carmesí (#DC2626) para fallos.
> - **Gráfico del ahorcado (SVG nativo con trazado progresivo):**
>   * El SVG debe estar compuesto por exactamente 7 partes correspondientes a los 7 fallos:
>     1. Base del suelo.
>     2. Poste vertical.
>     3. Travesaño superior con soporte diagonal.
>     4. Cuerda.
>     5. Cabeza.
>     6. Tronco / cuerpo.
>     7. Brazos y piernas (extremidades completas).
>   * Todos los trazados vectoriales deben tener configurado `pathLength="1"`, con `stroke-dasharray: 1; stroke-dashoffset: 1;`. Al ocurrir cada fallo, se asigna la clase `.drawn` para animar suavemente `stroke-dashoffset: 0` mediante transición CSS de 0.4s.
> - **Teclado en pantalla:** Botonera organizada con el abecedario español completo (incluida la Ñ) que deshabilita los botones jugados y los colorea según acierto o fallo.
> - **Audio Nativo (Web Audio API):** Síntesis de ondas discretas sin archivos externos para acierto, fallo, victoria y derrota.
>
> ### 3. ARQUITECTURA DE ARCHIVOS Y METODOLOGÍA DE GENERACIÓN
> El código debe estructurarse en:
> - `index.html`: Estructura semántica, casillas, SVG preparado para animación, formulario, teclado en pantalla y modales `<dialog>`.
> - `styles.css`: Variables CSS, layout con Flexbox y CSS Grid, transiciones de trazado SVG, animaciones de feedback visual y estados de teclado.
> - `words.json`: Banco de 1.000 palabras en español válidas (7 a 10 letras, sin tildes, en mayúsculas).
> - `js/game.js`: Modelo y lógica de negocio desacoplada de la UI (estado, puntuación exacta, control del array y comprobaciones).
> - `js/audio.js`: Sintetizador Web Audio API puro.
> - `js/ui.js`: Capa de presentación (renderizado de casillas, animación SVG por clase, manipulación del teclado, modales y marcadores).
> - `js/app.js`: Orquestador principal y listeners.
>
> Genera el código completo, verificado y directamente ejecutable.

* **Salida que devolvió la IA:**
> Se ha implementado la aplicación web del Juego del Ahorcado siguiendo los estándares de producción, arquitectura desacoplada y diseño UI/UX minimalista contemporáneo en estilo Bento UI.
> ──────
> ### Estructura del Proyecto
> 
> • `index.html`: Maquetación semántica estructurada en Bento Grid, visualizador SVG de 7 partes para trazado progresivo, casillas de palabra de lectura exclusiva, controles de entrada, teclado virtual y modales nativos `<dialog>`.
> • `styles.css`: Sistema de diseño Bento UI contemporáneo (#F8FAFC, #FFFFFF, #E2E8F0, #0F172A, #059669 y #DC2626), animación de trazado vectorial con pathLength="1" y stroke-dashoffset, microinteracción de sacudida (shake 0.3s) y estilos para modales `<dialog>`.
> • `words.json`: Banco de 1.000 palabras reales en español, normalizadas a mayúsculas, de 7 a 10 letras exactas, sin tildes ni caracteres especiales, validadas contra `/^[A-ZÑ]{7,10}$/`.
> • `js/game.js`: Capa de modelo desacoplada del DOM. Gestiona la extracción aleatoria permanente con .splice(), el conteo de fallos (máx. 7), validación de caracteres, control de victoria/derrota y la fórmula matemática de puntuación:
> 
>   `Puntos Jugada = (Num. letras acertadas) × (7 - N.º fallos cometidos)`
> • `js/audio.js`: Sintetizador acústico basado en la Web Audio API nativa (sin archivos de audio externos) para emitir tonos de acierto, fallo, arpegio de victoria y cadencia de derrota.
> • `js/ui.js`: Capa de presentación y manipulación reactiva del DOM (casillas horizontales, animaciones .drawn de SVG, coloreado del teclado en pantalla, sacudida visual y modales nativos).
> • `js/app.js`: Orquestador principal que vincula eventos del teclado físico (keydown), formulario, teclado virtual y transiciones entre partidas.
> ──────
> ### Verificación de Reglas y Requisitos Técnicos
> 
> 1. Estado inicial e inicio de partida:
>    • Al cargar la página, el cuadro de texto, el botón Comprobar y el teclado en pantalla inician inactivos (disabled).
>    • Al hacer clic en Comenzar, se extrae con .splice() una palabra del array activo, reduciendo el contador de palabras restantes. Si llega a 0, se inhabilita el inicio de nuevas rondas.
> 2. Validación estricta y microinteracción de error:
>    • La entrada se valida contra `/^[a-zA-ZñÑ]$/`.
>    • Si se ingresan caracteres con tilde (á, é, í, ó, ú), números, caracteres especiales o una letra ya jugada, se dispara la animación CSS shake de 0.3s con borde rojo, sin penalizar al jugador, sin sumar fallos y vaciando el campo.
> 3. SVG progresivo de 7 partes:
>    • Se diseñaron exactamente los 7 componentes correspondientes a cada fallo: 1. Suelo, 2. Poste vertical, 3. Travesaño y soporte diagonal, 4. Cuerda, 5. Cabeza, 6. Tronco, 7. Extremidades completas (brazos y piernas).
>    • Todos cuentan con pathLength="1" y stroke-dasharray: 1; stroke-dashoffset: 1; animándose suavemente en 0.4s al recibir la clase .drawn.
> 4. Puntuación y Persistencia:
>    • Todos los marcadores son reactivos y la puntuación máxima se persiste en localStorage.

* **Mi análisis de cómo funcionó:**
  El código que me generó la IA con este primer prompt funcionó prácticamente a la primera. Lo mejor fue que dividió todo en archivos JavaScript independientes (`game.js`, `ui.js`, etc.) en vez de meterlo todo junto en un archivo gigante. La lógica del juego no tenía fallos: las palabras se leían bien desde el JSON con `fetch`, la comprobación de letras con la expresión regular no dejaba meter números ni tildes, y la fórmula de los puntos calculaba todo bien.

---

### Ejemplo 2 (Resolución de errores / Debugging)

* **Qué falló y cómo lo detecté:**
  Al ponerme a jugar en el navegador y fallar a propósito para ver cómo se dibujaba el ahorcado, vi un fallo en el muñeco: la línea del cuerpo se pintaba separada de la cabeza, como si estuviera flotando en el aire sin cuello. Abrí las herramientas de desarrollador (F12) e inspeccioné el SVG: vi que el círculo de la cabeza terminaba en una altura y la línea del tronco empezaba más abajo, así que no se tocaban.

* **Prompt que le pasé a la IA:**
> En el componente SVG del ahorcado hay un desajuste visual de coordenadas en el muñeco: el trazo del cuerpo/tronco (fallo 6) se dibuja separado y flotando respecto a la base de la cabeza (fallo 5).
> 
> Por favor, revisa el archivo donde esté definido el SVG (`index.html` o `js/ui.js`) y corrige las coordenadas:
> 1. Localiza el centro (`cy`) y radio (`r`) del elemento de la cabeza (círculo).
> 2. Ajusta el punto de inicio del tronco (`y1` de la línea o punto inicial del trazado) para que comience exactamente en el borde inferior de la cabeza (`y = cy + r`), conectando de forma continua y limpia.
> 3. Asegúrate de desplazar también hacia arriba, si fuera necesario, el punto de unión de las extremidades para mantener las proporciones anatómicas del muñeco.
> 4. Mantén intactos los atributos `pathLength="1"`, las clases de trazado (`.drawn`) y la correspondencia con los 7 fallos. Muestra únicamente las líneas modificadas o el archivo ajustado.

* **Solución que me dio la IA:**
> Se han corregido las coordenadas del SVG en index.html para asegurar la continuidad anatómica y el contacto exacto entre la cabeza, el tronco y las extremidades:
> 
> ### Justificación de los ajustes
> 1. Cabeza (Fallo 5): Se declara explícitamente como `<circle>` con centro en (cx = 170, cy = 92) y radio r = 20. Su punto más alto (cy - r = 72) conecta directamente con el extremo inferior de la cuerda (y = 72).
> 2. Tronco (Fallo 6): Comienza exactamente en el borde inferior de la cabeza en y = cy + r = 92 + 20 = 112, extendiéndose hasta la cadera en y = 172.
> 3. Extremidades (Fallo 7): Los brazos se articulan en el torso superior en (170, 128) y las piernas se unen de forma continua en la base de la cadera en (170, 172), preservando proporciones anatómicas limpias.
> 4. Se mantienen intactos los atributos pathLength="1", las clases de animación (.hangman-part) y la correspondencia de los 7 fallos.
> 
> Líneas modificadas en index.html:
> ```html
> <!-- 4. Cuerda -->
> <path class="hangman-part" id="part-4" pathLength="1" d="M 170 30 L 170 72" />
> <!-- 5. Cabeza (cy = 92, r = 20 -> base en y = 112) -->
> <circle class="hangman-part" id="part-5" pathLength="1" cx="170" cy="92" r="20" />
> <!-- 6. Tronco / cuerpo (inicia exactamente en y = cy + r = 112) -->
> <path class="hangman-part" id="part-6" pathLength="1" d="M 170 112 L 170 172" />
> <!-- 7. Brazos y piernas (unión de piernas alineada a la cadera en y = 172) -->
> <path class="hangman-part" id="part-7" pathLength="1" d="M 138 146 L 170 128 L 202 146 M 140 218 L 170 172 L 200 218" />
> ```

* **Evaluación del resultado:**
  Se arregló a la primera. La IA recalculó los números de la altura y al recargar la página el cuerpo ya salía pegado a la cabeza. Además, no se rompió la animación de cómo se va pintando la línea poco a poco.

---

### Ejemplo 3 (Detección de fallos de la IA / Código erróneo)

* **Qué falló y cómo lo detecté:**
  Al probar el juego, me di cuenta de que a veces los sonidos no sonaban cuando pulsaba una letra. Abrí la consola del navegador con F12 y vi este aviso en amarillo:
  `The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.`
  
  Mirando el código de `js/audio.js`, vi que la IA había creado el objeto de audio al cargarse el archivo. El problema es que los navegadores modernos (como Chrome) bloquean el sonido por seguridad si el usuario todavía no ha hecho ningún clic en la pantalla. La IA hizo un código que en teoría estaba bien escrito, pero no tuvo en cuenta esta regla del navegador.

* **Prompt que le pasé a la IA:**
> En la consola del navegador aparece la siguiente advertencia de la Web Audio API:
> "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page."
> 
> Debido a esto, los efectos de sonido quedan suspendidos al inicio. Refactoriza `js/audio.js` para que el AudioContext no se quede en estado 'suspended':
> 1. Asegúrate de inicializar el AudioContext de forma perezosa (lazy) o añade un método `initAudioContext()` que se desbloquee llamando a `this.ctx.resume()` tras la primera interacción del usuario (al hacer clic en "Comenzar" o pulsar una tecla).
> 2. Mantén intactos los métodos de emisión de sonido para acierto, fallo, victoria y derrota sin añadir librerías externas.

* **Solución que me dio la IA:**
> Se ha modificado js/audio.js y js/app.js para cumplir con las políticas de reproducción automática (Autoplay Policy):
> 
> 1. En audio.js se añade el método resumeContext():
> ```javascript
> async resumeContext() {
>   if (this.ctx && this.ctx.state === 'suspended') {
>     await this.ctx.resume();
>   }
> }
> ```
> 2. En app.js, se vincula la primera pulsación del botón "Comenzar" o del teclado físico para invocar audioManager.resumeContext(), garantizando que el hardware de audio esté disponible de forma reactiva antes de emitir los tonos.

* **Evaluación del resultado:**
  Al aplicar el cambio, el aviso amarillo de la consola desapareció y los sonidos empezaron a sonar siempre y sin retraso. Me sirvió para ver que la IA a veces no se entera de cómo funcionan los navegadores por dentro y que hay que revisar la consola para ver qué pasa.

---

### Ejemplo 4 (Refactorización y Mejora visual)

* **Motivo del cambio y qué quería mejorar:**
  Aunque el juego ya funcionaba bien, visualmente no me gustaba: era demasiado básico, casi todo en blanco y negro, y parecía una plantilla sin terminar. Además, encontré varios problemas al usarlo:
  1. El botón de comenzar estaba abajo del todo y tenías que bajar con el ratón para encontrarlo y poder jugar.
  2. En el título ponía "PRO" y quería quitarlo para que quedara solo "EL AHORCADO".
  3. El teclado en pantalla estaba a la izquierda y las métricas a la derecha, por lo que tenías que cruzar la vista en diagonal respecto a la palabra secreta.
  4. Quería añadir un botón para cambiar entre tema claro y tema oscuro y que se guardara la preferencia.

* **Prompt que le pasé a la IA:**
> Refactoriza la interfaz y la experiencia de usuario (UI/UX) de la aplicación en `index.html`, `styles.css` y `js/ui.js` abordando tres aspectos clave: arquitectura visual, flujo de pantallas y paleta cromática. Mantén intacta la lógica de negocio de `js/game.js` y el sintetizador de audio.
> 
> 1. Identidad y Título:
> - Modifica el encabezado principal en `index.html`: elimina cualquier referencia a "PRO" y establece estrictamente "EL AHORCADO".
> 
> 2. Flujo de Navegación y Arquitectura del Layout (Onboarding UX):
> - El botón "Comenzar" no debe quedar desubicado ni obligar al usuario a hacer scroll para iniciar la partida.
> - Implementa una vista inicial de bienvenida (`#view-welcome` o estado en el contenedor principal) centrada y limpia:
>   * Presenta el título principal, una breve indicación visual, la "Puntuación Máxima" histórica persistida y un botón de llamada a la acción ("Comenzar Partida") destacado y accesible.
> - Al pulsar "Comenzar", aplica una transición fluida en CSS (fade-in / slide) que oculte la vista de bienvenida y revele el tablero de juego (`#view-game`):
>   * Distribución equilibrada en pantalla: a la izquierda el dibujo SVG y justo debajo las MÉTRICAS DE SESIÓN; a la derecha la PALABRA SECRETA y justo debajo el teclado virtual en pantalla.
>   * Añade un botón secundario discreto de "Reiniciar Ronda" en la barra superior del juego.
> 
> 3. Rediseño Visual, Paleta de Color y Modo Oscuro:
> - Sustituye la estética monocromática por una paleta moderna en variables CSS:
>   * Tema claro (`:root`): fondo pizarra suave (#F1F5F9), tarjetas blancas (#FFFFFF), primario en azul índigo (#4F46E5), verde (#10B981) para aciertos y rojo coral (#EF4444) para fallos.
>   * Tema oscuro (`[data-theme="dark"]`): fondo azul noche (#0B0F17) y tarjetas contrastadas (#161F30).
> - Añade un botón accesible con `id="btn-theme-toggle"` en la cabecera junto al de sonido que alterne entre icono de sol y luna, guardando la preferencia en `localStorage` y detectando `prefers-color-scheme`.
> 
> Proporciona el código refactorizado listo para su integración sin omitir estilos.

* **Salida que devolvió la IA:**
> Se ha completado la refactorización de la interfaz y la experiencia de usuario (UI/UX) abordando la arquitectura visual, el flujo de pantallas y la paleta cromática, manteniendo intacta la lógica de negocio y el sintetizador de audio.
> ──────
> ### Resumen de las Modificaciones Implementadas
> #### 1. Identidad y Título (`index.html`)
> • Se eliminó el badge PRO del encabezado.
> • El título principal se estableció estrictamente como: `<h1 class="brand-title">EL AHORCADO</h1>`.
> 
> #### 2. Flujo de Navegación y Arquitectura del Layout (Onboarding UX)
> • Pantalla de bienvenida (`#view-welcome`): vista inicial centrada con título, descripción breve, récord histórico persistido (`localStorage`), badges de reglas y el botón principal "Comenzar Partida" (`#btn-welcome-start`).
> • Transición suave hacia el tablero (`#view-game`): al pulsar comenzar se ejecuta una transición CSS (fade-in / translateY), activando la partida mediante la extracción con `.splice()`, reseteo de fallos y limpieza del SVG.
> • Distribución en pantalla:
>   - Columna izquierda: Gráfico SVG progresivo arriba y panel de MÉTRICAS DE SESIÓN abajo.
>   - Columna derecha: Casillas de la PALABRA SECRETA arriba y Teclado Virtual interactivo abajo.
> • Control en partida: botón secundario en la barra superior "Reiniciar Ronda" (`#btn-restart`) para reiniciar o avanzar de palabra en cualquier momento.
> 
> #### 3. Centralización de Variables CSS y Tema Oscuro (`styles.css`, `ui.js`, `app.js`)
> • Selector `:root` (Modo Claro): `--bg-page: #F1F5F9`, `--bg-card: #FFFFFF`, `--text-primary: #0F172A`, `--color-primary: #4F46E5`, etc.
> • Selector `[data-theme="dark"]`: `--bg-page: #0B0F17`, `--bg-card: #161F30`, `--text-primary: #F8FAFC`, etc.
> • Transición suave global: `transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;`
> • Botón `#btn-theme-toggle` con SVG reactivo que alterna sol y luna.
> • Integración con `localStorage` y detección automática con `window.matchMedia('(prefers-color-scheme: dark)')`.

* **Mi análisis de cómo funcionó:**
  El cambio fue enorme. La página pasó de parecer una práctica sosa a verse como un juego de verdad. La pantalla de bienvenida viene genial porque entras y lo primero que ves es el botón grande para jugar. Además, al mover el teclado justo debajo de la palabra es mucho más cómodo jugar porque no tienes que mirar de una esquina a otra de la pantalla. El modo oscuro funciona con un clic, se guarda si recargas la página y los colores se ven bien tanto de día como de noche.

---

## 3. Autoevaluación Crítica y Reflexión Personal

### 1. Productividad vs. Comprensión
*¿En qué medida la IA aceleró tu ritmo de trabajo y qué porcentaje del código subido a tu repositorio serías capaz de explicar línea por línea sin ayuda?*

La IA me ha ahorrado un montón de tiempo, calculo que entre un 60% y un 70%. Sobre todo en cosas muy pesadas como inventar y escribir las 1.000 palabras en el archivo JSON, escribir las etiquetas básicas del HTML o calcular las frecuencias para que sonaran los tonos. 

Aun así, no me he limitado a copiar y pegar sin mirar. Al pedirle a la IA que separara todo en archivos (`game.js`, `ui.js`, etc.), fui leyendo lo que hacía cada parte. **Ahora mismo sería capaz de explicar sin problemas entre el 90% y el 95% del código**. Entiendo cómo se guardan las variables, cómo se saca una palabra del array con `.splice()` para que no se repita, cómo calcula los puntos multiplicando los aciertos por los fallos que te quedan, cómo valida las letras con la expresión regular y cómo cambia de tema con las variables de CSS. Lo único que me costaría más explicar son los números exactos de las curvas del SVG o los parámetros del sonido en JavaScript que no tengo ni idea.

### 2. Fricciones y bloqueos
*¿En qué momentos la IA te hizo perder el tiempo, ofreció soluciones en bucle o te llevó por arquitecturas erróneas?*

Los dos momentos donde más me atasqué fueron con el dibujo y con el sonido:
* **El dibujo del muñeco:** La IA programa muy bien la lógica, pero como no "ve" la pantalla, puso las coordenadas del cuerpo separadas de la cabeza. Tuve que abrir las herramientas de desarrollador, mirar qué números estaban mal y decirle exactamente cómo arreglarlo.
* **El sonido bloqueado:** La IA creó el sonido al cargar la página sin saber que Chrome no deja reproducir audio si el usuario no ha hecho clic antes. Me tocó buscar el aviso en la consola de F12 y pedirle que hiciera que el sonido se activara al pulsar el botón de jugar.

### 3. Puntos ciegos
*Si tuvieras que defender este proyecto en una entrevista técnica o modificar una funcionalidad en vivo sin conexión a internet ni asistentes, ¿cuáles serían tus principales debilidades en el código actual?*

Si tuviera que ponerme delante del ordenador sin internet ni IA:
* **Lo que sabría hacer bien:** Cambiar las reglas de los puntos, añadir botones nuevos, poner más comprobaciones con expresiones regulares, guardar datos en el `localStorage` o maquetar con Flexbox y CSS Grid. Todo eso lo entiendo bien porque lo vemos en el ciclo.
* **Mis puntos ciegos:** Me costaría mucho dibujar cosas nuevas en SVG a mano escribiendo números en la etiqueta `<path>` sin tener un editor visual o la IA. Y tampoco sabría cómo programar sonidos con la Web Audio API.

### 4. Impacto en mi forma de trabajar
*¿Cómo ha cambiado tu forma de razonar y resolver problemas de programación respecto a cuando programabas sin estas herramientas?*

Hacer esta práctica me ha enseñado que programar con IA no es pedirle "hazme el juego" y desentenderte. Mi forma de trabajar ha cambiado en dos cosas:
1. **Pensar antes de pedir:** Antes me ponía a escribir código directamente y me equivocaba mucho. Ahora lo que hago es pensar primero cómo quiero estructurar la página, qué archivos necesito y qué reglas tiene que cumplir el juego antes de pasarle el prompt a la IA.
2. **Revisar y desconfiar:** He aprendido que no te puedes fiar al 100% de lo primero que te da la IA. Aunque el código parezca que funciona, puede tener fallos visuales, ser incómodo de usar o tener errores escondidos en la consola. Aprender a usar la consola del navegador para pillar esos fallos y saber cómo pedirle a la IA que los corrija ha sido lo más útil de toda la práctica.
