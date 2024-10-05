// components/SupabaseProvider.tsx
'use client'

import { useState } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'

export default function SupabaseProvider({
                                             children,
                                             session,
                                         }: {
    children: React.ReactNode
    session: Session | null
}) {
    const [supabaseClient] = useState(() => createBrowserSupabaseClient())

    return (
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={session}>
            {children}
        </SessionContextProvider>
    )
}
