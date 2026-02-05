import { NextRequest, NextResponse } from 'next/server';
import { streamAudio } from '@/lib/ytdlp';

export async function POST(request: NextRequest) {
    try {
        const { url, title } = await request.json();

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        console.log(`Proxying download via yt-dlp for: ${title}`);

        // Get the audio stream from yt-dlp
        const nodeStream = streamAudio(url);

        // Convert Node Stream to Web ReadableStream for Next.js response
        const stream = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => {
                    controller.enqueue(chunk);
                });
                nodeStream.on('end', () => {
                    controller.close();
                });
                nodeStream.on('error', (err) => {
                    console.error('Stream error:', err);
                    controller.error(err);
                });
            },
            cancel() {
                nodeStream.destroy();
            }
        });

        // Return the file stream
        return new NextResponse(stream as any, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.mp3"`,
            },
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { error: 'Failed to download song' },
            { status: 500 }
        );
    }
}

// Increase timeout for download route (Vercel Pro required for >10s)
export const maxDuration = 60;
