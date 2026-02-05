'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Edit2, Download, ArrowLeft, X, Trash2, Plus } from 'lucide-react';
import { ParsedSong } from '@/lib/songParser';
import ManualSongInput from './ManualSongInput';

interface SongConfirmationProps {
    songs: ParsedSong[];
    onConfirm: (selectedSongs: string[]) => void;
    onBack: () => void;
    onAddMoreSongs?: (songs: string[]) => void;
}

export default function SongConfirmation({ songs, onConfirm, onBack, onAddMoreSongs }: SongConfirmationProps) {
    const [selectedSongs, setSelectedSongs] = useState<Set<number>>(new Set(songs.map((_, i) => i)));
    const [editedSongs, setEditedSongs] = useState<Map<number, string>>(new Map());
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showAddMore, setShowAddMore] = useState(false);

    const toggleSong = (index: number) => {
        setSelectedSongs((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const selectAll = () => setSelectedSongs(new Set(songs.map((_, i) => i)));
    const deselectAll = () => setSelectedSongs(new Set());

    const handleAddMoreSongs = (newSongs: string[]) => {
        if (onAddMoreSongs) {
            onAddMoreSongs(newSongs);
        }
        setShowAddMore(false);
    };

    const startEdit = (index: number) => setEditingIndex(index);

    const saveEdit = (index: number, newValue: string) => {
        if (newValue.trim()) {
            setEditedSongs((prev) => new Map(prev).set(index, newValue.trim()));
        }
        setEditingIndex(null);
    };

    const cancelEdit = () => setEditingIndex(null);

    const handleConfirm = () => {
        const finalSongs = Array.from(selectedSongs).map((index) => editedSongs.get(index) || songs[index].cleaned);
        onConfirm(finalSongs);
    };

    const selectedCount = selectedSongs.size;
    const allSelected = selectedCount === songs.length;
    const noneSelected = selectedCount === 0;

    return (
        <div className="w-full max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">Detected Songs</h2>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        <span className="text-white font-bold">{selectedCount}</span> selected of {songs.length} songs
                    </p>
                </div>

                {/* Toggle Buttons - LARGER & MORE VISIBLE */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={selectAll}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${allSelected
                                ? 'bg-white text-black border-white'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white hover:border-zinc-500'
                            }`}
                    >
                        Select All
                    </button>
                    <button
                        onClick={deselectAll}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${noneSelected
                                ? 'bg-white text-black border-white'
                                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white hover:border-zinc-500'
                            }`}
                    >
                        Clear All
                    </button>
                </div>
            </div>

            {/* Song List - COMPACT ROWS */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="divide-y divide-zinc-800/50">
                    {songs.map((song, index) => {
                        const isSelected = selectedSongs.has(index);
                        const isEditing = editingIndex === index;
                        const displayName = editedSongs.get(index) || song.cleaned;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.015 }}
                                className={`
                                    group flex items-center gap-4 px-5 py-4 transition-colors
                                    ${isSelected ? 'bg-zinc-800/20' : 'hover:bg-zinc-800/10'}
                                `}
                            >
                                {/* Checkbox */}
                                <button
                                    onClick={() => toggleSong(index)}
                                    className={`
                                        shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all
                                        focus:outline-none focus:ring-2 focus:ring-white/50
                                        ${isSelected
                                            ? 'bg-white border-white text-black'
                                            : 'bg-transparent border-zinc-600 text-transparent hover:border-zinc-400'}
                                    `}
                                >
                                    <Check className="w-4 h-4" strokeWidth={3} />
                                </button>

                                {/* Song Name - TRUNCATED */}
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                defaultValue={displayName}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveEdit(index, e.currentTarget.value);
                                                    if (e.key === 'Escape') cancelEdit();
                                                }}
                                                autoFocus
                                                className="flex-1 bg-zinc-800 text-white text-sm font-medium px-3 py-2 rounded-lg border border-zinc-600 focus:border-white focus:outline-none"
                                            />
                                            <button onClick={cancelEdit} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p
                                            className={`text-sm font-medium cursor-pointer transition-colors truncate ${isSelected ? 'text-zinc-100' : 'text-zinc-500'
                                                }`}
                                            onClick={() => startEdit(index)}
                                            title={displayName}
                                            style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                        >
                                            {displayName}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {!isEditing && (
                                    <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => startEdit(index)}
                                            className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
                                            title="Edit name"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => toggleSong(index)}
                                            className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                                            title={isSelected ? "Deselect" : "Select"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-10 pt-6 border-t border-zinc-800">
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto h-12 px-6 rounded-xl bg-zinc-900/50 border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={() => setShowAddMore(true)}
                    className="w-full sm:flex-1 h-12 px-6 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold text-sm hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add More Songs
                </button>
                <button
                    onClick={handleConfirm}
                    disabled={selectedCount === 0}
                    className="w-full sm:flex-1 h-12 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-50 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    Download {selectedCount} {selectedCount === 1 ? 'Song' : 'Songs'}
                </button>
            </div>

            {/* Add More Songs Modal */}
            <AnimatePresence>
                {showAddMore && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddMore(false)}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Add More Songs</h3>
                                <button
                                    onClick={() => setShowAddMore(false)}
                                    className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Manual Input Form */}
                            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-zinc-400 mb-3">
                                    Enter song names separated by <span className="text-white font-semibold">commas (,)</span>
                                </p>
                                <p className="text-xs text-zinc-500 mb-2">Example:</p>
                                <p className="text-sm text-zinc-300 font-mono mb-4">Song Name 1, Song Name 2, Song Name 3</p>
                                
                                <textarea
                                    id="manualSongsInput"
                                    placeholder="Enter song names separated by commas..."
                                    className="w-full h-24 px-4 py-3 bg-zinc-800 text-white text-sm rounded-lg border border-zinc-700 focus:border-white focus:outline-none placeholder-zinc-500 resize-none mb-4"
                                />
                                
                                {/* Preview */}
                                {(() => {
                                    const textareaValue = (document.getElementById('manualSongsInput') as HTMLTextAreaElement)?.value || '';
                                    const previewSongs = textareaValue
                                        .split(',')
                                        .map(s => s.trim())
                                        .filter(s => s.length > 0);
                                    
                                    return previewSongs.length > 0 ? (
                                        <div className="mb-4 p-3 bg-zinc-800/30 border border-zinc-700/50 rounded-lg">
                                            <p className="text-xs text-zinc-400 mb-2">Preview ({previewSongs.length} songs):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {previewSongs.map((song, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-full text-xs text-white"
                                                    >
                                                        {song}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const textarea = document.getElementById('manualSongsInput') as HTMLTextAreaElement;
                                            textarea.value = '';
                                            setShowAddMore(false);
                                        }}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const textarea = document.getElementById('manualSongsInput') as HTMLTextAreaElement;
                                            const input = textarea.value.trim();
                                            if (input) {
                                                const songs = input
                                                    .split(',')
                                                    .map(s => s.trim())
                                                    .filter(s => s.length > 0);
                                                if (songs.length > 0) {
                                                    handleAddMoreSongs(songs);
                                                    textarea.value = '';
                                                    setShowAddMore(false);
                                                }
                                            }
                                        }}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Songs
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
