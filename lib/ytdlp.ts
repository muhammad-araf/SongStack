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
    const args = [
        '-m', 'yt_dlp',
        '-f', 'bestaudio',
        '-o', '-',
        '--quiet',
        '--no-warnings',
        '--no-playlist',
        '--no-check-certificate',
        '--prefer-free-formats',
        '--geo-bypass',
    ];

    // Handle Cookies if provided in ENV
    if (process.env.YOUTUBE_COOKIES) {
        try {
            const cookiePath = path.join(os.tmpdir(), 'yt_cookies.txt');
            // Ensure proper newlines are preserved if they were lost in Env var
            let cookieContent = process.env.YOUTUBE_COOKIES;
            // Basic check to see if we need to fix formatting (rare but possible in some envs)

            fs.writeFileSync(cookiePath, cookieContent);

            args.push('--cookies', cookiePath);
            console.log(`Using provided YouTube Cookies. File size: ${fs.statSync(cookiePath).size} bytes`);

            // Cuando using cookies, we SHOULD NOT spoof the client as Android or force a User-Agent,
            // because it might conflict with the browser session in the cookies.
            // We rely purely on the authenticated session.

        } catch (e) {
            console.error('Failed to write cookie file:', e);
        }
    } else {
        // NO Cookies provided: Try "Android Client" spoofing as a fallback.
        // This is less reliable but better than nothing for unauthenticated requests.
        console.log('No cookies found. Using Android client spoofing.');
        args.push(
            '--user-agent', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            '--extractor-args', 'youtube:player_client=android'
        );
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
            ytProcess.stdout.destroy(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
        } else {
            console.log(`yt-dlp stream completed successfully for: ${videoUrl}`);
        }
    });

    return ytProcess.stdout;
}
