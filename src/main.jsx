import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './styles.css'

let portfolioScrollPosition = 0

const projects = [
  { id: 'ren-shi', title: '认识', image: '/assets/home/card-ren-shi.webp', enabled: true, className: 'card-ren-shi' },
  { id: '6070', title: '6070俱乐部', image: '/assets/home/card-6070.webp', enabled: true, className: 'card-6070' },
  { id: 'shouyu', title: '授渔成长馆', image: '/assets/home/card-shouyu.webp', enabled: true, className: 'card-shouyu' },
  { id: 'imeo', title: 'imeo', image: '/assets/home/card-imeo.webp', enabled: true, className: 'card-imeo' },
  { id: 'reson', title: 'reson', image: '/assets/home/card-reson.webp', enabled: true, className: 'card-reson' },
  { id: 'b2b', title: 'B端', image: '/assets/home/card-b2b.webp', enabled: true, className: 'card-b2b' },
  { id: 'logo', title: 'logo', image: '/assets/home/card-logo.webp', enabled: true, className: 'card-logo' },
]

function BrandLockup({ mobile = false }) {
  const suffix = mobile ? 'mobile' : 'desktop'
  return (
    <div className={`brand-lockup ${mobile ? 'brand-lockup-mobile' : ''}`}>
      <img className="portfolio-art" src={`/assets/ui/portfolio-${suffix}.svg`} alt="PORTFOLIO" />
      <div className="brand-line" />
      <div className="brand-meta-art">
        <img src={`/assets/ui/name-${suffix}.svg`} alt="LUO.XIN" />
        <img src={`/assets/ui/slashes-${suffix}.svg`} alt="" />
        <img src={`/assets/ui/year-${suffix}.svg`} alt="2015-NOW" />
      </div>
    </div>
  )
}

