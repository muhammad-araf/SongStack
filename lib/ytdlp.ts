import { spawn } from 'child_process';
import path from 'path';

export async function searchSong(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
        // Use 'python' on Windows, 'python3' on Linux/Mac/Docker
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';

        // Command: python -m yt_dlp --dump-json "ytsearch1:Query"
        const ytDlp = spawn(pythonCommand, [
            '-m', 'yt_dlp',
            '--dump-json',
            '--default-search', 'ytsearch1',
            '--no-playlist',
            '--quiet',
            '--no-warnings',
            query
        ]);

        let stdout = '';
        let stderr = '';

        ytDlp.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        ytDlp.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        ytDlp.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp search failed: ${stderr}`);
                if (code === 127 || stderr.includes('not found')) {
                    reject(new Error('python command not found or yt-dlp module missing.'));
                } else {
                    resolve(null); // No results found logic
                }
                return;
            }

            try {
                if (!stdout.trim()) {
                    resolve(null);
                    return;
                }
                const data = JSON.parse(stdout);
                resolve({
                    title: data.title,
                    id: data.id,
                    url: data.webpage_url,
                    thumbnail: data.thumbnail,
                    duration: data.duration,
                    uploader: data.uploader,
                    views: data.view_count
                });
            } catch (err) {
                reject(new Error(`Failed to parse yt-dlp output: ${err}`));
            }
        });
    });
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
