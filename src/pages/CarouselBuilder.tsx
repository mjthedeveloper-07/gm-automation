import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toBlob } from 'html-to-image'
import { supabase } from '../lib/supabase'
import {
  Layers, Sparkles, ChevronLeft, ChevronRight,
  Plus, Trash2, Download, Send, Loader2, Palette, Clock
} from 'lucide-react'
import { api } from '../lib/api'
import { useAppStore } from '../store/appStore'
import type { CarouselSlide } from '../types'

const TEMPLATES = [
  { id: 'c1', name: 'Terminal Green', bg: '#000000', text: '#ffffff', accent: '#00e676' },
  { id: 'c2', name: 'Off-white Editorial', bg: '#f4f1eb', text: '#0d0d0d', accent: '#0d0d0d' },
  { id: 'c3', name: 'Orange Fire', bg: '#ff6b35', text: '#ffffff', accent: '#ffffff' },
  { id: 'c4', name: 'Deep Blue Split', bg: '#0d47a1', text: '#ffffff', accent: '#90caf9' },
  { id: 'c5', name: 'White Brutalist', bg: '#ffffff', text: '#0d0d0d', accent: '#ff6b35' },
  { id: 'c6', name: 'Dark Grid', bg: '#0a0a0a', text: '#ffffff', accent: '#00e676' },
]

const SLIDE_TYPES = ['hook', 'value', 'example', 'tip', 'cta'] as const

const SLIDE_TYPE_COLORS: Record<string, string> = {
  hook: 'bg-red-500/20 text-red-300 border-red-500/30',
  value: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  example: 'bg-green-500/20 text-green-300 border-green-500/30',
  tip: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  cta: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
}

function renderHeadline(headline: string, templateId: string) {
  const words = headline.split(' ')
  if (words.length <= 1) return <>{headline}</>
  
  if (templateId === 'c1' || templateId === 'c4' || templateId === 'c6') {
    const normal = words.slice(0, -2).join(' ')
    const highlight = words.slice(-2).join(' ')
    return <>{normal}{normal && <br/>}<span>{highlight}</span>{templateId === 'c1' && <span className="slide-cursor"/>}</>
  }
  if (templateId === 'c2') {
    const normal = words.slice(0, -1).join(' ')
    const highlight = words.slice(-1).join(' ')
    return <>{normal}{normal && <br/>}<em>{highlight}</em></>
  }
  if (templateId === 'c3') {
    const highlight = words.slice(0, 2).join(' ')
    const normal = words.slice(2).join(' ')
    return <><strong>{highlight}</strong><br/>{normal}</>
  }
  if (templateId === 'c5') {
    const sToken = words[0]
    const bToken = words[words.length - 1]
    const normal = words.slice(1, -1).join(' ')
    return <><s>{sToken}</s><br/>{normal}<br/><b>{bToken}</b></>
  }

  return <>{headline}</>
}

