# SongStack - Batch Song Download Application

A modern, responsive web application that extracts song names from playlist screenshots and manually entered text, then automatically downloads them. Features AI-powered OCR detection plus manual song input for maximum flexibility.

## ✨ Features

- 🎯 **Smart OCR Detection** - AI-powered text extraction using Tesseract.js
- 📝 **Manual Song Input** - Easily add songs by typing them (comma-separated)
- 🧹 **Intelligent Filtering** - Automatically removes YouTube metadata and noise
- ✏️ **Editable Results** - Review and edit extracted or manually added songs
- ⚡ **Batch Downloads** - Download multiple songs with progress tracking
- 📊 **Per-Song Progress** - Individual progress bars and status indicators
- 📦 **File Size Display** - See download sizes before downloading
- ⏱️ **Duration Info** - Shows song duration in MM:SS format
- 🎨 **Premium UI** - Modern, fully responsive design with smooth animations
- 📱 **Mobile Optimized** - Works seamlessly on phones, tablets, and desktops
- 🔒 **Privacy First** - All processing happens client-side in your browser

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy!

Environment variables (optional):
- `YOUTUBE_API_KEY` - For better search results (if using YouTube Data API)

## 🚀 How It Works

### Option 1: Upload Screenshot (OCR)
1. **Upload Screenshot** - Drag & drop a playlist screenshot
2. **OCR Processing** - Tesseract.js extracts text from the image
3. **Smart Parsing** - Filters out metadata and identifies song names
4. **Review** - Edit any detected songs if needed
5. **Download** - Download selected songs

### Option 2: Manual Input
1. **Add Songs** - Click "Add Songs Manually" on the upload page
2. **Enter Songs** - Type song names separated by commas (e.g., "Song 1, Song 2, Song 3")
3. **Preview** - See a live preview of your song list
4. **Confirm** - Click "Add Songs" to go to confirmation
5. **Download** - Select and download your songs

### Option 3: Mixed Approach
1. Upload a screenshot (OCR detection)
2. From the confirmation page, click "Add More Songs"
3. Manually add additional songs
4. Download all songs together

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI Components**: Lucide React Icons

### Processing
- **OCR**: Tesseract.js (client-side text extraction)
- **YouTube Search**: yt-search
- **Download**: ytdl-core with ffmpeg support
- **File Handling**: Blob API for size calculation

### State Management
- **React Hooks**: useState, useCallback, useRef
- **Custom Hooks**: useOCR, useDownload

### Development
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **CSS Processing**: PostCSS

## ⚠️ Legal Disclaimer

This tool is for **educational purposes only**. Please respect copyright laws and only download content you have the legal right to download. 

**Important**: YouTube's Terms of Service prohibit downloading content without explicit permission from the copyright holder. Always ensure you have the proper rights before downloading any content.

## 📝 Environment Setup

No environment variables are required for basic functionality. All OCR and download processing happens client-side.

## 🐛 Troubleshooting

### OCR Not Working
- Ensure the screenshot is clear and readable
- Try adjusting the image contrast
- Manually add songs using the text input as a workaround

### Downloads Failing
- Check your internet connection
- Ensure the song exists on YouTube
- Try refreshing the page and retrying

### Performance Issues
- Close other browser tabs to free up memory
- Try downloading fewer songs at once
- Clear browser cache if needed

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - See LICENSE file for details
