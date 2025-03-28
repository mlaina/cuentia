import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET (request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Intercambiar el código por una sesión
    await supabase.auth.exchangeCodeForSession(code)

    // Obtener el usuario actual
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      // Verificar si el usuario ya tiene un perfil en la tabla users
      const { data: existingUser, error: queryError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      // Si no existe un perfil para este usuario, crear uno nuevo
      if (!existingUser && !queryError?.message.includes('Results contain 0 rows')) {
        // Obtener el idioma de la cookie o usar el predeterminado
        const locale =
            cookieStore.get('locale')?.value ||
            request.headers.get('accept-language')?.split(',')[0].split('-')[0] ||
            'en'

        // Insertar el nuevo registro en la tabla users
        const { error: insertError } = await supabase.from('users').insert({
          user_id: user.id,
          plan: 'WAITING',
          lang: locale,
          credits: 0, // Ajusta según tus necesidades
          email: user.email
        })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      }
    }
  }

  // Redirigir al origen después de completar todo el proceso
  return NextResponse.redirect(requestUrl.origin)
}
