# Marcador Estadístico Dompa 🏐

Sistema profesional de marcador y análisis estadístico en tiempo real para partidos de voleibol. Diseñado para ofrecer una experiencia fluida, rápida y detallada tanto en dispositivos móviles como en escritorio.

## ✨ Características

- **Marcador en Directo**: Gestión intuitiva de puntos y sets.
- **Análisis de Rotaciones**: Seguimiento automático de rotaciones y rendimiento por posición.
- **Estadísticas Avanzadas**: Gráficos dinámicos de rendimiento de equipo.
- **Historial de Partidos**: Almacenamiento local de encuentros anteriores.
- **Multi-idioma**: Soporte completo para Español e Inglés.
- **Modo Oscuro/Claro**: Adaptabilidad visual para cualquier entorno.
- **Responsive Design**: Optimizado para móviles, tablets y PCs.
- **Offline-First**: Persistencia local mediante `localStorage` para garantizar que no se pierdan datos.

## 🛠️ Stack Tecnológico

- **Framework**: [React 18](https://reactjs.org/) con [Vite](https://vitejs.dev/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Radix UI](https://www.radix-ui.com/) y [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Internacionalización**: [i18next](https://www.i18next.com/)

## 🚀 Inicio Rápido

### Requisitos previos
- Node.js (v18+)
- npm o yarn

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:9002`

### Construcción para Producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/`.

## 📂 Estructura del Proyecto

- `src/components`: Componentes modulares de UI.
- `src/hooks`: Lógica de negocio y gestión de estado.
- `src/lib`: Utilidades y configuración de librerías.
- `src/locales`: Traducciones del sistema.
- `archive_next`: (Legacy) Archivo de la versión anterior basada en Next.js.

---
Desarrollado con ❤️ para la comunidad de Voleibol.
