/**
 * API Route: Search for songs on YouTube
 * POST /api/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchSong } from '@/lib/ytdlp';

export async function POST(request: NextRequest) {
    try {
        const { songName } = await request.json();

        if (!songName) {
            return NextResponse.json(
                { error: 'Song name is required' },
                { status: 400 }
            );
        }

        console.log(`Searching YouTube via yt-dlp for: ${songName}`);

        // Clean query slightly but let yt-dlp handle most of it
        const query = songName.replace(/\|.*/, '').trim();

        const result = await searchSong(query);

        if (!result) {
            return NextResponse.json(
                { error: 'No results found on YouTube' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            title: result.title,
            url: result.url,
            thumbnail: result.thumbnail,
            duration: result.duration,
            author: result.uploader,
            views: result.views,
            source: 'youtube-dlp'
        });

    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Failed to search for song' },
            { status: 500 }
        );
    }
}
