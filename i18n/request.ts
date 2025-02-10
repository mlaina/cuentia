// i18n/request.ts
import { NextRequest } from 'next/server'

// Retornamos un objeto con la configuración y, sobre todo, 'locale'
export default function getRequestConfig (req: NextRequest) {
  // Si no quieres detectar nada, puedes devolver siempre 'en'
  // O podrías, por ejemplo, leer una cookie o Accept-Language para decidir

  return {
    // Lista de idiomas soportados
    locales: ['en', 'es'],
    // Idioma por defecto
    defaultLocale: 'en',
    // **Idioma a usar en este request**:
    locale: 'en'
  }
}
