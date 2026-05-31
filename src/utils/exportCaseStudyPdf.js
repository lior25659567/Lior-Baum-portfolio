import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const PX_TO_MM = 0.2645833

function slugify(s) {
  return (s || 'case-study')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function waitForMedia(el, timeout = 3000) {
  const imgs = Array.from(el.querySelectorAll('img'))
  const vids = Array.from(el.querySelectorAll('video'))
  const tasks = []

  imgs.forEach((img) => {
    if (img.complete && img.naturalWidth > 0) return
    tasks.push(
      new Promise((resolve) => {
        const done = () => resolve()
        img.addEventListener('load', done, { once: true })
        img.addEventListener('error', done, { once: true })
        setTimeout(done, timeout)
      })
    )
  })

  vids.forEach((vid) => {
    if (vid.readyState >= 2) return
    tasks.push(
      new Promise((resolve) => {
        const done = () => resolve()
        vid.addEventListener('loadeddata', done, { once: true })
        vid.addEventListener('error', done, { once: true })
        setTimeout(done, timeout)
      })
    )
  })

  await Promise.all(tasks)
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

export async function exportCaseStudyToPdf({
  totalSlides,
  setCurrentSlide,
  getActiveSlideElement,
  projectTitle,
  onProgress,
  scale = 2,
  jpegQuality = 0.85,
}) {
  if (!totalSlides) throw new Error('No slides to export.')

  const captures = []

  for (let i = 0; i < totalSlides; i++) {
    onProgress?.({ phase: 'navigating', i, total: totalSlides })
    setCurrentSlide(i)
    // wait for framer-motion transition (350ms) + layout settle
    await wait(450)

    const el = getActiveSlideElement(i)
    if (!el) continue

    onProgress?.({ phase: 'loading', i, total: totalSlides })
    await waitForMedia(el)
    // small extra settle for fonts / lazy components
    await wait(150)

    onProgress?.({ phase: 'capturing', i, total: totalSlides })
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff'
    const canvas = await html2canvas(el, {
      backgroundColor: bg || '#ffffff',
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      windowWidth: el.scrollWidth,
      windowHeight: el.scrollHeight,
    })
    captures.push(canvas)
  }

  if (!captures.length) throw new Error('No slides captured.')

  onProgress?.({ phase: 'building', i: totalSlides, total: totalSlides })

  // Build PDF — each page sized to match the captured slide
  const first = captures[0]
  const orientation = first.width >= first.height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [first.width * PX_TO_MM / scale, first.height * PX_TO_MM / scale],
    compress: true,
  })

  captures.forEach((canvas, i) => {
    const wMm = (canvas.width * PX_TO_MM) / scale
    const hMm = (canvas.height * PX_TO_MM) / scale
    if (i > 0) {
      pdf.addPage([wMm, hMm], wMm >= hMm ? 'landscape' : 'portrait')
    }
    const img = canvas.toDataURL('image/jpeg', jpegQuality)
    pdf.addImage(img, 'JPEG', 0, 0, wMm, hMm, undefined, 'FAST')
  })

  pdf.save(`${slugify(projectTitle)}.pdf`)
  onProgress?.({ phase: 'done', i: totalSlides, total: totalSlides })
}
