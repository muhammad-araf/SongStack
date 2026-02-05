/**
 * Custom React hook for OCR processing
 */

'use client';

import { useState, useCallback } from 'react';
import { extractTextWithProgress } from '@/lib/ocr';
import { extractSongNames, parseYouTubePlaylist, refineSongList, ParsedSong } from '@/lib/songParser';

export interface UseOCRResult {
    isProcessing: boolean;
    progress: number;
    error: string | null;
    extractedText: string | null;
    songs: ParsedSong[];
    processImage: (file: File) => Promise<void>;
    reset: () => void;
}

export function useOCR(): UseOCRResult {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [extractedText, setExtractedText] = useState<string | null>(null);
    const [songs, setSongs] = useState<ParsedSong[]>([]);

    const processImage = useCallback(async (file: File) => {
        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setExtractedText(null);
        setSongs([]);

        try {
            // Extract text from image
            const text = await extractTextWithProgress(file, (p) => {
                setProgress(Math.round(p * 100));
            });

            setExtractedText(text);

            // Parse song names using YouTube-specific parser first
            let parsedSongs = parseYouTubePlaylist(text);

            // If YouTube parser didn't find much, use general parser
            if (parsedSongs.length < 3) {
                parsedSongs = extractSongNames(text);
            }

            // Refine the song list
            const refinedSongs = refineSongList(parsedSongs, 30);

            if (refinedSongs.length === 0) {
                setError('No songs found in the image. Please try a clearer screenshot.');
            } else {
                setSongs(refinedSongs);
            }
        } catch (err) {
            console.error('OCR Error:', err);
            setError(err instanceof Error ? err.message : 'Failed to process image');
        } finally {
            setIsProcessing(false);
            setProgress(100);
        }
    }, []);

    const reset = useCallback(() => {
        setIsProcessing(false);
        setProgress(0);
        setError(null);
        setExtractedText(null);
        setSongs([]);
    }, []);

    return {
        isProcessing,
        progress,
        error,
        extractedText,
        songs,
        processImage,
        reset,
    };
}
