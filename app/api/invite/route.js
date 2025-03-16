import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // clave privada (service_role)
)

export async function POST (req) {
  try {
    // 1. Obtenemos los datos del body
    const { email, credits = 100, lang = 'en' } = await req.json()
    if (!email) {
      return NextResponse.json({ error: 'Falta el email en el body' }, { status: 400 })
    }

    // 2. Generamos el enlace de invitación
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        redirectTo: 'https://imagins.ai'
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const userId = data.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'No se obtuvo el user ID de Supabase' }, { status: 400 })
    }

    // 3. Insertamos el usuario en tu tabla "users"
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          user_id: userId,
          email,
          plan: 'FREE',
          credits,
          lang
        }
      ])

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    // 4. Respondemos con éxito
    return NextResponse.json({
      message: `Invitación enviada a ${email}`,
      user_id: userId
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
