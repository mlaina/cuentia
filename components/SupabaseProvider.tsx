// supabase-provider.tsx
'use client'

import React, { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import type { Database } from '@/types/supabase'

export default function SupabaseProvider ({
  children,
  session
}: {
    children: React.ReactNode
    session: Session | null
}) {
  const [supabaseClient] = useState(() =>
    createClientComponentClient<Database>()
  )

  return (
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
            {children}
        </SessionContextProvider>
  )
}
