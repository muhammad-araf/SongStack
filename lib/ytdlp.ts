import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

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
    // Basic Arguments
    const args = [
        '-m', 'yt_dlp',
        '-f', 'bestaudio',
        '-o', '-',
        '--quiet',
        '--no-warnings',
        // Anti-Bot / Reliability Args
        '--no-playlist',
        '--no-check-certificate',
        '--prefer-free-formats',
        '--geo-bypass',
        // Spoofing
        '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        '--extractor-args', 'youtube:player_client=android' // Android client is often more lenient
    ];

    // Handle Cookies if provided in ENV (for solving "Sign in to confirm you're not a bot")
    if (process.env.YOUTUBE_COOKIES) {
        try {
            const cookiePath = path.join(os.tmpdir(), 'yt_cookies.txt');
            fs.writeFileSync(cookiePath, process.env.YOUTUBE_COOKIES);
            args.push('--cookies', cookiePath);
            console.log('Using provided YouTube Cookies for authentication');
        } catch (e) {
            console.error('Failed to write cookie file:', e);
        }
    }

    // Add URL last
    args.push(videoUrl);

    // Use 'python' on Windows, 'python3' on Linux/Mac/Docker
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

    console.log(`Spawning yt-dlp stream via ${pythonCommand} for: ${videoUrl}`);
    const ytProcess = spawn(pythonCommand, args);

    let stderr = '';
    ytProcess.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    ytProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`yt-dlp stream failed with code ${code}: ${stderr}`);
            // We can't really "emit" an error on stdout if it's already ended, but we can log it.
            // Attempts to destroy the stream with error might help if it's still active.
            ytProcess.stdout.destroy(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
        } else {
            console.log(`yt-dlp stream completed successfully for: ${videoUrl}`);
        }
    });

    return ytProcess.stdout;
}
