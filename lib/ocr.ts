/**
 * OCR Utilities using Tesseract.js
 * Client-side OCR processing for extracting text from images
 */

import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

/**
 * Initialize Tesseract worker
 */
export async function initializeOCR(): Promise<Worker> {
    if (worker) {
        return worker;
    }

    worker = await createWorker('eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
        },
    });

    return worker;
}

/**
 * Process image and extract text using OCR
 * @param imageFile - Image file to process
 * @returns Extracted text
 */
export async function extractTextFromImage(imageFile: File): Promise<string> {
    const worker = await initializeOCR();

    const {
        data: { text },
    } = await worker.recognize(imageFile);

    return text;
}

/**
 * Cleanup OCR worker
 */
export async function cleanupOCR(): Promise<void> {
    if (worker) {
        await worker.terminate();
        worker = null;
    }
}

/**
 * Process image with progress callback
 */
export async function extractTextWithProgress(
    imageFile: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    const progressWorker = await createWorker('eng', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text' && onProgress) {
                onProgress(m.progress);
            }
        },
    });

    const {
        data: { text },
    } = await progressWorker.recognize(imageFile);

    await progressWorker.terminate();

    return text;
}
