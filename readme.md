# Nitro Racer 🏎️

**Autor:** Cristopher Rodríguez Pérez  
**Institución:** Instituto Tecnológico de Pachuca (ITP)  
**Materia:** Graficación   

---

## 📝 Descripción
**ITP Nitro Racer** es un videojuego de carreras en 2D desarrollado con la **Canvas API** de JavaScript. El jugador controla un vehículo que debe esquivar obstáculos (autos estorbo) en una carretera de alta velocidad. El juego utiliza un sistema de niveles progresivos donde la velocidad y la densidad del tráfico aumentan conforme el jugador avanza.

## 🚀 Características Principales
- **Sistema de Niveles:** 8 niveles de dificultad escalonada.
- **Puntaje Acumulativo:** Los puntos se otorgan al finalizar cada nivel basados en las vidas restantes (❤️x3 = 100 pts, ❤️x2 = 67 pts, ❤️x1 = 33 pts).
- **Efectos Visuales:** Sistema de partículas en choques, sacudida de cámara (*screen shake*) y parpadeo de daño.
- **Audio Inmersivo:** Música de fondo dinámica, sonidos ambientales de tráfico y efectos de colisión.
- **Interfaz Moderna:** Diseño basado en *Glassmorphism* y marcadores neón flotantes.
- **Responsividad:** Ajuste automático del área de juego y HUD según el tamaño de la ventana.

## 🛠️ Tecnologías Utilizadas
- **HTML5:** Estructura de la aplicación y contenedor de gráficos.
- **CSS:** Estilos avanzados, animaciones y efectos de transparencia.
- **JavaScript (Vanilla):** Lógica del motor del juego, física de colisiones y gestión de estados.
- [cite_start]**Bootstrap 5:** Distribución de la interfaz y componentes de alerta.

## 📂 Estructura del Proyecto
```text
EXAMEN-TEMA2/
├── assets/
│   ├── audio/          # Efectos y música (.mp3)
│   ├── css/
│   │   └── style.css   # Estilos personalizados y HUD
│   ├── img/            # Sprites de autos, pista y favicon
│   └── js/
│       └── main.js     # Motor principal del juego
├── index.html          # Punto de entrada de la aplicación
└── README.md           # Documentación del proyecto