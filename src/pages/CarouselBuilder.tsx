import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Layers, Sparkles, ChevronLeft, ChevronRight,
  Plus, Trash2, Download, Send, Loader2, Palette
} from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import type { CarouselSlide } from '../types'

const TEMPLATES = [
  { id: 'minimal-dark', name: 'Minimal Dark', bg: '#0a0a0a', text: '#ffffff', accent: '#3b82f6' },
  { id: 'neon-tech', name: 'Neon Tech', bg: '#050505', text: '#ffffff', accent: '#00f5ff' },
  { id: 'gradient-purple', name: 'Gradient Purple', bg: 'linear-gradient(135deg,#1e1b4b,#4c1d95)', text: '#ffffff', accent: '#a855f7' },
  { id: 'white-clean', name: 'White Clean', bg: '#ffffff', text: '#111827', accent: '#0ea5e9' },
]

const SLIDE_TYPES = ['hook', 'value', 'example', 'tip', 'cta'] as const

const SLIDE_TYPE_COLORS: Record<string, string> = {
  hook: 'bg-red-500/20 text-red-300 border-red-500/30',
  value: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  example: 'bg-green-500/20 text-green-300 border-green-500/30',
  tip: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  cta: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

function SlidePreview({ slide, template }: { slide: CarouselSlide; template: typeof TEMPLATES[0] }) {
  const style: React.CSSProperties = {
    background: template.bg,
    color: slide.text_color || template.text,
    width: '100%',
    aspectRatio: '1',
    borderRadius: '12px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '12px',
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
  }

  const accentBar = {
    width: '40px',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: template.accent,
    marginBottom: '8px',
  } as React.CSSProperties

  return (
    <div style={style}>
      {template.id === 'neon-tech' && (
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: `radial-gradient(circle, ${template.accent}20 0%, transparent 70%)`,
        }} />
      )}
      <div style={accentBar} />
      {slide.type && (
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: template.accent, fontWeight: 700 }}>
          {slide.type}
        </span>
      )}
      <h3 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.2, margin: 0 }}>
        {slide.headline}
      </h3>
      <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.6, margin: 0 }}>
        {slide.body}
      </p>
      <div style={{ position: 'absolute', bottom: '16px', right: '20px', fontSize: '11px', opacity: 0.4 }}>
        {slide.slide_order}
      </div>
    </div>
  )
}

