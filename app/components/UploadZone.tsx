'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
    onImageUpload: (file: File) => Promise<void>;
    isProcessing: boolean;
    progress?: number;
    onCancelScan?: () => void;
}

export default function UploadZone({ onImageUpload, isProcessing, progress = 0, onCancelScan }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onImageUpload(file);
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const blob = items[i].getAsFile();
                        if (blob) handleFile(blob);
                    }
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, []);

    const clearPreview = () => {
        setPreview(null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`
                            relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300
                            p-12 sm:p-16 py-16 sm:py-20
                            ${isDragging
                                ? 'border-white bg-white/10 shadow-[0_0_60px_rgba(255,255,255,0.2)]'
                                : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50'}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isProcessing}
                        />

                        <div className="flex flex-col items-center text-center gap-5">
                            {/* Icon - LARGER */}
                            <div className={`
                                w-20 h-20 rounded-2xl flex items-center justify-center transition-all
                                ${isDragging ? 'bg-white text-black scale-110' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}
                            `}>
                                {isDragging ? (
                                    <Upload className="w-9 h-9" />
                                ) : (
                                    <ImageIcon className="w-9 h-9" />
                                )}
                            </div>

                            {/* Text - CLEARER */}
                            <div>
                                <p className={`text-xl font-bold mb-2 transition-colors ${isDragging ? 'text-white' : 'text-zinc-100'}`}>
                                    {isDragging ? 'Drop it here!' : 'Drop playlist screenshot'}
                                </p>
                                <p className="text-zinc-500 text-sm">or click to browse · paste from clipboard</p>
                            </div>

                            {/* Supported Platforms - BRIGHTER */}
                            <div className="flex items-center gap-2 mt-3">
                                <span className="px-4 py-1.5 bg-red-950/50 border border-red-900/50 rounded-full text-xs font-semibold text-red-400">YouTube</span>
                                <span className="px-4 py-1.5 bg-green-950/50 border border-green-900/50 rounded-full text-xs font-semibold text-green-400">Spotify</span>
                                <span className="px-4 py-1.5 bg-pink-950/50 border border-pink-900/50 rounded-full text-xs font-semibold text-pink-400">Apple Music</span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden"
                    >
                        {/* Close Button - ALWAYS VISIBLE */}
                        <button
                            onClick={clearPreview}
                            disabled={isProcessing}
                            className="absolute top-3 right-3 z-20 w-10 h-10 flex items-center justify-center bg-black/80 hover:bg-black backdrop-blur border border-zinc-700 rounded-xl text-white transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Image Preview */}
                        <div className="relative">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full max-h-[350px] object-contain"
                            />
                        </div>

                        {/* File Name */}
                        {fileName && (
                            <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950">
                                <p className="text-sm text-zinc-400 truncate">{fileName}</p>
                            </div>
                        )}

                        {/* Processing State - Under Image */}
                        {isProcessing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="px-4 py-4 sm:px-5 sm:py-5 border-t border-zinc-800 bg-zinc-950/50"
                            >
                                {/* Progress Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                                        <span className="text-sm font-semibold text-white">Scanning image...</span>
                                    </div>
                                    <span className="text-sm font-bold text-white">{progress}%</span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.3 }}
                                        className="h-full bg-white rounded-full"
                                    />
                                </div>

                                {/* Cancel Button */}
                                <button
                                    onClick={onCancelScan}
                                    className="w-full py-2 text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-all active:scale-95"
                                >
                                    Cancel Scan
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
