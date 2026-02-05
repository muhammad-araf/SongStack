/**
 * Custom React hook for download management
 */

'use client';

import { useState, useCallback } from 'react';

// Helper function to format duration
const formatDuration = (durationStr: string | number | undefined): string => {
    if (!durationStr) return '0:00';
    
    // If it's a string like "3:45", return as is
    if (typeof durationStr === 'string' && durationStr.includes(':')) {
        return durationStr;
    }
    
    // If it's seconds as number or string
    const seconds = typeof durationStr === 'string' ? parseInt(durationStr, 10) : durationStr;
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format file size
const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};

export interface SongDownloadStatus {
    songName: string;
    status: 'pending' | 'searching' | 'downloading' | 'complete' | 'error';
    progress: number;
    error?: string;
    downloadedFile?: string;
    duration?: string;
    url?: string;
    fileSize?: string;
}

export interface UseDownloadResult {
    downloads: Map<string, SongDownloadStatus>;
    isDownloading: boolean;
    startDownload: (songName: string) => Promise<void>;
    startBatchDownload: (songNames: string[]) => Promise<void>;
    cancelDownload: (songName: string) => void;
    retryDownload: (songName: string) => Promise<void>;
    reset: () => void;
    getOverallProgress: () => number;
}

export function useDownload(): UseDownloadResult {
    const [downloads, setDownloads] = useState<Map<string, SongDownloadStatus>>(new Map());
    const [isDownloading, setIsDownloading] = useState(false);
    const [abortControllers, setAbortControllers] = useState<Map<string, AbortController>>(new Map());

    const updateDownload = useCallback(
        (songName: string, updates: Partial<SongDownloadStatus>) => {
            setDownloads((prev) => {
                const newMap = new Map(prev);
                const current = newMap.get(songName) || {
                    songName,
                    status: 'pending' as const,
                    progress: 0,
                };
                newMap.set(songName, { ...current, ...updates });
                return newMap;
            });
        },
        []
    );

    const startDownload = useCallback(
        async (songName: string) => {
            updateDownload(songName, { status: 'searching', progress: 10 });

            try {
                // Create abort controller for this download
                const abortController = new AbortController();
                setAbortControllers((prev) => new Map(prev).set(songName, abortController));

                // 1. Search for the song (Server-side search is still okay)
                const searchResponse = await fetch('/api/search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ songName }),
                    signal: abortController.signal,
                });

                if (!searchResponse.ok) {
                    throw new Error('Song not found');
                }

                const searchData = await searchResponse.json();
                
                // Extract and format duration
                const rawDuration = searchData.duration || searchData.length || '0:00';
                const formattedDuration = formatDuration(rawDuration);
                
                updateDownload(songName, { 
                    status: 'downloading', 
                    progress: 30,
                    duration: formattedDuration,
                    url: searchData.url,
                });

                // Download using our internal proxy (Zero Redirects)
                const downloadResponse = await fetch('/api/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: searchData.url, title: searchData.title }),
                    signal: abortController.signal,
                });

                if (!downloadResponse.ok) {
                    throw new Error('Download failed');
                }

                // Get the blob and create download link
                const blob = await downloadResponse.blob();
                const fileSize = formatFileSize(blob.size);
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${searchData.title}.mp3`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                updateDownload(songName, {
                    status: 'complete',
                    progress: 100,
                    fileSize: fileSize,
                    downloadedFile: `${searchData.title}.mp3`
                });

            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    updateDownload(songName, {
                        status: 'error',
                        progress: 0,
                        error: 'Download cancelled',
                    });
                } else {
                    console.error('Download error:', err);
                    updateDownload(songName, {
                        status: 'error',
                        progress: 0,
                        error: err instanceof Error ? err.message : 'Download failed',
                    });
                }
            } finally {
                // Clean up abort controller
                setAbortControllers((prev) => {
                    const newMap = new Map(prev);
                    newMap.delete(songName);
                    return newMap;
                });
            }
        },
        [updateDownload]
    );

    const startBatchDownload = useCallback(
        async (songNames: string[]) => {
            setIsDownloading(true);

            // Initialize all downloads
            songNames.forEach((songName) => {
                updateDownload(songName, { status: 'pending', progress: 0 });
            });

            // Download songs sequentially to avoid timeout
            for (const songName of songNames) {
                await startDownload(songName);
                // Small delay between downloads
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }

            setIsDownloading(false);
        },
        [startDownload, updateDownload]
    );

    const reset = useCallback(() => {
        setDownloads(new Map());
        setIsDownloading(false);
        setAbortControllers(new Map());
    }, []);

    const cancelDownload = useCallback((songName: string) => {
        const controller = abortControllers.get(songName);
        if (controller) {
            controller.abort();
        }
    }, [abortControllers]);

    const retryDownload = useCallback(
        async (songName: string) => {
            // Reset the download status and retry
            updateDownload(songName, { status: 'pending', progress: 0, error: undefined });
            await startDownload(songName);
        },
        [startDownload, updateDownload]
    );

    const getOverallProgress = useCallback(() => {
        if (downloads.size === 0) return 0;

        const totalProgress = Array.from(downloads.values()).reduce(
            (sum, download) => sum + download.progress,
            0
        );

        return Math.round(totalProgress / downloads.size);
    }, [downloads]);

    return {
        downloads,
        isDownloading,
        startDownload,
        startBatchDownload,
        cancelDownload,
        retryDownload,
        reset,
        getOverallProgress,
    };
}
