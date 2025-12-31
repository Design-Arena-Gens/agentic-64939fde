'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')

  const generateVideo = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    setGenerating(true)
    setProgress('Starting generation...')
    setError('')
    setVideoUrl('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))

              if (data.progress) {
                setProgress(data.progress)
              }

              if (data.videoUrl) {
                setVideoUrl(data.videoUrl)
              }

              if (data.error) {
                setError(data.error)
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold mb-4 gradient-text">
            Viral AI Video Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Create stunning 15-second recommendation videos with AI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                What should I recommend?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Best productivity app for 2025"
                className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                disabled={generating}
              />
            </div>

            <button
              onClick={generateVideo}
              disabled={generating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : '🎬 Generate Viral Video'}
            </button>

            <AnimatePresence>
              {generating && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-black/30 rounded-lg p-4 border border-purple-500/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-300">{progress}</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 15, ease: 'linear' }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400"
                >
                  {error}
                </motion.div>
              )}

              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-black/30 rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold mb-4 text-green-400">
                      ✨ Video Generated Successfully!
                    </h3>
                    <video
                      src={videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full rounded-lg shadow-2xl"
                    />
                    <a
                      href={videoUrl}
                      download="viral-video.mp4"
                      className="mt-4 block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-all"
                    >
                      📥 Download Video
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>Powered by Kling AI • ElevenLabs • Lip-Sync Technology</p>
        </motion.div>
      </div>
    </main>
  )
}
