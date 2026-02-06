'use client';

import { motion } from 'framer-motion';
import { Loader2, Check, XCircle, Clock, RefreshCw, X } from 'lucide-react';

interface SongDownloadStatus {
    songName: string;
    status: 'pending' | 'searching' | 'downloading' | 'complete' | 'error';
    progress: number;
    error?: string;
    downloadedFile?: string;
    duration?: string;
    url?: string;

    fileSize?: string;
    thumbnail?: string;
}

interface DownloadProgressProps {
    downloads: Map<string, SongDownloadStatus>;
    overallProgress: number;
    onCancelDownload?: (songName: string) => void;
    onRetryDownload?: (songName: string) => Promise<void>;
}

export default function DownloadProgress({ downloads, overallProgress, onCancelDownload, onRetryDownload }: DownloadProgressProps) {
    const downloadList = Array.from(downloads.entries());
    const completedCount = downloadList.filter(([_, item]) => item.status === 'complete').length;
    const errorCount = downloadList.filter(([_, item]) => item.status === 'error').length;
    const processingIndex = downloadList.findIndex(([_, item]) => item.status === 'downloading');
    const totalCount = downloadList.length;

    const getStatusDetails = (item: SongDownloadStatus, index: number) => {
        switch (item.status) {
            case 'complete':
                return {
                    icon: <Check className="w-4 h-4" />,
                    bg: 'bg-green-500',
                    text: 'text-green-400',
                    label: 'Done'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-4 h-4" />,
                    bg: 'bg-red-500',
                    text: 'text-red-400',
                    label: item.error || 'Failed'
                };
            case 'downloading':
                return {
                    icon: <Loader2 className="w-4 h-4 animate-spin" />,
                    bg: 'bg-blue-500',
                    text: 'text-blue-400',
                    label: `${item.progress}%`
                };
            case 'searching':
                return {
                    icon: <Loader2 className="w-4 h-4 animate-spin" />,
                    bg: 'bg-yellow-500',
                    text: 'text-yellow-400',
                    label: 'Searching...'
                };
            default:
                return {
                    icon: <Clock className="w-4 h-4" />,
                    bg: 'bg-zinc-700',
                    text: 'text-zinc-500',
                    label: `#${index + 1} in queue`
                };
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">

            {/* Progress Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 mb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                            {overallProgress === 100 ? 'Downloads Complete!' : 'Downloading...'}
                        </h2>
                        <p className="text-zinc-400 text-xs sm:text-sm">
                            <span className="text-white font-bold">{completedCount}</span> of {totalCount} completed
                            {errorCount > 0 && (
                                <span className="text-red-400 ml-2">· {errorCount} failed</span>
                            )}
                        </p>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{overallProgress}%</div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className={`h-full rounded-full ${errorCount > 0 && overallProgress === 100 ? 'bg-yellow-500' : 'bg-white'}`}
                    />
                </div>

                {/* Currently Processing */}
                {processingIndex !== -1 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-3">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                        <span className="text-sm text-zinc-400">
                            Now downloading: <span className="text-white font-medium">{downloadList[processingIndex][0]}</span>
                        </span>
                    </div>
                )}
            </div>

            {/* Download List - COMPACT ROWS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-zinc-800/50">
                    {downloadList.map(([name, item], index) => {
                        const statusDetails = getStatusDetails(item, index);
                        const isDownloading = item.status === 'downloading';

                        return (
                            <motion.div
                                key={name}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className={`flex flex-col gap-3 px-5 py-4 ${isDownloading ? 'bg-zinc-800/30' : ''}`}
                            >
                                {/* Main row */}
                                <div className="flex items-center gap-4">
                                    {/* Status Icon or Thumbnail */}
                                    <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center overflow-hidden bg-zinc-800 ${!item.thumbnail ? statusDetails.bg : ''}`}>
                                        {item.thumbnail ? (
                                            <div className="relative w-full h-full">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={item.thumbnail}
                                                    alt={name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Overlay status icon on corner if needed, or just let the simple UI speak for itself */}
                                                {item.status === 'complete' && (
                                                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                                        <Check className="w-5 h-5 text-white drop-shadow-md" strokeWidth={3} />
                                                    </div>
                                                )}
                                                {item.status === 'error' && (
                                                    <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                                                        <XCircle className="w-5 h-5 text-white drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={`text-black ${statusDetails.text.replace('text-', 'text-black')}`}>
                                                {statusDetails.icon}
                                            </div>
                                        )}
                                    </div>

                                    {/* Song Name & Duration & File Size */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${item.status === 'complete' ? 'text-zinc-200' :
                                            item.status === 'downloading' ? 'text-white' :
                                                'text-zinc-500'
                                            }`}>
                                            {name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                                            {item.duration && (
                                                <span>Duration: {item.duration}</span>
                                            )}
                                            {item.fileSize && (
                                                <>
                                                    {item.duration && <span>•</span>}
                                                    <span>Size: {item.fileSize}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Label & Actions */}
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span className={`text-xs font-semibold whitespace-nowrap ${statusDetails.text}`}>
                                            {statusDetails.label}
                                        </span>

                                        {/* Cancel Button for Downloading */}
                                        {isDownloading && onCancelDownload && (
                                            <button
                                                onClick={() => onCancelDownload(name)}
                                                className="p-2 rounded-lg bg-orange-500/20 text-orange-400 hover:text-white hover:bg-orange-500/40 border border-orange-500/30 hover:border-orange-500/60 transition-all active:scale-95 font-semibold"
                                                title="Cancel download"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}

                                        {/* Retry Button for Failed */}
                                        {item.status === 'error' && onRetryDownload && (
                                            <button
                                                onClick={() => onRetryDownload(name)}
                                                className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 transition-all active:scale-95"
                                                title="Retry download"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Progress bar for downloading & searching items */}
                                {(item.status === 'downloading' || item.status === 'searching') && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.progress}%` }}
                                                transition={{ duration: 0.3 }}
                                                className={`h-full rounded-full ${item.status === 'searching'
                                                    ? 'bg-linear-to-r from-yellow-500 to-orange-500'
                                                    : 'bg-linear-to-r from-blue-500 to-cyan-500'
                                                    }`}
                                            />
                                        </div>
                                        <span className={`text-xs font-semibold tabular-nums ${item.status === 'searching'
                                            ? 'text-yellow-400'
                                            : 'text-blue-400'
                                            }`}>{item.progress}%</span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
