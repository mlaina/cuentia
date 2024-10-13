import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import StoryViewer from '@/components/StoryViewer'
import {redirect} from "next/navigation";

export default async function StoryPage({ params }: { params: { slug: string } }) {
    const supabase = createServerComponentClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return redirect('/login')
    }

    console.log('User session:', params.slug)
    // Fetch the story data
    const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', session.user.id)
        .eq('id', Number(params.slug))
        .single()

    if (error) {
        console.error('Error fetching story:', error)
        return <div>Error loading story</div>
    }

    if (!story) {
        return <div>Story not found</div>
    }

    return (
        <div className="max-w-6xl mx-auto py-6 space-y-4">
            <h1 className="bg-gradient-to-r from-sky-500 via-purple-800 to-red-600 bg-clip-text text-4xl font-bold text-transparent">{story.title}</h1>
            <StoryViewer pages={story.content} />
        </div>
    )
}
