import axios from "axios";
import {NextRequest, NextResponse} from 'next/server';
import {createServerComponentClient} from '@supabase/auth-helpers-nextjs';
import {cookies} from 'next/headers';
import epub from 'epub-gen-memory';
import {marked} from 'marked';
import sharp from "sharp";

export const runtime = 'nodejs';


async function convertAvifToJpeg(imageUrl) {
    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const avifBuffer = Buffer.from(response.data, 'binary');
        return await sharp(avifBuffer).resize({
            width: 580,
            height: 768,
            fit: 'cover'
        }).jpeg().toBuffer();
    } catch (error) {
        console.error('Error converting AVIF to JPEG:', error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId } = await req.json();

    const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .eq('id', storyId)
        .single();

    if (error || !story) {
        return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    let content;
    try {
        content = typeof story.content === 'string' ? JSON.parse(story.content) : story.content;
    } catch (parseError) {
        console.error('Error parsing story content:', parseError);
        return NextResponse.json({ error: 'Invalid story content format' }, { status: 500 });
    }

    function markdownToHtml(markdownText) {
        return marked(markdownText);
    }

    const coverImage = content[0]?.imageUrl;
    const backCoverImage = content[content.length - 1]?.imageUrl;

    try {
        const chapters = [];

        chapters.push({
            title: story.title,
            content: `<img src="${coverImage}" alt="Portada" style="max-width: 100%; height: auto;" />`
        });


        for (let i = 0; i < content.length; i++) {
            if ((i === 0 && coverImage) || (i === content.length - 1 && backCoverImage)) continue;

            const page = content[i];


            const pageContentHtml = page.content ? markdownToHtml(page.content) : '';

            chapters.push({
                title: ' ',
                content: `
                    <div>
                        ${pageContentHtml}
                    </div>
                `
            });
            chapters.push({
                title: ' ',
                content: `<img src="${page.imageUrl}" alt="${page}" style="max-width: 100%; height: auto;" />`
            });
        }

        if (backCoverImage) {
            chapters.push({
                title: ' ',
                content: `<img src="${backCoverImage}" alt="Contraportada" style="max-width: 100%; height: auto;" />`
            });
        }

        const coverJpegBuffer = await convertAvifToJpeg(coverImage);
        const coverFile = new File([new Blob([coverJpegBuffer])], 'cover.jpg', { type: 'image/jpeg' });

        const options = {
            title: story.title,
            author: 'CuentIA - ' + user.user_metadata.name,
            cover:  coverFile,
            tocTitle: '',
            tocInTOC: false,
            numberChaptersInTOC: false,
            prependChapterTitles: false,
            content: chapters
        };


        const epubGen = await epub(options, chapters)

        return new NextResponse(epubGen, {
            status: 200,
            headers: {
                'Content-Type': 'application/epub+zip',
                'Content-Disposition': `attachment; filename="${story.title}.epub"`
            }
        });
    } catch (error) {
        console.error('Error creating EPUB:', error);
        return NextResponse.json({ error: 'Error creating EPUB' }, { status: 500 });
    }
}
