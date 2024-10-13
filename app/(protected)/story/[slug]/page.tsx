import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import StoryViewer from '@/components/StoryViewer'

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

    console.log('Story:', story)
    if (error) {
        console.error('Error fetching story:', error)
        return <div>Error loading story</div>
    }

    if (!story) {
        return <div>Story not found</div>
    }

    const storyPages = [{
        text: story.content,
        imageUrl: story.images
    }]

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl text-gray-600 font-bold text-center">{story.title}</h1>
            <StoryViewer pages={storyPages} />
        </div>
    )
}
