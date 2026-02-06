import { spawn } from 'child_process';
import path from 'path';

import yts from 'yt-search';

export async function searchSong(query: string): Promise<any> {
    try {
        console.log(`Searching via yt-search for: ${query}`);
        const result = await yts(query);

        if (!result || !result.videos || result.videos.length === 0) {
            console.log("No results found in yt-search");
            return null;
        }

        const video = result.videos[0];

        return {
            title: video.title,
            id: video.videoId,
            url: video.url,
            thumbnail: video.thumbnail,
            duration: video.timestamp, // or video.seconds
            uploader: video.author.name,
            views: video.views
        };

    } catch (error: any) {
        console.error(`yt-search failed: ${error.message}`);
        // Fallback or just return null
        return null;
    }
}

/**
 * Spawns a yt-dlp process to stream audio to stdout
 */
export function streamAudio(videoUrl: string) {
    // Command: python -m yt_dlp -f bestaudio -o - "URL"
    const args = [
        '-m', 'yt_dlp',
        '-f', 'bestaudio',      // Best audio quality
        '-o', '-',             // Output to stdout
        '--quiet',             // Suppress progress output
        '--no-warnings',
        videoUrl
    ];

    // Use 'python' on Windows, 'python3' on Linux/Mac/Docker
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    console.log(`Spawning yt-dlp stream via ${pythonCommand} for: ${videoUrl}`);
    const ytProcess = spawn(pythonCommand, args);
    return ytProcess.stdout;
}