export default function CarouselBuilder() {
  const { addNotification } = useAppStore()
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState(5)
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [brandColor, setBrandColor] = useState('#0ea5e9')
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  const generateMutation = useMutation({
    mutationFn: api.generateCarousel,
    onSuccess: (data) => {
      setSlides(data.slides)
      setActiveSlide(0)
      addNotification('success', `Generated ${data.slides.length} slides!`)
    },
    onError: (e: Error) => addNotification('error', e.message),
  })

  const publishMutation = useMutation({
    mutationFn: api.publishPost,
    onSuccess: () => addNotification('success', 'Carousel published to Instagram!'),
    onError: (e: Error) => addNotification('error', e.message),
  })

  const currentSlide = slides[activeSlide]

  const updateSlide = (field: keyof CarouselSlide, value: string) => {
    setSlides((prev) => prev.map((s, i) =>
      i === activeSlide ? { ...s, [field]: value } : s
    ))
  }

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      slide_order: slides.length + 1,
      headline: 'New Slide',
      body: 'Add your content here...',
      template: selectedTemplate.id,
      type: 'value',
    }
    setSlides((prev) => [...prev, newSlide])
    setActiveSlide(slides.length)
  }

  const removeSlide = () => {
    if (slides.length <= 1) return
    setSlides((prev) => prev.filter((_, i) => i !== activeSlide))
    setActiveSlide(Math.max(0, activeSlide - 1))
  }

  const exportJSON = () => {
    const json = JSON.stringify(slides, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `carousel-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Update canvas mock whenever active slide changes
  useEffect(() => {
    if (canvasRef.current && currentSlide) {
      // Canvas rendering via DOM (Fabric.js would be initialized here for full implementation)
    }
  }, [currentSlide, selectedTemplate])

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-purple-400" />
          Carousel Builder
        </h1>
        <p className="text-dark-400 text-sm mt-1">Create stunning multi-slide carousel content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="space-y-4">
          <div className="card space-y-4">
            <h2 className="font-semibold text-white">Generation Settings</h2>

            <div>
              <label className="label">Topic</label>
              <textarea
                className="input-field resize-none h-20"
                placeholder="e.g. 5 AI automation tools every solopreneur needs"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            {/* Slide count */}
            <div>
              <label className="label">Slides: {slideCount}</label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSlideCount(n)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      slideCount === n
                        ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                        : 'bg-dark-800 border border-dark-600 text-dark-300 hover:border-dark-500'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Template */}
            <div>
              <label className="label">Template</label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`p-2.5 rounded-lg border text-xs text-left transition-all ${
                      selectedTemplate.id === t.id
                        ? 'border-purple-500/60 bg-purple-500/10 text-purple-300'
                        : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500'
                    }`}
                  >
                    <div
                      className="w-full h-8 rounded mb-1.5"
                      style={{ background: t.bg }}
                    />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand Color */}
            <div>
              <label className="label flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                Brand Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-dark-600 bg-dark-800 cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="input-field flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <button
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!topic || generateMutation.isPending}
              onClick={() => generateMutation.mutate({
                topic,
                slide_count: slideCount,
                template: selectedTemplate.id,
                brand_color: brandColor,
              })}
            >
              {generateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating {slideCount} slides...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Generate Carousel</>
              )}
            </button>
          </div>

          {/* Actions */}
          {slides.length > 0 && (
            <div className="card space-y-2">
              <h3 className="font-medium text-white text-sm">Export & Publish</h3>
              <button className="btn-secondary w-full flex items-center justify-center gap-2" onClick={exportJSON}>
                <Download className="w-4 h-4" />
                Export as JSON
              </button>
              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={publishMutation.isPending}
                onClick={() => publishMutation.mutate({
                  platform: 'instagram',
                  content: slides.map((s) => s.headline).join('\n'),
                  post_type: 'carousel',
                })}
              >
                {publishMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                Publish to Instagram
              </button>
            </div>
          )}
        </div>

        {/* Preview + Editor */}
        <div className="lg:col-span-2 space-y-4">
          {slides.length > 0 && currentSlide ? (
            <>
              {/* Canvas Preview */}
              <div className="card" ref={canvasRef}>
                <div className="max-w-xs mx-auto">
                  <SlidePreview slide={currentSlide} template={selectedTemplate} />
                </div>
              </div>

              {/* Slide Navigator */}
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <button
                    className="btn-secondary p-2"
                    disabled={activeSlide === 0}
                    onClick={() => setActiveSlide((i) => i - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveSlide(i)}
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all ${
                          i === activeSlide ? 'bg-purple-400 scale-125' : 'bg-dark-600 hover:bg-dark-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    className="btn-secondary p-2"
                    disabled={activeSlide === slides.length - 1}
                    onClick={() => setActiveSlide((i) => i + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center text-xs text-dark-400 mb-4">
                  Slide {activeSlide + 1} of {slides.length}
                </p>

                {/* Slide Editor */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-dark-400">Type:</span>
                    <div className="flex flex-wrap gap-1">
                      {SLIDE_TYPES.map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSlide('type', t)}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium border transition-all capitalize ${
                            currentSlide.type === t
                              ? SLIDE_TYPE_COLORS[t]
                              : 'bg-dark-800 border-dark-600 text-dark-400 hover:border-dark-500'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="label text-xs">Headline</label>
                    <input
                      type="text"
                      className="input-field text-sm"
                      value={currentSlide.headline}
                      onChange={(e) => updateSlide('headline', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Body Text</label>
                    <textarea
                      className="input-field text-sm resize-none h-20"
                      value={currentSlide.body}
                      onChange={(e) => updateSlide('body', e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn-secondary flex items-center gap-2 text-sm flex-1"
                      onClick={addSlide}
                    >
                      <Plus className="w-4 h-4" /> Add Slide
                    </button>
                    <button
                      className="btn-danger flex items-center gap-2 text-sm"
                      disabled={slides.length <= 1}
                      onClick={removeSlide}
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card flex flex-col items-center justify-center h-80 text-dark-500">
              <Layers className="w-14 h-14 mb-4 opacity-20" />
              <p className="text-lg font-medium text-dark-400">No slides yet</p>
              <p className="text-sm mt-1">Configure settings and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
