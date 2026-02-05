'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ManualSongInputProps {
    onAddSongs: (songs: string[]) => void;
}

export default function ManualSongInput({ onAddSongs }: ManualSongInputProps) {
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAddSongs = () => {
        const trimmedInput = input.trim();
        if (!trimmedInput) return;

        // Split by comma and filter empty strings
        const parsedSongs = trimmedInput
            .split(',')
            .map(song => song.trim())
            .filter(song => song.length > 0);

        if (parsedSongs.length > 0) {
            onAddSongs(parsedSongs);
            setInput('');
            setIsExpanded(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddSongs();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mt-6 sm:mt-8"
        >
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full py-3 px-4 sm:px-6 rounded-xl bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Songs Manually
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Add Songs Manually</h3>
                        <button
                            onClick={() => {
                                setIsExpanded(false);
                                setInput('');
                            }}
                            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Instructions */}
                    <p className="text-xs sm:text-sm text-zinc-400 mb-4">
                        Enter song names separated by <span className="text-white font-semibold">commas (,)</span>
                    </p>

                    {/* Example */}
                    <div className="mb-4 p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-1">Example:</p>
                        <p className="text-sm text-zinc-300 font-mono">Song Name 1, Song Name 2, Song Name 3</p>
                    </div>

                    {/* Input */}
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter song names separated by commas..."
                        className="w-full h-24 sm:h-28 px-4 py-3 bg-zinc-800 text-white text-sm rounded-lg border border-zinc-700 focus:border-white focus:outline-none placeholder-zinc-500 resize-none mb-4"
                    />

                    {/* Preview */}
                    {input.trim() && (
                        <div className="mb-4 p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                            <p className="text-xs text-zinc-400 mb-2">Preview ({input.split(',').filter(s => s.trim()).length} songs):</p>
                            <div className="flex flex-wrap gap-2">
                                {input
                                    .split(',')
                                    .map((song, idx) => song.trim())
                                    .filter(song => song.length > 0)
                                    .map((song, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white"
                                        >
                                            {song}
                                        </span>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setIsExpanded(false);
                                setInput('');
                            }}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddSongs}
                            disabled={!input.trim()}
                            className="flex-1 py-2.5 px-4 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Songs
                        </button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