function ProjectGrid({ onOpen, onResume, mobile = false }) {
  const left = [projects[0], projects[2], projects[4], projects[6]]
  const right = [projects[1], projects[3], projects[5]]
  const card = (project) => (
    <button
      key={project.id}
      type="button"
      aria-label={project.enabled ? `打开项目：${project.title}` : project.title}
      className={`project-card ${project.className} ${project.enabled ? 'is-enabled' : 'is-disabled'}`}
      onClick={() => project.enabled && onOpen(project.id)}
      disabled={!project.enabled}
    >
      <img src={project.image} alt={project.title} draggable="false" loading="lazy" decoding="async" />
    </button>
  )
  return (
    <div className={`project-grid ${mobile ? 'project-grid-mobile' : ''}`}>
      <div className="project-column">{left.map(card)}</div>
      <div className="project-column project-column-right">
        {right.map((project, index) => (
          <React.Fragment key={project.id}>
            {index === 0 && mobile && <ResumePill className="resume-in-grid" onOpen={onResume} />}
            {card(project)}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function ResumePill({ className = '', onOpen }) {
  return <button className={`resume-pill ${className}`} onClick={onOpen}>RESUME <img src="/assets/ui/scroll-arrow.svg" alt="" /></button>
}

function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const desktopRef = useRef(null)
  const mobileRef = useRef(null)
  const mobileProjectsRef = useRef(null)
  const leavingRef = useRef(false)
  const desktopActivatedRef = useRef(false)
  const desktopSnappingRef = useRef(false)
  const desktopIntroDistanceRef = useRef(0)
  const desktopIntroStartedRef = useRef(0)
  const desktopLastWheelRef = useRef(0)
  const desktopLastWheelDeltaRef = useRef(0)
  const desktopGestureTimerRef = useRef(null)
  const desktopPullTimerRef = useRef(null)
  const desktopReboundTimerRef = useRef(null)
  const mobilePullTimerRef = useRef(null)
  const mobileReboundTimerRef = useRef(null)
  const mobileTouchStartYRef = useRef(0)
  const mobileTouchStartScrollRef = useRef(0)
  const mobileTouchStartedAtBottomRef = useRef(false)
  const mobilePointerStartYRef = useRef(null)
  const mobilePointerStartScrollRef = useRef(0)
  const mobilePointerDraggingRef = useRef(false)
  const mobileSuppressClickRef = useRef(false)
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const [mobileScrollTop, setMobileScrollTop] = useState(0)
  const [mobileGridHeight, setMobileGridHeight] = useState(2200)
  const [mobilePull, setMobilePull] = useState(0)
  const [mobileRebounding, setMobileRebounding] = useState(false)
  const [desktopActivated, setDesktopActivated] = useState(false)
  const [desktopIntroProgress, setDesktopIntroProgress] = useState(0)
  const [desktopPull, setDesktopPull] = useState(0)
  const [desktopRebounding, setDesktopRebounding] = useState(false)

  useEffect(() => {
    const queryRestore = new URLSearchParams(location.search).get('restore')
    const queryExpanded = new URLSearchParams(location.search).get('expanded') === '1'
    const hasExplicitRestore = queryRestore !== null || location.state?.scrollTop !== undefined
    const saved = hasExplicitRestore ? Number(queryRestore ?? location.state?.scrollTop ?? 0) : 0
    const isMobile = window.matchMedia('(max-width: 899px)').matches
    const mobileSaved = queryExpanded && saved < 250 ? saved + 250 : saved
    if (isMobile) {
      setMobileScrollTop(mobileSaved)
      setMobileExpanded(mobileSaved >= 250)
    }
    if (!isMobile && saved > 0) {
      desktopActivatedRef.current = true
      desktopIntroDistanceRef.current = 150
      setDesktopActivated(true)
      setDesktopIntroProgress(1)
    }
    const timer = window.setTimeout(() => {
      const target = isMobile ? mobileRef.current : desktopRef.current
      if (target) target.scrollTop = isMobile ? mobileSaved : saved
    }, 0)
    return () => window.clearTimeout(timer)
  }, [location.state, location.search])

  useEffect(() => {
    if (!mobileProjectsRef.current || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => setMobileGridHeight(entry.contentRect.height))
    observer.observe(mobileProjectsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const finishFirstGestureAfterIdle = () => {
      window.clearTimeout(desktopGestureTimerRef.current)
      desktopGestureTimerRef.current = window.setTimeout(() => {
        desktopSnappingRef.current = false
      }, 24)
    }

    const releasePullAfterIdle = () => {
      window.clearTimeout(desktopPullTimerRef.current)
      window.clearTimeout(desktopReboundTimerRef.current)
      desktopPullTimerRef.current = window.setTimeout(() => {
        setDesktopRebounding(true)
        setDesktopPull(0)
        desktopReboundTimerRef.current = window.setTimeout(() => setDesktopRebounding(false), 300)
      }, 20)
    }

    const handler = (event) => {
      if (window.matchMedia('(max-width: 899px)').matches) return
      if (!desktopRef.current || event.ctrlKey) return
      event.preventDefault()
      const wheelNow = performance.now()
      const wheelGap = wheelNow - desktopLastWheelRef.current
      const wheelMagnitude = Math.abs(event.deltaY)
      const isFreshImpulse = wheelMagnitude > Math.max(3, desktopLastWheelDeltaRef.current * 1.65)
      desktopLastWheelRef.current = wheelNow
      desktopLastWheelDeltaRef.current = wheelMagnitude
      if (!desktopActivatedRef.current) {
        const pixelDelta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY
        desktopIntroDistanceRef.current = Math.max(0, Math.min(150, desktopIntroDistanceRef.current + pixelDelta))
        const progress = desktopIntroDistanceRef.current / 150
        setDesktopIntroProgress(progress)
        desktopRef.current.scrollTo({ top: progress * 256, behavior: 'auto' })
        if (progress < 1) return
        desktopActivatedRef.current = true
        desktopSnappingRef.current = true
        desktopIntroStartedRef.current = performance.now()
        setDesktopActivated(true)
        finishFirstGestureAfterIdle()
        return
      }
      if (desktopSnappingRef.current) {
        if (wheelGap > 24 || isFreshImpulse) {
          desktopSnappingRef.current = false
        } else {
          finishFirstGestureAfterIdle()
          return
        }
      }
      const scroller = desktopRef.current
      const maxScroll = scroller.scrollHeight - scroller.clientHeight
      if (event.deltaY < 0 && scroller.scrollTop <= 256) {
        desktopActivatedRef.current = false
        setDesktopActivated(false)
        desktopIntroDistanceRef.current = Math.max(0, 150 + event.deltaY)
        const progress = desktopIntroDistanceRef.current / 150
        setDesktopIntroProgress(progress)
        scroller.scrollTo({ top: progress * 256, behavior: 'auto' })
        return
      }
      if (event.deltaY > 0 && scroller.scrollTop >= maxScroll - 1) {
        setDesktopRebounding(false)
        setDesktopPull((current) => Math.min(60, current + Math.max(8, Math.abs(event.deltaY) * 0.16)))
        releasePullAfterIdle()
        return
      }
      if (event.deltaY < 0) setDesktopPull(0)
      desktopRef.current.scrollBy({ top: event.deltaY, behavior: 'auto' })
    }
    window.addEventListener('wheel', handler, { passive: false })
    return () => {
      window.removeEventListener('wheel', handler)
      window.clearTimeout(desktopGestureTimerRef.current)
      window.clearTimeout(desktopPullTimerRef.current)
      window.clearTimeout(desktopReboundTimerRef.current)
    }
  }, [])

  const openProject = (id) => {
    const isMobile = window.matchMedia('(max-width: 899px)').matches
    const scroller = isMobile ? mobileRef.current : desktopRef.current
    portfolioScrollPosition = scroller?.scrollTop || 0
    sessionStorage.setItem('portfolio-scroll', String(portfolioScrollPosition))
    leavingRef.current = true
    navigate(`/project/${id}?from=${portfolioScrollPosition}&expanded=${mobileExpanded ? 1 : 0}`)
  }

  const openResume = () => {
    const isMobile = window.matchMedia('(max-width: 899px)').matches
    const scroller = isMobile ? mobileRef.current : desktopRef.current
    portfolioScrollPosition = scroller?.scrollTop || 0
    sessionStorage.setItem('portfolio-scroll', String(portfolioScrollPosition))
    leavingRef.current = true
    navigate(`/resume?from=${portfolioScrollPosition}&expanded=${mobileExpanded ? 1 : 0}`)
  }

  const onMobileScroll = (event) => {
    if (leavingRef.current) return
    const top = event.currentTarget.scrollTop
    portfolioScrollPosition = top
    sessionStorage.setItem('portfolio-scroll', String(top))
    setMobileScrollTop(top)
    setMobileExpanded(top >= 250)
  }

  const releaseMobilePull = () => {
    window.clearTimeout(mobilePullTimerRef.current)
    window.clearTimeout(mobileReboundTimerRef.current)
    mobilePullTimerRef.current = window.setTimeout(() => {
      setMobileRebounding(true)
      setMobilePull(0)
      mobileReboundTimerRef.current = window.setTimeout(() => setMobileRebounding(false), 300)
    }, 18)
  }

  const onMobileWheel = (event) => {
    if (!mobileRef.current || event.ctrlKey) return
    const scroller = mobileRef.current
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    event.preventDefault()
    event.stopPropagation()
    if (event.deltaY > 0 && scroller.scrollTop >= maxScroll - 1) {
      setMobileRebounding(false)
      setMobilePull((current) => Math.min(60, current + Math.max(7, Math.abs(event.deltaY) * .14)))
      releaseMobilePull()
      return
    }
    window.clearTimeout(mobilePullTimerRef.current)
    setMobilePull(0)
    setMobileRebounding(false)
    scroller.scrollTop = Math.max(0, Math.min(maxScroll, scroller.scrollTop + event.deltaY))
  }

  const onMobileTouchStart = (event) => {
    const scroller = mobileRef.current
    if (!scroller) return
    mobileTouchStartYRef.current = event.touches[0]?.clientY ?? 0
    mobileTouchStartScrollRef.current = scroller.scrollTop
    mobileTouchStartedAtBottomRef.current = scroller.scrollTop >= scroller.scrollHeight - scroller.clientHeight - 1
    setMobileRebounding(false)
  }

  const onMobileTouchMove = (event) => {
    const scroller = mobileRef.current
    if (!scroller) return
    const currentY = event.touches[0]?.clientY ?? mobileTouchStartYRef.current
    const dragDistance = mobileTouchStartYRef.current - currentY
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    const targetScroll = mobileTouchStartScrollRef.current + dragDistance
    event.preventDefault()
    if (targetScroll > maxScroll) {
      mobileTouchStartedAtBottomRef.current = true
      scroller.scrollTop = maxScroll
      setMobilePull(Math.min(60, (targetScroll - maxScroll) * .24))
      return
    }
    setMobilePull(0)
    scroller.scrollTop = Math.max(0, targetScroll)
  }

  const onMobileTouchEnd = () => {
    const shouldRelease = mobileTouchStartedAtBottomRef.current
    mobileTouchStartedAtBottomRef.current = false
    if (shouldRelease) releaseMobilePull()
  }

  const onMobilePointerDown = (event) => {
    if (event.pointerType === 'touch' || !mobileRef.current) return
    mobilePointerStartYRef.current = event.clientY
    mobilePointerStartScrollRef.current = mobileRef.current.scrollTop
    mobilePointerDraggingRef.current = false
    if (event.pointerId !== undefined) event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const onMobilePointerMove = (event) => {
    const scroller = mobileRef.current
    if (event.pointerType === 'touch' || !scroller || mobilePointerStartYRef.current === null) return
    const dragDistance = mobilePointerStartYRef.current - event.clientY
    if (Math.abs(dragDistance) < 4 && !mobilePointerDraggingRef.current) return
    event.preventDefault()
    mobilePointerDraggingRef.current = true
    mobileSuppressClickRef.current = true
    const maxScroll = scroller.scrollHeight - scroller.clientHeight
    const targetScroll = mobilePointerStartScrollRef.current + dragDistance
    if (targetScroll > maxScroll) {
      scroller.scrollTop = maxScroll
      setMobileRebounding(false)
      setMobilePull(Math.min(60, (targetScroll - maxScroll) * .24))
      return
    }
    setMobilePull(0)
    setMobileRebounding(false)
    scroller.scrollTop = Math.max(0, targetScroll)
  }

  const onMobilePointerEnd = (event) => {
    if (event.pointerType === 'touch') return
    if (mobilePointerStartYRef.current !== null && mobilePointerDraggingRef.current) releaseMobilePull()
    mobilePointerStartYRef.current = null
    mobilePointerDraggingRef.current = false
    if (event.pointerId !== undefined) event.currentTarget.releasePointerCapture?.(event.pointerId)
    window.setTimeout(() => { mobileSuppressClickRef.current = false }, 0)
  }

  const onMobileClickCapture = (event) => {
    if (!mobileSuppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    mobileSuppressClickRef.current = false
  }

  useEffect(() => {
    const scroller = mobileRef.current
    if (!scroller) return undefined
    scroller.addEventListener('wheel', onMobileWheel, { passive: false, capture: true })
    scroller.addEventListener('touchstart', onMobileTouchStart, { passive: true, capture: true })
    scroller.addEventListener('touchmove', onMobileTouchMove, { passive: false, capture: true })
    scroller.addEventListener('touchend', onMobileTouchEnd, true)
    scroller.addEventListener('touchcancel', onMobileTouchEnd, true)
    return () => {
      scroller.removeEventListener('wheel', onMobileWheel, true)
      scroller.removeEventListener('touchstart', onMobileTouchStart, true)
      scroller.removeEventListener('touchmove', onMobileTouchMove, true)
      scroller.removeEventListener('touchend', onMobileTouchEnd, true)
      scroller.removeEventListener('touchcancel', onMobileTouchEnd, true)
      window.clearTimeout(mobilePullTimerRef.current)
      window.clearTimeout(mobileReboundTimerRef.current)
    }
  }, [])

  const onDesktopScroll = (event) => {
    if (leavingRef.current) return
    portfolioScrollPosition = event.currentTarget.scrollTop
    sessionStorage.setItem('portfolio-scroll', String(portfolioScrollPosition))
  }

  return (
    <main className="home-page">
      <svg className="hola-filter-defs" aria-hidden="true">
        <filter id="hola-thick-stroke" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceGraphic" operator="dilate" radius="0.7" result="thickened" />
          <feComponentTransfer in="thickened">
            <feFuncR type="linear" slope="1.18" intercept="0.03" />
            <feFuncG type="linear" slope="1.18" intercept="0.03" />
            <feFuncB type="linear" slope="1.18" intercept="0.03" />
            <feFuncA type="identity" />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="home-background" aria-hidden="true" />
      <div className="home-tint" aria-hidden="true" />

      <section className="desktop-home">
        <div ref={desktopRef} className="desktop-left-scroll" onScroll={onDesktopScroll}>
          <div className="desktop-left-content">
            <div className="hola-desktop" style={{ opacity: 1 - desktopIntroProgress, transform: `translate(-50%, -${desktopIntroProgress * 110}vh)` }}><img src="/assets/home/hola.png" alt="Hola" /></div>
            <div className={`desktop-grid-wrap ${desktopIntroProgress > 0 ? 'is-entering' : ''} ${desktopActivated ? 'is-ready' : ''} ${desktopPull > 0 ? 'is-pulling' : ''} ${desktopRebounding ? 'is-rebounding' : ''}`} style={{ transform: `translateY(${120 * (1 - desktopIntroProgress) - desktopPull}px)` }}><ProjectGrid onOpen={openProject} onResume={openResume} /></div>
          </div>
        </div>
        <div className="desktop-right">
          <button className="resume-link" onClick={openResume}>· RESUME</button>
          <BrandLockup />
        </div>
        <div className={`scroll-hint ${desktopIntroProgress === 0 ? 'is-idle' : ''}`} aria-hidden="true" style={{ opacity: 1 - desktopIntroProgress }}><img src="/assets/ui/scroll-arrow.svg" alt="" /></div>
      </section>

      <section
        className={`mobile-home ${mobileExpanded ? 'is-expanded' : ''}`}
        style={{ '--mobile-tint-opacity': .5 - Math.min(mobileScrollTop / 250, 1) * .2 }}
      >
        <div
          ref={mobileRef}
          className="mobile-scroll"
          onScroll={onMobileScroll}
          onPointerDownCapture={onMobilePointerDown}
          onPointerMoveCapture={onMobilePointerMove}
          onPointerUpCapture={onMobilePointerEnd}
          onPointerCancelCapture={onMobilePointerEnd}
          onMouseDownCapture={onMobilePointerDown}
          onMouseMoveCapture={onMobilePointerMove}
          onMouseUpCapture={onMobilePointerEnd}
          onMouseLeave={onMobilePointerEnd}
          onClickCapture={onMobileClickCapture}
        >
          <div
            className="mobile-scroll-spacer"
            style={{ height: `calc(250px + 68.133vw + ${mobileGridHeight}px + 120px)` }}
          />
          <div className="mobile-visual-layer">
            <div className="mobile-tint-layer" />
            <div
              className="hola-mobile"
              style={{
                top: `${window.innerWidth * (.48533 - Math.min(mobileScrollTop / 250, 1) * .57)}px`,
                opacity: 1 - Math.min(mobileScrollTop / 250, 1),
              }}
            ><img src="/assets/home/hola.png" alt="Hola" /></div>
            <div
              className="mobile-sticky-brand"
              style={{ top: `${window.innerWidth * (1.50133 - Math.min(mobileScrollTop / 250, 1) * 1.288)}px` }}
            ><BrandLockup mobile /></div>
            <div className="mobile-projects-mask">
              <div
                ref={mobileProjectsRef}
                className={`mobile-projects-track ${mobilePull > 0 ? 'is-pulling' : ''} ${mobileRebounding ? 'is-rebounding' : ''}`}
                style={{
                  top: `${window.innerWidth * (1.97 - Math.min(mobileScrollTop / 250, 1) * 1.28867) - Math.max(mobileScrollTop - 250, 0) - mobilePull}px`,
                  opacity: mobileScrollTop > 0 ? 1 : 0,
                }}
              >
                <ProjectGrid onOpen={openProject} onResume={openResume} mobile />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const projectConfig = {
  '6070': {
    title: '6070俱乐部',
    background: 'project-6070',
    segments: [
      { file: '01.svg', width: 1439 },
      { file: '02.svg', width: 1439 },
      { file: '03.svg', width: 1439 },
      { file: '04.svg', width: 1439 },
    ],
  },
  'ren-shi': { title: '认识', background: 'project-ren-shi', customLayout: 'ren-shi' },
  'shouyu': {
    title: '授渔成长馆',
    background: 'project-shouyu',
    segments: [
      { file: '01.svg', width: 1440 },
      { file: '02.svg', width: 1440 },
      { file: '03.svg', width: 1440 },
    ],
  },
  'imeo': {
    title: 'imeo',
    background: 'project-imeo',
    customLayout: 'imeo',
    segments: [
      { file: '01.svg', width: 1440 },
      { file: '02.svg', width: 1440 },
      { file: '03.svg', width: 612 },
      { file: '04.svg', width: 1316 },
      { file: '05.svg', width: 1316 },
      { file: '06.svg', width: 1316 },
      { file: '07.svg', width: 1440 },
    ],
  },
  'reson': {
    title: 'reson',
    background: 'project-reson',
    customLayout: 'reson',
    segments: [
      { file: '01.svg', width: 1440 },
      { file: '02.svg', width: 1440 },
      { file: '03.svg', width: 1440 },
      { file: '04.svg', width: 1440 },
      { file: '05.svg', width: 1440 },
    ],
  },
  'b2b': { title: 'B端', background: 'project-b2b', customLayout: 'b2b' },
  'logo': { title: 'logo', background: 'project-logo', customLayout: 'logo' },
}

function FloatingBack({ includeDownload = false, hideOnMobileScroll = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileScrolling, setMobileScrolling] = useState(false)
  const mobileScrollIdleRef = useRef(null)
  const from = Number(new URLSearchParams(location.search).get('from') ?? portfolioScrollPosition)
  const expanded = new URLSearchParams(location.search).get('expanded') === '1'
  const goHome = () => navigate(`/?restore=${from}&expanded=${expanded ? 1 : 0}`)
  useEffect(() => {
    if (!hideOnMobileScroll) return undefined
    const markScrolling = () => {
      if (!window.matchMedia('(max-width: 899px)').matches) return
      setMobileScrolling(true)
      window.clearTimeout(mobileScrollIdleRef.current)
      mobileScrollIdleRef.current = window.setTimeout(() => setMobileScrolling(false), 220)
    }
    window.addEventListener('scroll', markScrolling, { passive: true })
    window.addEventListener('touchmove', markScrolling, { passive: true })
    window.addEventListener('wheel', markScrolling, { passive: true })
    return () => {
      window.removeEventListener('scroll', markScrolling)
      window.removeEventListener('touchmove', markScrolling)
      window.removeEventListener('wheel', markScrolling)
      window.clearTimeout(mobileScrollIdleRef.current)
    }
  }, [hideOnMobileScroll])
  const floatingClass = `floating-actions ${mobileScrolling ? 'is-mobile-scrolling' : ''}`
  if (includeDownload) {
    return (
      <div className={`${floatingClass} has-download`}>
        <button className="resume-action resume-action-back" onClick={goHome} aria-label="返回首页">
          <img src="/assets/ui/resume-back-content.svg" alt="" />
        </button>
        <a className="resume-action resume-action-download" href="/assets/resume/LUOXIN·RESUME.pdf" download="LUOXIN·RESUME.pdf" aria-label="下载PDF">
          <img src="/assets/ui/resume-download-content.svg" alt="" />
        </a>
      </div>
    )
  }
  return (
    <div className={floatingClass}>
      <button className="resume-action resume-action-back" onClick={goHome} aria-label="返回首页">
        <img src="/assets/ui/project-back-content.svg" alt="" />
      </button>
    </div>
  )
}

const b2bSlides = [
  { file: '01.svg', ratio: 900 / 474 },
  { file: '02.svg', ratio: 900 / 474 },
  { file: '03.svg', ratio: 903 / 508 },
  { file: '04.svg', ratio: 900 / 630 },
  { file: '05.svg', ratio: 900 / 507 },
  { file: '06.svg', ratio: 900 / 507 },
]

const logoCards = [
  { file: '01.svg', x: 0, y: 6, width: 578, height: 312 },
  { file: '02.svg', x: 568, y: 6, width: 515, height: 312 },
  { file: '03.svg', x: 1073, y: 6, width: 960, height: 312 },
  { file: '04.svg', x: 2023, y: 6, width: 600, height: 312 },
  { file: '05.svg', x: 2613, y: 0, width: 560, height: 312 },
  { file: '06.svg', x: 3163, y: 0, width: 690, height: 312 },
  { file: '07.svg', x: 272, y: 308, width: 550, height: 312 },
  { file: '08.svg', x: 812, y: 308, width: 960, height: 312 },
  { file: '09.svg', x: 1762, y: 308, width: 790, height: 312 },
  { file: '10.svg', x: 2542, y: 308, width: 900, height: 312 },
]

function B2bCarousel({ projectId = 'b2b', slides = b2bSlides }) {
  const ringRef = useRef(null)
  const frameRef = useRef(0)
  const rotationRef = useRef(0)
  const previousTimeRef = useRef(0)
  const carouselRef = useRef(null)
  const pointerRef = useRef({ inside: false, x: 0, y: 0 })
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const draw = (now) => {
      const elapsed = previousTimeRef.current ? Math.min((now - previousTimeRef.current) / 1000, .1) : 0
      previousTimeRef.current = now
      let hoveringCard = false
      if (pointerRef.current.inside) {
        const target = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y)
        const card = target?.closest?.('.b2b-card')
        hoveringCard = Boolean(card && carouselRef.current?.contains(card))
      }
      if (!hoveringCard && selected === null) rotationRef.current -= 24 * elapsed
      if (ringRef.current) ringRef.current.style.setProperty('--b2b-rotation', `${rotationRef.current}deg`)
      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [selected])

  const onWheel = (event) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    rotationRef.current -= delta * .08
  }

  useEffect(() => {
    if (selected === null) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])

  return (
    <div
      ref={carouselRef}
      className="b2b-carousel"
      onWheel={onWheel}
      onMouseEnter={(event) => {
        pointerRef.current = { inside: true, x: event.clientX, y: event.clientY }
      }}
      onMouseMove={(event) => {
        pointerRef.current = { inside: true, x: event.clientX, y: event.clientY }
      }}
      onMouseLeave={() => {
        pointerRef.current.inside = false
      }}
    >
      <div className="b2b-stage">
        <div ref={ringRef} className="b2b-ring">
          {slides.map((slide, index) => (
            <div
              className="b2b-face-position"
              key={slide.file}
              style={{
                '--face-angle': `${slide.angle ?? index * (360 / slides.length)}deg`,
                '--face-y': slide.row ? `calc(var(--b2b-card-height) * ${slide.row * .484})` : '0px',
              }}
            >
              <button
                className="b2b-card"
                style={{ '--slide-ratio': slide.ratio }}
                onClick={() => setSelected(index)}
                aria-label={`放大查看 ${projectId === 'logo' ? 'Logo' : 'B端'} 项目 ${index + 1}`}
              >
                <img src={`/assets/projects/${projectId}/${projectId === 'logo' ? 'cards/' : ''}${slide.file}`} alt={`${projectId === 'logo' ? 'Logo' : 'B端'}项目 ${index + 1}`} draggable="false" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div className="b2b-lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <img
            src={`/assets/projects/${projectId}/${projectId === 'logo' ? 'cards/' : ''}${slides[selected].file}`}
            alt={`${projectId === 'logo' ? 'Logo' : 'B端'} 项目 ${selected + 1}`}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

function LogoMarquee() {
  const trackRef = useRef(null)
  const groupRef = useRef(null)
  const frameRef = useRef(0)
  const previousTimeRef = useRef(0)
  const offsetRef = useRef(0)
  const pausedRef = useRef(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const draw = (now) => {
      const elapsed = previousTimeRef.current ? Math.min((now - previousTimeRef.current) / 1000, .1) : 0
      previousTimeRef.current = now
      const groupWidth = groupRef.current?.getBoundingClientRect().width || 0
      if (!pausedRef.current && selected === null) offsetRef.current -= 90 * elapsed
      if (groupWidth > 0) {
        while (offsetRef.current <= -groupWidth) offsetRef.current += groupWidth
        while (offsetRef.current > 0) offsetRef.current -= groupWidth
      }
      if (trackRef.current) trackRef.current.style.transform = `translate3d(${offsetRef.current}px,0,0)`
      frameRef.current = requestAnimationFrame(draw)
    }
    frameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frameRef.current)
  }, [selected])

  useEffect(() => {
    if (selected === null) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [selected])

  const onWheel = (event) => {
    event.preventDefault()
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    offsetRef.current -= delta
  }

  const group = (copy) => (
    <div ref={copy === 0 ? groupRef : undefined} className="logo-marquee-group" aria-hidden={copy === 1}>
      {logoCards.map((card, index) => (
        <button
          key={`${copy}-${card.file}`}
          className="logo-marquee-card"
          style={{
            left: `${(card.x / 3853) * 100}%`,
            top: `${(card.y / 620) * 100}%`,
            width: `${(card.width / 3853) * 100}%`,
            height: `${(card.height / 620) * 100}%`,
          }}
          onMouseEnter={() => { pausedRef.current = true }}
          onMouseLeave={() => { pausedRef.current = false }}
          onClick={() => setSelected(index)}
          tabIndex={copy === 1 ? -1 : 0}
          aria-label={`放大查看 Logo 项目 ${index + 1}`}
        >
          <img src={`/assets/projects/logo/cards/${card.file}`} alt="" draggable="false" />
        </button>
      ))}
    </div>
  )

  return (
    <div className="logo-marquee" onWheel={onWheel}>
      <div ref={trackRef} className="logo-marquee-track">
        {group(0)}
        {group(1)}
      </div>
      {selected !== null && (
        <div className="b2b-lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <img src={`/assets/projects/logo/cards/${logoCards[selected].file}`} alt={`Logo 项目 ${selected + 1}`} onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function ProjectPage() {
  const id = useLocation().pathname.split('/').pop()
  const config = projectConfig[id]
  useEffect(() => {
    if (id !== 'reson') return undefined
    const updateZoomCompensation = () => {
      const nativePixelRatio = window.devicePixelRatio >= 1.5 ? 2 : 1
      const browserZoom = window.devicePixelRatio / nativePixelRatio
      document.documentElement.style.setProperty('--reson-zoom-compensation', String(1 / browserZoom))
    }
    updateZoomCompensation()
    window.addEventListener('resize', updateZoomCompensation)
    return () => {
      window.removeEventListener('resize', updateZoomCompensation)
      document.documentElement.style.removeProperty('--reson-zoom-compensation')
    }
  }, [id])
  if (!config) return <Home />
  return (
    <main className={`project-page ${config.background}`}>
      <h1 className="sr-only">{config.title}</h1>
      <div className="project-segments">
        {config.customLayout === 'b2b' ? (
          <B2bCarousel />
        ) : config.customLayout === 'logo' ? (
          <LogoMarquee />
        ) : config.customLayout === 'ren-shi' ? (
          <>
            <img className="ren-shi-segment ren-shi-segment-01" src="/assets/projects/ren-shi/segments/01.svg" alt="" loading="eager" />
            <img className="ren-shi-segment ren-shi-segment-02" src="/assets/projects/ren-shi/segments/02.svg" alt="" loading="lazy" />
            <img className="ren-shi-segment ren-shi-segment-03" src="/assets/projects/ren-shi/segments/03.svg" alt="" loading="lazy" />
            <div className="ren-shi-tail">
              <img className="ren-shi-segment-04" src="/assets/projects/ren-shi/segments/04.svg" alt="" loading="lazy" />
            </div>
          </>
        ) : config.customLayout === 'imeo' ? (
          <>
            <img className="imeo-segment imeo-segment-01" src="/assets/projects/imeo/segments/01.svg" alt="" loading="eager" />
            <img className="imeo-segment imeo-segment-02" src="/assets/projects/imeo/segments/02.svg" alt="" loading="lazy" />
            <div className="imeo-feature-group">
              <div className="imeo-gradient-panel" />
              <img className="imeo-segment imeo-segment-03" src="/assets/projects/imeo/segments/03.svg" alt="" loading="lazy" />
              <img className="imeo-segment imeo-segment-04" src="/assets/projects/imeo/segments/04.svg" alt="" loading="lazy" />
              <img className="imeo-segment imeo-segment-05" src="/assets/projects/imeo/segments/05.svg" alt="" loading="lazy" />
              <img className="imeo-segment imeo-segment-06" src="/assets/projects/imeo/segments/06.svg" alt="" loading="lazy" />
            </div>
            <img className="imeo-segment imeo-segment-07" src="/assets/projects/imeo/segments/07.svg" alt="" loading="lazy" />
          </>
        ) : config.customLayout === 'reson' ? (
          <>
            <div className="reson-artwork reson-artwork-01">
              <img className="reson-artwork-bg" src="/assets/projects/reson/segments/01-bg.svg" alt="" loading="eager" />
              <img className="reson-segment reson-segment-01" src="/assets/projects/reson/segments/01.svg" alt="" loading="eager" />
            </div>
            <div className="reson-segment-02-split">
              <img className="reson-02-layer reson-02-background" src="/assets/projects/reson/segments/02-background.svg" alt="" loading="lazy" />
              <div className="reson-02-glass reson-02-glass-left" />
              <div className="reson-02-glass reson-02-glass-right" />
              <img className="reson-02-layer reson-02-foreground" src="/assets/projects/reson/segments/02-foreground.svg" alt="" loading="lazy" />
            </div>
            <div className="reson-artwork reson-artwork-03">
              <img className="reson-artwork-bg" src="/assets/projects/reson/segments/03-bg.svg" alt="" loading="lazy" />
              <img className="reson-segment reson-segment-03" src="/assets/projects/reson/segments/03.svg" alt="" loading="lazy" />
            </div>
            <div className="reson-artwork reson-artwork-04">
              <img className="reson-artwork-bg" src="/assets/projects/reson/segments/04-bg.svg" alt="" loading="lazy" />
              <img className="reson-segment reson-segment-04" src="/assets/projects/reson/segments/04.svg" alt="" loading="lazy" />
            </div>
            <div className="reson-artwork reson-artwork-05">
              <img className="reson-artwork-bg" src="/assets/projects/reson/segments/05-bg.svg" alt="" loading="lazy" />
              <img className="reson-segment reson-segment-05" src="/assets/projects/reson/segments/05.svg" alt="" loading="lazy" />
            </div>
          </>
        ) : (
          config.segments.map((segment, i) => (
            <img
              key={segment.file}
              src={`/assets/projects/${id}/segments/${segment.file}`}
              alt=""
              loading={i > 0 ? 'lazy' : 'eager'}
              style={{ width: `min(100%, ${segment.width}px)` }}
            />
          ))
        )}
      </div>
      <div className="project-safe-space" />
      <FloatingBack hideOnMobileScroll />
    </main>
  )
}

function PdfPage({ pdf, pageNumber, width }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    let cancelled = false
    const render = async () => {
      const page = await pdf.getPage(pageNumber)
      const base = page.getViewport({ scale: 1 })
      const outputScale = Math.min(window.devicePixelRatio || 1, 2)
      const viewport = page.getViewport({ scale: (width / base.width) * outputScale })
      if (cancelled || !canvasRef.current) return
      const canvas = canvasRef.current
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.style.width = `${width}px`
      canvas.style.height = `${viewport.height / outputScale}px`
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
    }
    render()
    return () => { cancelled = true }
  }, [pdf, pageNumber, width])
  return <canvas ref={canvasRef} className="pdf-page" />
}

function ResumePage() {
  const [pdf, setPdf] = useState(null)
  const [pdfError, setPdfError] = useState(false)
  const [width, setWidth] = useState(Math.min(920, window.innerWidth))
  useEffect(() => {
    let active = true
    Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ])
      .then(([pdfjs, worker]) => {
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default
        return pdfjs.getDocument('/assets/resume/LUOXIN·RESUME.pdf').promise
      })
      .then((doc) => active && setPdf(doc))
      .catch(() => active && setPdfError(true))
    const resize = () => setWidth(Math.min(920, window.innerWidth))
    window.addEventListener('resize', resize)
    return () => { active = false; window.removeEventListener('resize', resize) }
  }, [])
  return (
    <main className="resume-page">
      <h1 className="sr-only">LUO XIN Resume</h1>
      <div className="pdf-stack">
        {!pdf && !pdfError && <div className="pdf-loading">正在载入简历…</div>}
        {pdfError && <div className="pdf-loading" role="alert">简历载入失败，请使用下载 PDF 按钮查看。</div>}
        {pdf && Array.from({ length: pdf.numPages }, (_, i) => <PdfPage key={i} pdf={pdf} pageNumber={i + 1} width={width} />)}
      </div>
      <div className="resume-safe-space" />
      <FloatingBack includeDownload />
    </main>
  )
}

function PortraitOnlyNotice() {
  return (
    <aside className="portrait-only-notice" role="status" aria-live="polite">
      <div className="portrait-only-panel">
        <strong>请旋转至竖屏</strong>
        <span>竖屏浏览体验更完整</span>
      </div>
    </aside>
  )
}

function App() {
  return (
    <>
      <Routes><Route path="/" element={<Home />} /><Route path="/project/:id" element={<ProjectPage />} /><Route path="/resume" element={<ResumePage />} /></Routes>
      <PortraitOnlyNotice />
    </>
  )
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App /></BrowserRouter>)