function SlidePreview({ slide, template }: { slide: CarouselSlide; template: typeof TEMPLATES[0] }) {
  const tId = template.id

  return (
    <div className="slide-container">
      <div className={`slide-card slide-${tId}`} style={{ background: template.bg }}>
        
        {tId === 'c2' && (
          <>
            <div className="slide-bar"></div>
            <div className="slide-code-stamp">frontend/<br/>backend/<br/>database/<br/>hosting/</div>
          </>
        )}
        {tId === 'c3' && <div className="slide-stamp">FULL<br/>STACK</div>}
        {tId === 'c4' && <div className="slide-line"></div>}
        {tId === 'c5' && <div className="slide-accent"></div>}
        {tId === 'c6' && (
          <>
            <div className="slide-grid-bg"></div>
            <div className="slide-dot"></div>
          </>
        )}

        <div className="slide-tag">// hook {String(slide.slide_order).padStart(2, '0')} — THE {slide.type?.toUpperCase()}</div>
        <div className="slide-hook">
          {renderHeadline(slide.headline || 'Your Headline Here', tId)}
        </div>
        <div className="slide-sub">
          {slide.body || 'Add your slide content here to explain your point.'}
        </div>

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
  const [isPublishing, setIsPublishing] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
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
    onSuccess: () => {
      addNotification('success', 'Carousel published to Instagram!')
      setIsPublishing(false)
    },
    onError: (e: Error) => {
      addNotification('error', e.message)
      setIsPublishing(false)
    },
  })

  const scheduleMutation = useMutation({
    mutationFn: api.schedulePost,
    onSuccess: () => {
      addNotification('success', 'Carousel scheduled successfully!')
      setIsScheduling(false)
      setScheduleDate('')
    },
    onError: (e: Error) => {
      addNotification('error', e.message)
      setIsScheduling(false)
    },
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

  const handlePublish = async () => {
    if (slides.length === 0) return
    setIsPublishing(true)

    try {
      const mediaUrls: string[] = await prepareMedia()
      
      addNotification('info', 'Publishing carousel to Instagram! This may take a moment...')
      
      const combinedCaption = generateCaption()

      publishMutation.mutate({
        platform: 'instagram',
        content: combinedCaption,
        caption: combinedCaption,
        post_type: 'carousel',
        media_urls: mediaUrls
      })

    } catch (err: any) {
      addNotification('error', err.message || 'Export failed')
      setIsPublishing(false)
    }
  }

  const handleSchedule = async () => {
    if (slides.length === 0 || !scheduleDate) return
    setIsScheduling(true)

    try {
      const mediaUrls: string[] = await prepareMedia()
      
      addNotification('info', 'Scheduling your carousel...')
      
      const combinedCaption = generateCaption()

      scheduleMutation.mutate({
        content: topic, // fallback content
        platforms: ['instagram'],
        scheduled_at: new Date(scheduleDate).toISOString(),
        caption: combinedCaption,
        media_urls: mediaUrls,
        content_type: 'carousel'
      })

    } catch (err: any) {
      addNotification('error', err.message || 'Scheduling failed')
      setIsScheduling(false)
    }
  }

  const prepareMedia = async () => {
    const mediaUrls: string[] = []
    
    for (let i = 0; i < slides.length; i++) {
      const node = document.getElementById(`slide-export-${i}`)
      if (!node) throw new Error(`Export node for slide ${i+1} not found`)
      
      try {
        addNotification('info', `Preparing slide ${i+1} of ${slides.length}...`)
        
        // Small delay to ensure all assets/fonts are loaded in the hidden container
        await new Promise(r => setTimeout(r, 500))

        // Target 1080px resolution for Instagram quality
        const exportWidth = 1080
        const pixelRatio = 2 // Double sharpness
        
        const blob = await toBlob(node, {
          canvasWidth: exportWidth,
          canvasHeight: exportWidth,
          quality: 1,
          pixelRatio,
          cacheBust: true,
          style: {
            transform: 'scale(1)',
            transformOrigin: 'top left'
          }
        }).catch(err => {
          console.error('html-to-image error:', err)
          throw new Error(`Rendering failed: ${err.message}`)
        })
        
        if (!blob) throw new Error(`Rendering produced an empty image for slide ${i+1}`)
        
        const fileName = `carousel_${Date.now()}_slide_${i+1}.png`
        addNotification('info', `Uploading slide ${i+1}...`)
        
        const { error } = await supabase.storage
          .from('carousel_assets')
          .upload(fileName, blob, { 
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: false
          })
          
        if (error) {
          console.error('Supabase upload error:', error)
          throw new Error(`Upload failed: ${error.message}`)
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('carousel_assets')
          .getPublicUrl(fileName)
          
        if (!publicUrlData.publicUrl) throw new Error(`Failed to get public URL for slide ${i+1}`)
        mediaUrls.push(publicUrlData.publicUrl)
        
      } catch (err: any) {
        console.error(`Error processing slide ${i+1}:`, err)
        throw new Error(`Slide ${i+1}: ${err.message}`)
      }
    }
    return mediaUrls
  }

  const generateCaption = () => {
    return `🚀 ${topic}\n\n` + 
      slides.map((s, idx) => `${idx + 1}. ${s.headline}`).join('\n') +
      `\n\nFollow for more daily value! 🔥\n#automation #software #tech`
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
            <div className="card space-y-3">
              <h3 className="font-medium text-white text-sm">Export & Publish</h3>
              
              <button className="btn-secondary w-full flex items-center justify-center gap-2" onClick={exportJSON}>
                <Download className="w-4 h-4" />
                Export as JSON
              </button>

              <button
                className="btn-primary w-full flex items-center justify-center gap-2"
                disabled={isPublishing || publishMutation.isPending || isScheduling}
                onClick={handlePublish}
              >
                {isPublishing || publishMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />
                }
                Publish Now
              </button>

              <div className="pt-2 border-t border-dark-700 space-y-2">
                <p className="text-[10px] font-bold text-dark-500 uppercase tracking-wider">Later</p>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    className="input-field flex-1 text-sm bg-dark-950"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                  <button
                    className="btn-secondary flex items-center gap-2"
                    disabled={!scheduleDate || isScheduling || isPublishing}
                    onClick={handleSchedule}
                  >
                    {isScheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    Schedule
                  </button>
                </div>
              </div>
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

      {/* Hidden Export Container — keeping it in DOM but off-screen and visible for html-to-image stability */}
      <div style={{ position: 'absolute', top: '-20000px', left: '-20000px', pointerEvents: 'none', visibility: 'visible' }}>
        {slides.map((slide, i) => (
          <div key={i} id={`slide-export-${i}`} style={{ width: '1080px', height: '1080px' }}>
            <SlidePreview slide={slide} template={selectedTemplate} />
          </div>
        ))}
      </div>
    </div>
  )
}
