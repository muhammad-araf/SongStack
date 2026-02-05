'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import UploadZone from './components/UploadZone';
import ManualSongInput from './components/ManualSongInput';
import SongConfirmation from './components/SongConfirmation';
import DownloadProgress from './components/DownloadProgress';
import { useOCR } from '@/hooks/useOCR';
import { useDownload } from '@/hooks/useDownload';
import type { ParsedSong } from '@/lib/songParser';

type Step = 'upload' | 'confirm' | 'download';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [manualSongs, setManualSongs] = useState<ParsedSong[]>([]);
  const { isProcessing, progress, error, songs, processImage, reset: resetOCR } = useOCR();
  const {
    downloads,
    isDownloading,
    startBatchDownload,
    cancelDownload,
    retryDownload,
    reset: resetDownload,
    getOverallProgress,
  } = useDownload();

  const handleImageUpload = async (file: File) => {
    await processImage(file);
  };

  const handleAddManualSongs = (newSongs: string[]) => {
    const parsedSongs = newSongs.map(song => ({
      original: song,
      cleaned: song,
      confidence: 1,
    }));
    setManualSongs(prev => [...prev, ...parsedSongs]);
    setCurrentStep('confirm');
  };

  const handleConfirm = async (selectedSongs: string[]) => {
    setCurrentStep('download');
    await startBatchDownload(selectedSongs);
  };

  const handleBack = () => {
    resetOCR();
    resetDownload();
    setManualSongs([]);
    setCurrentStep('upload');
  };

  const allSongs = [...songs, ...manualSongs];

  const handleAddMoreSongs = (newSongs: string[]) => {
    const parsedSongs = newSongs.map(song => ({
      original: song,
      cleaned: song,
      confidence: 1,
    }));
    setManualSongs(prev => [...prev, ...parsedSongs]);
  };

  const handleCancelScan = () => {
    resetOCR();
  };

  if (currentStep === 'upload' && songs.length > 0 && !isProcessing) {
    setCurrentStep('confirm');
  }

  const overallProgress = getOverallProgress();
  const isComplete = currentStep === 'download' && overallProgress === 100 && !isDownloading;

  // Step numbers for indicator
  const stepNumber = currentStep === 'upload' ? 1 : currentStep === 'confirm' ? 2 : 3;

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Background - Local noise pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `
          repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,.1) 1px, rgba(255,255,255,.1) 2px),
          repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(255,255,255,.1) 1px, rgba(255,255,255,.1) 2px)
        `
      }}></div>

      {/* Main container with proper max-width */}
      <div className="min-h-screen flex flex-col max-w-6xl mx-auto">

        {/* HEADER - Professional Responsive Layout */}
        <header className="w-full py-4 px-4 sm:py-5 sm:px-6 md:py-6 md:px-8 border-b border-zinc-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            {/* Logo Row - Left Side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Music2 className="w-6 sm:w-7 h-6 sm:h-7 text-white flex-shrink-0" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">SongStack</h1>
                <span className="text-[8px] sm:text-[9px] text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded font-medium">v2.3</span>
              </div>
            </div>

            {/* Step Indicator - Right Side - Desktop Only */}
            <div className="hidden md:flex items-center gap-2 sm:gap-4 overflow-x-auto flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap">
                <StepPill number={1} label="Upload" isActive={stepNumber === 1} isCompleted={stepNumber > 1} />
                <div className="w-5 sm:w-8 h-px bg-zinc-800/50 flex-shrink-0"></div>
                <StepPill number={2} label="Select" isActive={stepNumber === 2} isCompleted={stepNumber > 2} />
                <div className="w-5 sm:w-8 h-px bg-zinc-800/50 flex-shrink-0"></div>
                <StepPill number={3} label="Download" isActive={stepNumber === 3} isCompleted={isComplete} />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12">

          {/* ===== UPLOAD STATE ===== */}
          {currentStep === 'upload' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="w-full max-w-2xl">
                {/* Headline - CLEAR HIERARCHY */}
                <div className="text-center mb-10 sm:mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">Batch Download Songs</h2>
                  <p className="text-zinc-400 text-base sm:text-lg">Upload a playlist screenshot to extract and download all songs</p>
                </div>

                {/* Upload Zone with integrated processing state */}
                <UploadZone 
                  onImageUpload={handleImageUpload} 
                  isProcessing={isProcessing}
                  progress={progress}
                  onCancelScan={handleCancelScan}
                />

                {/* Manual Song Input */}
                <div className="mt-8 sm:mt-10">
                  <ManualSongInput onAddSongs={handleAddManualSongs} />
                </div>

                {/* Error State */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-5 bg-red-950/50 border border-red-900/50 rounded-xl flex items-center gap-3"
                  >
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===== CONFIRM STATE ===== */}
          {currentStep === 'confirm' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <SongConfirmation songs={allSongs} onConfirm={handleConfirm} onBack={handleBack} onAddMoreSongs={handleAddMoreSongs} />
            </motion.div>
          )}

          {/* ===== DOWNLOAD STATE ===== */}
          {currentStep === 'download' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Success Celebration */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-5 bg-green-950/40 border border-green-800/50 rounded-2xl flex items-center gap-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-lg font-bold text-green-300">All downloads complete!</p>
                    <p className="text-green-400/70 text-sm">Check your downloads folder</p>
                  </div>
                </motion.div>
              )}

              <DownloadProgress downloads={downloads} overallProgress={overallProgress} onCancelDownload={cancelDownload} onRetryDownload={retryDownload} />

              {/* New Session Button */}
              {!isDownloading && downloads.size > 0 && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleBack}
                    className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Start New Session
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </main>

        {/* FOOTER */}
        <footer className="py-6 px-6 sm:px-8 text-center border-t border-zinc-900">
          <p className="text-xs text-zinc-600">SongStack Audio Engine</p>
        </footer>
      </div>
    </div>
  );
}

// Step Pill Component - Responsive & Professional
function StepPill({ number, label, isActive, isCompleted }: { number: number; label: string; isActive: boolean; isCompleted: boolean }) {
  return (
    <div className={`
      flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all whitespace-nowrap
      ${isCompleted ? 'bg-white/10 border-white/20 text-white' : ''}
      ${isActive ? 'bg-white text-black border-white shadow-lg shadow-white/20' : ''}
      ${!isActive && !isCompleted ? 'bg-zinc-900/40 border-zinc-700 text-zinc-500' : ''}
    `}>
      <span className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full text-[9px] sm:text-xs font-bold flex items-center justify-center flex-shrink-0 transition-all ${
        isCompleted ? 'bg-white text-black' :
        isActive ? 'bg-black text-white' :
        'bg-zinc-700 text-zinc-400'
      }`}>
        {isCompleted ? '✓' : number}
      </span>
      <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{label}</span>
    </div>
  );
}
