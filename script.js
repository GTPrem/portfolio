/* ============================================================
   SEQUENCE CO. — CINEMATIC PORTFOLIO
   script.js
   ============================================================ */

(() => {
  'use strict';

  /* ============================== */
  /* CONFIGURATION                  */
  /* ============================== */
  const CONFIG = {
    loadDuration: 2800,       // Loading screen duration (ms)
    cursorLerp: 0.12,         // Cursor smoothing factor
    cursorRingLerp: 0.08,     // Ring smoothing factor
    magnetStrength: 0.3,      // Magnetic button strength
    magnetDistance: 120,       // Magnetic trigger distance
    revealThreshold: 0.15,    // IntersectionObserver threshold
    timelineSections: ['hero', 'projects', 'experimental', 'services', 'about', 'contact'],
    totalTimecode: '03:24:00:00',
  };

  /* Project data for reel cards */
  const PROJECTS = {
    1: {
      title: 'REEL 01',
      category: 'SOCIAL VIDEO',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Short-Form Editing, Typography, Pacing',
      description: 'Short-form social video produced for my college Instagram page. Explanatory / person-speaking format supported by editing, typography, and motion graphics.',
      igUrl: 'https://www.instagram.com/reel/Dd8HchXPFlU/',
    },
    2: {
      title: 'REEL 02',
      category: 'EDUCATIONAL',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Short-Form Editing, Visual Inserts, Pacing',
      description: 'Educational short-form content for college Instagram. Informative format with dynamic visual inserts and clean typography.',
      igUrl: 'https://www.instagram.com/reel/Dcr6RZHSWMy/',
    },
    3: {
      title: 'REEL 03',
      category: 'DOCUMENTARY',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Documentary Editing, B-Roll, Motion Graphics',
      description: 'Documentary-style short-form reel. Structured storytelling with careful pacing, supporting graphics, and visual rhythm.',
      igUrl: 'https://www.instagram.com/reel/DbhWuqzPPgB/',
    },
    4: {
      title: 'REEL 04',
      category: 'SOCIAL VIDEO',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Short-Form Editing, Typography, Pacing',
      description: 'Social video for college Instagram. Person-speaking format with strong editing rhythm, on-screen text, and visual inserts.',
      igUrl: 'https://www.instagram.com/reel/DbfrWVrv_Oh/',
    },
    5: {
      title: 'REEL 05',
      category: 'EDUCATIONAL',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Short-Form Editing, Visual Inserts, Pacing',
      description: 'Educational content reel created for college Instagram. Informative and engaging with consistent editing style.',
      igUrl: 'https://www.instagram.com/reel/DYjFo1GvkVT/',
    },
    6: {
      title: 'REEL 06',
      category: 'DOCUMENTARY',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Documentary Editing, B-Roll, Motion Graphics',
      description: 'Documentary-style short reel for college Instagram. Layered storytelling with careful pacing and visual support.',
      igUrl: 'https://www.instagram.com/reel/DXWsnr8j8Go/',
    },
    7: {
      title: 'REEL 07',
      category: 'SOCIAL VIDEO',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Short-Form Editing, Typography, Motion Graphics',
      description: 'Social video for college Instagram. Dynamic editing with motion graphics, typography, and confident visual pacing.',
      igUrl: 'https://www.instagram.com/reel/DW3ocz5jxT-/',
    },
    exp1: {
      title: "HOW I'D SURVIVE SAW 2",
      category: 'VISUAL STORYTELLING',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Suspense Cutting, Atmospheric Sound Design, Pacing',
      description: 'Spec visual storytelling project with intense rhythm, tension-building sound design, and razor-sharp cuts.',
      vimeoId: '1238647638',
    },
    exp2: {
      title: 'EXPERIMENTAL SPIDEY',
      category: 'MOTION DESIGN · VFX',
      year: '2025',
      software: 'After Effects, Premiere Pro',
      techniques: 'Dynamic Compositing, Kinetic Speed Ramping, 3D Tracking',
      description: 'High-energy kinetic motion design and visual effects exploration featuring superhero action sequences.',
      vimeoId: '1238647639',
    },
    exp3: {
      title: 'BATVEL',
      category: 'CONCEPT TRAILER',
      year: '2025',
      software: 'DaVinci Resolve, Premiere Pro',
      techniques: 'Hybrid Narrative Editing, Film Color Grading, Sound Design',
      description: 'A crossover concept trailer merging distinct cinematic universes with bespoke orchestral pacing and color grading.',
      vimeoId: '1238647640',
    },
  };

  /* ============================== */
  /* DOM CACHE                      */
  /* ============================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const dom = {
    loader:       $('#loader'),
    loaderBar:    $('#loader-bar'),
    loaderPct:    $('#loader-pct'),
    loaderProgress: $('#loader-progress'),
    startBtn:     $('#start-btn'),
    gameMenu:     $('#game-menu'),
    cursorDot:    $('#cursor-dot'),
    cursorRing:   $('#cursor-ring'),
    navbar:       $('#navbar'),
    timeline:     $('#timeline'),
    timecode:     $('#timecode'),
    duration:     $('#duration'),
    playhead:     $('#playhead'),
    timelineTrack: $('#timeline-track'),
    clips:        $$('.timeline-clip'),
    grainCanvas:  $('#grain-canvas'),
    modal:        $('#project-modal'),
    modalClose:   $('#modal-close'),
    showreelFrame: null, /* showreel removed */
    soundToggle:  $('#sound-toggle'),
  };

  /* ============================== */
  /* STATE                          */
  /* ============================== */
  const state = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    ring:   { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    hasMouseMoved: false,
    lastScroll: 0,
    scrollDir: 'down',
    loaded: false,
    modalOpen: false,
    isTouch: window.matchMedia('(hover: none) and (pointer: coarse)').matches,
    isMobile: window.innerWidth <= 768,
    soundEnabled: false,
    activeSection: 0,
  };

  // Global mouse position tracking (always active for desktop/pointers)
  window.addEventListener('mousemove', (e) => {
    state.mouse.x = e.clientX;
    state.mouse.y = e.clientY;

    if (!state.hasMouseMoved) {
      state.hasMouseMoved = true;
      state.cursor.x = e.clientX;
      state.cursor.y = e.clientY;
      state.ring.x = e.clientX;
      state.ring.y = e.clientY;

      if (dom.cursorDot) {
        dom.cursorDot.style.left = e.clientX + 'px';
        dom.cursorDot.style.top = e.clientY + 'px';
      }
      if (dom.cursorRing) {
        dom.cursorRing.style.left = e.clientX + 'px';
        dom.cursorRing.style.top = e.clientY + 'px';
      }

      const camCursor = document.getElementById('camera-cursor');
      if (camCursor && !camCursor.classList.contains('visible')) {
        camCursor.style.left = e.clientX + 'px';
        camCursor.style.top = e.clientY + 'px';
        camCursor.classList.add('visible');
      }
    }

    if (!state.isTouch && !document.body.classList.contains('locked-scroll')) {
      if (dom.cursorDot) dom.cursorDot.classList.add('visible');
      if (dom.cursorRing) dom.cursorRing.classList.add('visible');
    }
  }, { passive: true });

  /* ============================== */
  /* ATMOSPHERE ENGINE (SMOKE/FOG)  */
  /* ============================== */
  const AtmosphereEngine = (() => {
    let canvas, ctx, width, height;
    let particles = [];
    let active = false;
    let targetGlow = 0.15;
    let currentGlow = 0.15;
    
    function init() {
      canvas = document.getElementById('smoke-canvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d', { alpha: false });
      resize();
      window.addEventListener('resize', resize);
      
      for (let i = 0; i < 90; i++) {
        // Center-biased distribution
        let rx = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        let ry = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
        
        particles.push({
          x: width / 2 + rx * (width * 0.6),
          y: height / 2 + ry * (height * 0.6),
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5 - 0.2,
          radius: Math.random() * 250 + 150,
          alpha: Math.random() * 0.05 + 0.03
        });
      }
      active = true;
      requestAnimationFrame(animate);
    }
    
    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    }
    
    function animate() {
      if (!active) return;
      
      ctx.fillStyle = '#050505';
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillRect(0, 0, width, height);
      
      const mx = state.mouse.x;
      const my = state.mouse.y;
      
      currentGlow += (targetGlow - currentGlow) * 0.05;
      
      ctx.globalCompositeOperation = 'screen';
      
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        
        let dx = mx - p.x;
        let dy = my - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 400) {
          let force = (400 - dist) / 400;
          p.vx -= (dx / dist) * force * 0.6; // repel
          p.vy -= (dy / dist) * force * 0.6;
        }
        
        p.vx += ( (Math.random() - 0.5)*0.2 - p.vx ) * 0.02;
        p.vy += ( (Math.random() - 0.5)*0.2 - 0.3 - p.vy ) * 0.02;
        
        // speed limit
        p.vx = Math.max(-2, Math.min(2, p.vx));
        p.vy = Math.max(-2, Math.min(2, p.vy));
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;
        
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(40, 30, 30, ${p.alpha})`); // dark grey with faint crimson
        grad.addColorStop(1, 'rgba(40, 30, 30, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      const lightGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 600);
      lightGrad.addColorStop(0, `rgba(200, 20, 20, ${currentGlow})`);
      lightGrad.addColorStop(0.4, `rgba(139, 0, 0, ${currentGlow * 0.5})`);
      lightGrad.addColorStop(1, 'rgba(139, 0, 0, 0)');
      
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 600, 0, Math.PI * 2);
      ctx.fill();
      
      requestAnimationFrame(animate);
    }
    
    function setIntense(isIntense) {
      targetGlow = isIntense ? 0.35 : 0.15;
    }
    
    function destroy() {
      active = false;
      particles = [];
      window.removeEventListener('resize', resize);
    }
    
    return { init, setIntense, destroy };
  })();

  /* ============================== */
  /* CAMERA FOCUS CURSOR            */
  /* ============================== */
  const CameraCursor = (() => {
    let el;
    let active = false;
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let rot = 0;
    
    function init() {
      if (state.isTouch) return;
      el = document.getElementById('camera-cursor');
      if (!el) return;
      cx = state.mouse.x || window.innerWidth / 2;
      cy = state.mouse.y || window.innerHeight / 2;
      el.style.left = `${cx}px`;
      el.style.top = `${cy}px`;
      el.classList.add('visible');
      active = true;
      requestAnimationFrame(animate);
    }
    
    function animate() {
      if (!active) return;
      
      // Lerp for weighty cinematic feel
      const dx = state.mouse.x - cx;
      const dy = state.mouse.y - cy;
      cx += dx * 0.15; // Smooth mechanical follow
      cy += dy * 0.15;
      
      // Momentum rotation (1-2 degrees based on horizontal movement)
      const targetRot = Math.max(-2, Math.min(2, dx * 0.05));
      rot += (targetRot - rot) * 0.1;
      
      if (el) {
        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
      }
      
      requestAnimationFrame(animate);
    }
    
    function setHover(isHover) {
      if (!el) return;
      if (isHover) {
        el.classList.add('focus-hover');
      } else {
        el.classList.remove('focus-hover');
      }
    }
    
    function lock() {
      if (!el) return;
      el.classList.add('focus-locked');
    }
    
    function destroy() {
      active = false;
      if (el) {
        el.classList.remove('visible');
        el.style.display = 'none';
      }
    }
    
    return { init, setHover, lock, destroy };
  })();

  /* ============================== */
  /* LOADING SCREEN                 */
  /* ============================== */
  function initLoader() {
    AtmosphereEngine.init();
    CameraCursor.init();
    
    dom.startBtn.addEventListener('mouseenter', () => {
      AtmosphereEngine.setIntense(true);
      CameraCursor.setHover(true);
      SoundEngine.playHoverTick();
    });
    
    dom.startBtn.addEventListener('mouseleave', () => {
      AtmosphereEngine.setIntense(false);
      CameraCursor.setHover(false);
    });

    dom.startBtn.addEventListener('click', () => {
      SoundEngine.enable();
      CameraCursor.lock();
      SoundEngine.playClick('primary');

      // Wait for focus lock animation (100ms) before fading out
      setTimeout(() => {
        SoundEngine.playLoadingSequence();
        CameraCursor.destroy();
        dom.gameMenu.style.opacity = '0';
      
      setTimeout(() => {
        dom.gameMenu.style.display = 'none';
        
        const timeline = document.getElementById('loader-timeline');
        const playhead = document.getElementById('loader-playhead');
        const status = document.getElementById('loader-status');
        const tc = document.getElementById('loader-tc');
        const clips = [...document.querySelectorAll('#loader-timeline .loader-clip')];
        const firstClip = document.getElementById('loader-first-clip');
        
        timeline.style.display = 'flex';
        timeline.offsetHeight; // reflow
        timeline.style.opacity = '1';

        const tasks = [
          { p: 0, text: "Initializing Project..." },
          { p: 15, text: "Relinking Media..." },
          { p: 35, text: "Generating Waveforms..." },
          { p: 60, text: "Loading Motion Graphics..." },
          { p: 80, text: "Building Preview Cache..." },
          { p: 95, text: "Preparing Final Sequence..." }
        ];
        let currentTaskIdx = 0;
        let progress = 0;
        
        const interval = setInterval(() => {
          const remaining = 100 - progress;
          const increment = Math.max(0.3, remaining * 0.05 + Math.random() * 1.5);
          progress = Math.min(100, progress + increment);

          playhead.style.left = progress + '%';
          
          const totalFrames = progress * 864; // 100% = 86400 frames
          const h = Math.floor(totalFrames / 86400);
          const m = Math.floor((totalFrames % 86400) / 1440);
          const s = Math.floor((totalFrames % 1440) / 24);
          const f = Math.floor(totalFrames % 24);
          tc.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}:${String(f).padStart(2,'0')}`;

          if (currentTaskIdx < tasks.length - 1 && progress >= tasks[currentTaskIdx + 1].p) {
            currentTaskIdx++;
            status.textContent = tasks[currentTaskIdx].text;
            SoundEngine.playHoverTick();
          }

          const playheadRect = playhead.getBoundingClientRect();
          clips.forEach(clip => {
            const rect = clip.getBoundingClientRect();
            if (playheadRect.left >= rect.left) {
              clip.classList.add('active');
            }
          });

          if (progress >= 100) {
            clearInterval(interval);
            
            // 1. Pause briefly at 100%
            setTimeout(() => {
              // 2. Mechanical lock sound
              SoundEngine.playLoadingComplete();
              status.textContent = "Sequence Ready.";
              
              setTimeout(() => {
                // 3. Jump back to 00:00 and playback mode
                timeline.classList.add('playback-mode');
                playhead.style.left = '0%';
                tc.textContent = "00:00:00:00";
                
                clips.forEach(c => c.classList.remove('active'));
                
                setTimeout(() => {
                  // 4. Playhead starts moving
                  playhead.style.transition = 'left 3s linear';
                  playhead.style.left = '25%'; // scrub through first clip
                  
                  // 5. As it hits the first clip, expand it
                  setTimeout(() => {
                    firstClip.classList.add('expanding-clip');
                    firstClip.offsetHeight; // Force reflow
                    firstClip.classList.add('expanded');
                    
                    timeline.style.opacity = '0';
                    
                    setTimeout(() => {
                      state.loaded = true;
                      dom.loader.classList.add('done');
                      onLoaded();
                    }, 1200); // wait for expansion transition
                  }, 300);
                }, 600); // time to snap back
              }, 600); // pause after lock sound
            }, 400); // brief pause at 100%
          }
        }, CONFIG.loadDuration / 60);
      }, 1500);
      }, 100);
    });
  }

  function onLoaded() {
    document.body.classList.remove('locked-scroll');
    AtmosphereEngine.destroy();
    
    if (!state.isTouch) {
      if (dom.cursorDot) dom.cursorDot.classList.add('visible');
      if (dom.cursorRing) dom.cursorRing.classList.add('visible');
    }

    dom.timeline.classList.add('visible');
    updateTimeline();

    SoundEngine.playReveal(); // Cinematic reveal chord
    setTimeout(() => {
      $$('.hero [data-reveal]').forEach(el => el.classList.add('revealed'));
      const workBtn = $('#hero-work-btn') || $('[data-hero-cta="1"]');
      if (workBtn) workBtn.classList.add('revealed');
      updateTimeline();
    }, 300);
  }

  /* ============================== */
  /* CUSTOM CURSOR                  */
  /* ============================== */
  function initCursor() {
    if (state.isTouch) return;

    const interactives = $$('a, button, .comic-panel, .cinema-frame, [data-magnetic]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => dom.cursorRing && dom.cursorRing.classList.add('expanded'));
      el.addEventListener('mouseleave', () => dom.cursorRing && dom.cursorRing.classList.remove('expanded'));
    });

    document.addEventListener('mouseleave', () => {
      if (dom.cursorDot) dom.cursorDot.classList.add('hidden');
      if (dom.cursorRing) dom.cursorRing.classList.add('hidden');
    });
    document.addEventListener('mouseenter', () => {
      if (dom.cursorDot) dom.cursorDot.classList.remove('hidden');
      if (dom.cursorRing) dom.cursorRing.classList.remove('hidden');
    });

    updateCursor();
  }

  function updateCursor() {
    if (state.isTouch) return;

    if (state.hasMouseMoved) {
      state.cursor.x += (state.mouse.x - state.cursor.x) * CONFIG.cursorLerp;
      state.cursor.y += (state.mouse.y - state.cursor.y) * CONFIG.cursorLerp;
      state.ring.x += (state.mouse.x - state.ring.x) * CONFIG.cursorRingLerp;
      state.ring.y += (state.mouse.y - state.ring.y) * CONFIG.cursorRingLerp;

      if (dom.cursorDot) {
        dom.cursorDot.style.left = state.cursor.x + 'px';
        dom.cursorDot.style.top = state.cursor.y + 'px';
      }
      if (dom.cursorRing) {
        dom.cursorRing.style.left = state.ring.x + 'px';
        dom.cursorRing.style.top = state.ring.y + 'px';
      }
    }

    requestAnimationFrame(updateCursor);
  }

  /* ============================== */
  /* MAGNETIC BUTTONS               */
  /* ============================== */
  function initMagnetic() {
    if (state.isTouch) return;

    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        const maxDist = 12;
        const tx = Math.max(-maxDist, Math.min(maxDist, dx * CONFIG.magnetStrength));
        const ty = Math.max(-maxDist, Math.min(maxDist, dy * CONFIG.magnetStrength));
        btn.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ============================== */
  /* BUTTON RIPPLE                  */
  /* ============================== */
  function initRipple() {
    $$('.btn, .cta-btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        btn.style.setProperty('--ripple-x', x + '%');
        btn.style.setProperty('--ripple-y', y + '%');
      });
    });
  }

  /* ============================== */
  /* NAVIGATION                     */
  /* ============================== */
  function initNavbar() {
    let lastY = window.scrollY;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;

          if (currentY > lastY && currentY > 200) {
            dom.navbar.classList.add('hidden');
          } else {
            dom.navbar.classList.remove('hidden');
          }

          lastY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    $$('.nav-link, .nav-brand, .hero-cta a, .hero-scroll-indicator').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const target = $(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  /* ============================== */
  /* EDITING TIMELINE               */
  /* ============================== */
  function initTimeline() {
    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateTimeline);
    }, { passive: true });

    window.addEventListener('resize', () => {
      requestAnimationFrame(updateTimeline);
    }, { passive: true });

    updateTimeline();

    // Timeline Scrubbing Logic
    let isScrubbing = false;

    function scrub(e) {
      if (!isScrubbing || !dom.timelineTrack) return;
      const rect = dom.timelineTrack.getBoundingClientRect();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      
      let progress = (clientX - rect.left) / rect.width;
      progress = Math.max(0, Math.min(1, progress));
      
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        window.scrollTo({
          top: progress * docHeight,
          behavior: 'auto'
        });
      }
    }

    dom.timelineTrack.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      scrub(e);
      document.body.style.userSelect = 'none';
    });
    
    dom.timelineTrack.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      scrub(e);
    }, { passive: true });

    window.addEventListener('mousemove', scrub);
    window.addEventListener('touchmove', scrub, { passive: true });

    window.addEventListener('mouseup', () => {
      if (isScrubbing) {
        isScrubbing = false;
        document.body.style.userSelect = '';
      }
    });
    
    window.addEventListener('touchend', () => {
      isScrubbing = false;
    });
  }

  function updateTimeline() {
    if (!dom.playhead || !dom.timecode) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const docHeight = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
    
    let progress = 0;
    if (docHeight > 0) {
      progress = Math.min(1, Math.max(0, scrollTop / docHeight));
    }
    if (isNaN(progress)) progress = 0;

    dom.playhead.style.left = (progress * 100) + '%';

    const totalSeconds = 12240; // 3 hours 24 mins (204 mins * 60)
    const currentSeconds = progress * totalSeconds;
    const hours = Math.floor(currentSeconds / 3600);
    const mins = Math.floor((currentSeconds % 3600) / 60);
    const secs = Math.floor(currentSeconds % 60);
    const frames = Math.floor((currentSeconds % 1) * 24);
    
    const safeH = isNaN(hours) ? 0 : hours;
    const safeM = isNaN(mins) ? 0 : mins;
    const safeS = isNaN(secs) ? 0 : secs;
    const safeF = isNaN(frames) ? 0 : frames;

    dom.timecode.textContent =
      String(safeH).padStart(2, '0') + ':' +
      String(safeM).padStart(2, '0') + ':' +
      String(safeS).padStart(2, '0') + ':' +
      String(safeF).padStart(2, '0');
      
    if (dom.duration) {
      dom.duration.textContent = CONFIG.totalTimecode;
    }

    const sections = CONFIG.timelineSections;
    let activeIndex = 0;

    if (progress >= 0.98) {
      activeIndex = sections.length - 1;
    } else {
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45) {
            activeIndex = i;
            break;
          }
        }
      }
    }

    // Section change detection — trigger sound
    if (activeIndex !== state.activeSection) {
      state.activeSection = activeIndex;
      if (typeof SoundEngine !== 'undefined') {
        SoundEngine.playSectionChange();
      }
    }

    dom.clips.forEach((clip, i) => {
      clip.classList.toggle('active', i === activeIndex);
    });
  }

  /* ============================== */
  /* FILM GRAIN                     */
  /* ============================== */
  function initGrain() {
    const canvas = dom.grainCanvas;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    let lastFrame = 0;
    function renderGrainThrottled(timestamp) {
      if (timestamp - lastFrame > 80) {
        const w = canvas.width;
        const h = canvas.height;
        const scale = 4;
        const sw = Math.ceil(w / scale);
        const sh = Math.ceil(h / scale);

        if (typeof OffscreenCanvas !== 'undefined') {
          const offscreen = new OffscreenCanvas(sw, sh);
          const offCtx = offscreen.getContext('2d');
          const imageData = offCtx.createImageData(sw, sh);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const val = Math.random() * 255;
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
            data[i + 3] = 255;
          }

          offCtx.putImageData(imageData, 0, 0);
          ctx.imageSmoothingEnabled = false;
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(offscreen, 0, 0, w, h);
        } else {
          const imageData = ctx.createImageData(w, h);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 16) {
            const val = Math.random() * 255;
            for (let j = 0; j < 16 && i + j < data.length; j += 4) {
              data[i + j] = val;
              data[i + j + 1] = val;
              data[i + j + 2] = val;
              data[i + j + 3] = 255;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
        lastFrame = timestamp;
      }
      requestAnimationFrame(renderGrainThrottled);
    }

    renderGrainThrottled(0);
  }

  /* ============================== */
  /* SCROLL REVEAL ANIMATIONS       */
  /* ============================== */
  function initReveals() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const revealChildren = entry.target.querySelectorAll('[data-reveal]');
            if (revealChildren.length > 0 && !entry.target.hasAttribute('data-reveal')) {
              revealChildren.forEach((child, i) => {
                setTimeout(() => {
                  child.classList.add('revealed');
                }, i * 100);
              });
            } else {
              entry.target.classList.add('revealed');
            }
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: CONFIG.revealThreshold,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    $$('[data-reveal]').forEach(el => {
      if (!el.closest('.hero')) {
        observer.observe(el);
      }
    });

    /* Service cards — observe individually for staggered entry */
    const serviceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            serviceObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    $$('.service-card').forEach(card => serviceObserver.observe(card));

    /* Contact lines — observe for split animation */
    const contactObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            contactObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    $$('[data-contact-line]').forEach(el => contactObserver.observe(el));

    /* End sequence — observe */
    const endSeq = $('.end-sequence');
    if (endSeq) {
      const endObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              endObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      endObserver.observe(endSeq);
    }
  }

  /* ================================================== */
  /* SCROLL-DRIVEN PROJECT SHOWCASE SEQUENCE            */
  /* ================================================== */
  function initProjectShowcaseSequence() {
    const section = $('#projects');
    const stage = $('#showcase-stage');
    const frames = $$('.project-frame');
    const counter = $('#showcase-counter');
    const progressFill = $('#showcase-progress-fill');
    const hudTitle = $('#hud-project-title');
    const hudCat = $('#hud-project-cat');
    const ticks = $$('.progress-ticks .tick');

    if (!section || !stage || frames.length === 0) return;

    // Load reel embed on demand
    const loadedReels = new Set();
    function loadReelEmbed(frame) {
      if (loadedReels.has(frame)) return;
      const wrap = frame.querySelector('.reel-embed-wrap');
      if (!wrap) return;
      const src = wrap.dataset.reelSrc;
      if (!src) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.setAttribute('allowtransparency', 'true');
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('title', frame.querySelector('.frame-title') ? frame.querySelector('.frame-title').textContent + ' Instagram Reel' : 'Instagram Reel');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;background:#000;';
      wrap.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      wrap.appendChild(iframe);
      loadedReels.add(frame);
    }

    // Attach click & hover events for all project frames
    frames.forEach((frame) => {
      frame.addEventListener('click', (e) => {
        // Don't intercept clicks on links
        if (e.target.closest('.frame-ig-link') || e.target.closest('.frame-vimeo-link') || e.target.closest('.vimeo-fallback-link')) return;
        const igUrl = frame.dataset.reelUrl;
        if (igUrl) {
          if (typeof SoundEngine !== 'undefined') SoundEngine.playWhooshOpen();
          window.open(igUrl, '_blank', 'noopener,noreferrer');
        }
      });

      frame.addEventListener('mouseenter', () => {
        if (typeof SoundEngine !== 'undefined') {
          SoundEngine.playHoverTick();
        }
        // Only load reel embeds (not Vimeo)
        if (frame.querySelector('.reel-embed-wrap')) {
          loadReelEmbed(frame);
        }
      });
    });

    // Observer to update HUD and active indicators naturally as user scrolls through the grid
    const frameObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.index, 10);
            if (!isNaN(idx)) {
              if (entry.target.querySelector('.reel-embed-wrap')) {
                loadReelEmbed(entry.target);
              }
              
              if (counter) {
                counter.textContent = `${String(idx + 1).padStart(2,'0')} / ${String(frames.length).padStart(2,'0')}`;
              }
              const titleEl = entry.target.querySelector('.frame-title');
              const catEl = entry.target.querySelector('.frame-cat');
              if (hudTitle && titleEl) hudTitle.textContent = titleEl.textContent;
              if (hudCat && catEl) hudCat.textContent = catEl.textContent;
              
              ticks.forEach((tick, tIdx) => {
                tick.classList.toggle('active', tIdx === idx);
              });
              
              if (progressFill) {
                progressFill.style.width = `${((idx + 1) / frames.length) * 100}%`;
              }
            }
          }
        });
      },
      {
        threshold: 0.35,
        rootMargin: '-30px 0px -30px 0px'
      }
    );

    frames.forEach(frame => frameObserver.observe(frame));
  }

  /* ============================== */
  /* SHOWREEL (removed — stub only) */
  /* ============================== */
  function initShowreel() {
    /* Showreel section has been removed. No-op. */
  }

  /* ============================== */
  /* MODAL                          */
  /* ============================== */
  function openModal(projectId) {
    const project = PROJECTS[projectId];
    if (!project) return;

    dom.modal.classList.add('active');
    dom.modal.setAttribute('aria-hidden', 'false');
    state.modalOpen = true;
    document.body.style.overflow = 'hidden';

    $('#modal-title').textContent = project.title;
    $('#modal-description').textContent = project.description;
    $('#modal-category').textContent = project.category;
    const durEl = $('#modal-duration');
    if (durEl) durEl.textContent = project.duration || 'Short Form';
    $('#modal-year').textContent = project.year;
    $('#modal-software').textContent = project.software;
    $('#modal-techniques').textContent = project.techniques;
  }

  function closeModal() {
    dom.modal.classList.remove('active');
    dom.modal.setAttribute('aria-hidden', 'true');
    state.modalOpen = false;
    document.body.style.overflow = '';
    SoundEngine.playWhooshClose();
  }

  function initModal() {
    dom.modalClose.addEventListener('click', closeModal);
    $('.modal-backdrop').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.modalOpen) {
        closeModal();
      }
    });
  }

  /* ============================== */
  /* PARALLAX — HERO SCROLL EXIT    */
  /* ============================== */
  function initParallax() {
    /* Hero scroll exit — replaced simple parallax with cinematic split */
    /* This is now driven by the master scroll loop (initScrollMotion) */
    /* Kept as a stub for backward compat — real work is in the motion system */
  }

  /* ============================== */
  /* RESIZE HANDLER                 */
  /* ============================== */
  function initResize() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        state.isMobile = window.innerWidth <= 768;
        state.isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      }, 250);
    });
  }

  /* ============================== */
  /* TIMELINE CLIP CLICK NAV        */
  /* ============================== */
  function initTimelineNav() {
    dom.clips.forEach(clip => {
      clip.addEventListener('click', () => {
        const sectionId = clip.dataset.section;
        const section = document.getElementById(sectionId);
        if (section) {
          SoundEngine.playClick();
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================== */
  /* LAZY LOAD VIDEOS               */
  /* ============================== */
  function initLazyVideos() {
    const videos = $$('video[data-src]');
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const video = entry.target;
            const src = video.dataset.src;
            if (src) {
              video.src = src;
              video.load();
            }
            observer.unobserve(video);
          }
        });
      },
      { rootMargin: '200px' }
    );

    videos.forEach(v => observer.observe(v));
  }

  /* ============================== */
  /* SMOKE EFFECT                   */
  /* ============================== */
  function initSmoke() {
    const smokeContainer = document.createElement('div');
    smokeContainer.className = 'smoke-container';
    smokeContainer.setAttribute('aria-hidden', 'true');
    smokeContainer.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
      opacity: 0.03;
    `;

    for (let i = 0; i < 3; i++) {
      const smoke = document.createElement('div');
      const size = 300 + Math.random() * 400;
      const x = Math.random() * 100;
      const delay = Math.random() * 20;
      const duration = 25 + Math.random() * 15;

      smoke.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}%;
        bottom: -${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(139,0,0,0.15) 0%, transparent 70%);
        filter: blur(60px);
        animation: smokeRise ${duration}s ease-in-out ${delay}s infinite;
      `;
      smokeContainer.appendChild(smoke);
    }

    const style = document.createElement('style');
    style.textContent = `
      @keyframes smokeRise {
        0%   { transform: translateY(0) scale(1); opacity: 0; }
        15%  { opacity: 1; }
        85%  { opacity: 1; }
        100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(smokeContainer);
  }

  /* ============================== */
  /* BUTTON SOUND HOOKS             */
  /* ============================== */
  function initButtonSounds() {
    $$('.btn, .cta-btn, .nav-link, .contact-link, .software-item').forEach(el => {
      el.addEventListener('click', () => {
        if (el.classList.contains('nav-link') || el.classList.contains('cta-btn')) {
          SoundEngine.playClick('primary');
        } else {
          SoundEngine.playClick('secondary');
        }
      });
      el.addEventListener('mouseenter', () => {
        SoundEngine.playHoverTick();
      });
    });
  }


  /* ============================================================
     SOUND ENGINE — Web Audio API Synthesized Sound Design
     Inspired by professional editing studio interfaces.
     All sounds are generated procedurally — no external files.
     ============================================================ */
  const SoundEngine = (() => {
    let ctx = null;
    let masterGain = null;
    let compressor = null;
    let convolver = null;
    
    let ambientGain = null;
    let scrollGain = null;
    let scrollSources = [];
    
    let ambientNodes = [];
    let randomDetailInterval = null;
    
    let scrollTimeout = null;
    let isScrolling = false;
    let enabled = false;
    let masterVolValue = 0.55; // 55% default

    // Base multipliers to ensure high UI volume that doesn't clip (handled by compressor)
    const VOL_MULT = 2.5; 
    const SCROLL_VOL = 0.015 * VOL_MULT;
    const AMBIENT_VOL = 0.004 * VOL_MULT;

    /* ---- Initialize AudioContext & Bus ---- */
    function _ensureCtx() {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Dynamics Compressor to prevent clipping
        compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -12;
        compressor.knee.value = 10;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.005;
        compressor.release.value = 0.1;
        
        // Master Gain
        masterGain = ctx.createGain();
        masterGain.gain.value = masterVolValue;
        
        // Convolver (Reverb)
        convolver = ctx.createConvolver();
        convolver.buffer = _createReverbBuffer(2.5, 2.0); // 2.5s decay
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.15;
        
        convolver.connect(reverbGain);
        reverbGain.connect(masterGain);
        
        masterGain.connect(compressor);
        compressor.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      return ctx;
    }

    /* ---- Procedural Buffers ---- */
    function _createNoiseBuffer(duration = 2) {
      const c = _ensureCtx();
      const length = c.sampleRate * duration;
      const buffer = c.createBuffer(1, length, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    function _createReverbBuffer(duration, decay) {
      const c = _ensureCtx();
      const length = c.sampleRate * duration;
      const buffer = c.createBuffer(2, length, c.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          // Exponential decay noise
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
      }
      return buffer;
    }
    function _createGearBuffer(clicksPerSecond = 14, duration = 2) {
      const c = _ensureCtx();
      const length = c.sampleRate * duration;
      const buffer = c.createBuffer(1, length, c.sampleRate);
      const data = buffer.getChannelData(0);
      
      const samplesPerClick = Math.floor(c.sampleRate / clicksPerSecond);
      
      for (let i = 0; i < length; i++) {
        const mod = i % samplesPerClick;
        if (mod < 80) { // sharp 80-sample transient
           const decay = Math.pow(1 - mod/80, 4);
           data[i] = (Math.random() * 2 - 1) * decay;
        } else {
           data[i] = 0;
        }
      }
      return buffer;
    }

    /* ---- Helpers ---- */
    function _playTone(freq, duration, volume, type = 'sine', useReverb = false) {
      if (!enabled) return;
      const c = _ensureCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, c.currentTime);
      
      const targetVol = volume * VOL_MULT;
      gain.gain.setValueAtTime(targetVol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      if (useReverb && convolver) {
        gain.connect(convolver);
      }
      
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    }

    function _playNoiseBurst(freq, q, duration, volume, sweepTo = null, filterType = 'bandpass', useReverb = false) {
      if (!enabled) return;
      const c = _ensureCtx();
      const noiseBuffer = _createNoiseBuffer(duration + 0.1);
      const source = c.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = c.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(freq, c.currentTime);
      filter.Q.value = q;

      if (sweepTo !== null) {
        filter.frequency.exponentialRampToValueAtTime(sweepTo, c.currentTime + duration);
      }

      const gain = c.createGain();
      const targetVol = volume * VOL_MULT;
      gain.gain.setValueAtTime(targetVol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      if (useReverb && convolver) {
        gain.connect(convolver);
      }
      
      source.start(c.currentTime);
      source.stop(c.currentTime + duration + 0.05);
    }

    /* ======== PUBLIC SOUNDS ======== */

    /* Cinematic loading sequence (bass swell, rumble) */
    function playLoadingSequence() {
      if (!enabled) return;
      const c = _ensureCtx();
      
      // Bass swell
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(30, c.currentTime);
      osc.frequency.linearRampToValueAtTime(55, c.currentTime + 3);
      
      gain.gain.setValueAtTime(0, c.currentTime);
      gain.gain.linearRampToValueAtTime(0.015 * VOL_MULT, c.currentTime + 2);
      gain.gain.linearRampToValueAtTime(0, c.currentTime + 4);
      
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + 4);

      // Mechanical rumble
      const noise = c.createBufferSource();
      noise.buffer = _createNoiseBuffer(4);
      const filter = c.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      
      const rumbleGain = c.createGain();
      rumbleGain.gain.setValueAtTime(0, c.currentTime);
      rumbleGain.gain.linearRampToValueAtTime(0.012 * VOL_MULT, c.currentTime + 1.5);
      rumbleGain.gain.linearRampToValueAtTime(0, c.currentTime + 3.5);
      
      noise.connect(filter);
      filter.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      noise.start(c.currentTime);
      
      ambientNodes.push(osc, noise);
    }

    /* Cinematic lock + impact (loader finishes) */
    function playLoadingComplete() {
      if (!enabled) return;
      // Mechanical lock
      _playNoiseBurst(800, 5, 0.1, 0.02);
      setTimeout(() => _playNoiseBurst(1200, 3, 0.2, 0.025), 100);
      
      // Cinematic impact
      setTimeout(() => {
        _playTone(40, 1.5, 0.04, 'sine', true); // Sub drop
        _playNoiseBurst(200, 0.5, 1.0, 0.015, 3000, 'lowpass', true); // Wide impact
      }, 200);
    }

    /* Website Open Reveal (elegant chord) */
    function playReveal() {
      if (!enabled) return;
      const c = _ensureCtx();
      
      const chord = [220, 261.63, 329.63, 440]; // A minor 9th (A3, C4, E4, A4)
      chord.forEach((freq, i) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq + (Math.random()*2 - 1); // slight detune
        
        gain.gain.setValueAtTime(0, c.currentTime);
        gain.gain.linearRampToValueAtTime((0.008 / chord.length) * VOL_MULT, c.currentTime + 0.5 + i*0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 4 + Math.random());
        
        osc.connect(gain);
        gain.connect(masterGain);
        gain.connect(convolver);
        osc.start(c.currentTime);
        osc.stop(c.currentTime + 5);
      });
    }

    /* Premium metallic timeline cue */
    function playSectionChange() {
      const pitch = 1 + (Math.random() - 0.5) * 0.02;
      _playTone(3200 * pitch, 0.08, 0.003, 'sine');
      _playTone(4800 * pitch, 0.03, 0.002, 'triangle');
      _playNoiseBurst(6000, 1, 0.02, 0.002, null, 'highpass'); // sharp transient
    }

    /* Premium tactile clicks for buttons */
    function playClick(type = 'primary') {
      const p = 1 + (Math.random() - 0.5) * 0.04;
      if (type === 'primary') {
        _playTone(1800 * p, 0.05, 0.1, 'sine');
        _playTone(2400 * p, 0.02, 0.05, 'triangle');
        _playNoiseBurst(1200, 2, 0.03, 0.06); // deeper mechanical chunk
      } else {
        _playTone(2800 * p, 0.04, 0.07, 'sine');
        _playTone(5200 * p, 0.02, 0.03, 'triangle');
      }
    }

    /* Soft UI tick */
    function playHoverTick() {
      const p = 3800 + (Math.random() - 0.5) * 200;
      _playNoiseBurst(p, 10, 0.015, 0.04, null, 'bandpass');
    }

    /* Cinematic project open (whoosh + bass + air) */
    function playWhooshOpen() {
      _playNoiseBurst(200, 1.2, 0.6, 0.12, 5000, 'bandpass', true); // Sweeping air
      _playTone(60, 0.5, 0.15, 'sine', true); // Bass hit
    }

    /* Cinematic project close (reverse whoosh + lock) */
    function playWhooshClose() {
      _playNoiseBurst(4000, 1.5, 0.4, 0.1, 150, 'bandpass'); // Reverse sweep
      setTimeout(() => {
        _playTone(1200, 0.05, 0.06, 'triangle'); // lock
        _playNoiseBurst(800, 5, 0.05, 0.08);
      }, 350);
    }

    /* ---- SCROLL SOUND ---- */
    function _startScrollSound() {}
    function _stopScrollSound() {}
    function handleScroll() {}

    /* ---- BACKGROUND AMBIENCE & DETAILS ---- */
    function _startAmbient() {}
    function _startRandomDetails() {}
    function _stopAmbient() {}

    /* ---- VOLUME & STATE ---- */
    function setMasterVolume(val) {
      masterVolValue = Math.max(0, Math.min(1, val));
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(masterVolValue, ctx.currentTime, 0.1);
      }
    }

    function enable() {
      enabled = true;
      _ensureCtx();
      _startAmbient();
      localStorage.setItem('tp-sound', '1');
      dom.soundToggle.classList.add('active');
      dom.soundToggle.querySelector('.sound-off').style.display = 'none';
      dom.soundToggle.querySelector('.sound-on').style.display = 'block';
      
      const wrap = document.getElementById('volume-slider-wrap');
      if(wrap) wrap.style.display = 'flex';
    }

    function disable() {
      enabled = false;
      _stopScrollSound();
      _stopAmbient();
      localStorage.setItem('tp-sound', '0');
      dom.soundToggle.classList.remove('active');
      dom.soundToggle.querySelector('.sound-off').style.display = 'block';
      dom.soundToggle.querySelector('.sound-on').style.display = 'none';
      
      const wrap = document.getElementById('volume-slider-wrap');
      if(wrap) wrap.style.display = 'none';
    }

    function isEnabled() {
      return enabled;
    }

    return {
      playLoadingSequence,
      playLoadingComplete,
      playReveal,
      playClick,
      playSectionChange,
      playHoverTick,
      playWhooshOpen,
      playWhooshClose,
      handleScroll,
      enable,
      disable,
      isEnabled,
      setMasterVolume
    };
  })();

  /* ============================== */
  /* SOUND TOGGLE & VOLUME UI       */
  /* ============================== */
  function initSoundToggle() {
    const toggle = dom.soundToggle;
    if (!toggle) return;

    toggle.addEventListener('click', () => {
      if (SoundEngine.isEnabled()) {
        SoundEngine.disable();
      } else {
        SoundEngine.enable();
        SoundEngine.playClick('primary');
      }
    });

    const volSlider = document.getElementById('volume-slider');
    const volLabel = document.getElementById('volume-label');
    
    if (volSlider && volLabel) {
      volSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        volLabel.textContent = val + '%';
        SoundEngine.setMasterVolume(val / 100);
      });
      
      volSlider.addEventListener('change', () => {
        SoundEngine.playClick('secondary'); // satisfying tick on release
      });
    }
  }

  /* ============================== */
  /* SCROLL SOUND INTEGRATION       */
  /* ============================== */
  function initScrollSound() {
    window.addEventListener('scroll', () => {
      SoundEngine.handleScroll();
    }, { passive: true });
  }

  /* ============================================================
     MOTION ENGINE — Scroll-linked animation system
     Cinematic portfolio motion design
     ============================================================ */

  /* ============================== */
  /* SCROLL VELOCITY TRACKER        */
  /* ============================== */
  function initScrollVelocity() {
    let prevScroll = window.scrollY;
    let velocity = 0;
    let ticking = false;

    state.scrollVelocity = 0;
    state.scrollDirection = 'down';
    state.smoothVelocity = 0;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          velocity = currentScroll - prevScroll;
          state.scrollDirection = velocity >= 0 ? 'down' : 'up';
          state.scrollVelocity = velocity;
          prevScroll = currentScroll;
          ticking = false;
        });
      }
    }, { passive: true });

    /* Smooth the velocity in the main loop */
    function smoothVelocity() {
      state.smoothVelocity += (state.scrollVelocity - state.smoothVelocity) * 0.1;
      /* Clamp */
      if (Math.abs(state.smoothVelocity) < 0.1) state.smoothVelocity = 0;
      requestAnimationFrame(smoothVelocity);
    }
    smoothVelocity();
  }

  /* ============================== */
  /* HERO SCROLL EXIT MOTION        */
  /* ============================== */
  function initHeroMotion() {
    const hero = $('#hero');
    const heroContent = $('.hero-content');
    const titleLine1 = $('[data-hero-line="1"]');
    const titleLine2 = $('[data-hero-line="2"]');
    const heroSubtitle = $('.hero-subtitle');
    const heroBg = $('[data-hero-bg]');
    const heroCta = $('.hero-cta');
    const heroScroll = $('[data-hero-scroll]');

    if (!hero || !heroContent) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function updateHeroScroll() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      if (scrollY < vh * 1.2) {
        const ratio = Math.min(1, scrollY / vh);
        const vel = state.smoothVelocity || 0;
        const velFactor = Math.min(1, Math.abs(vel) / 30);

        hero.classList.add('scroll-active');

        if (!prefersReduced) {
          /* SEQUENCE drifts up + scales */
          if (titleLine1 && titleLine1.classList.contains('revealed')) {
            const t1y = ratio * -20;
            const t1s = 1 - ratio * 0.05;
            const t1velY = vel * 0.08;
            titleLine1.style.transform = `translateY(${t1y + t1velY}%) scale(${t1s})`;
          }

          /* CO. drifts differently */
          if (titleLine2 && titleLine2.classList.contains('revealed')) {
            const t2y = ratio * -35;
            const t2s = 1 - ratio * 0.1;
            const t2velY = vel * 0.12;
            titleLine2.style.transform = `translateY(${t2y + t2velY}%) scale(${t2s})`;
          }

          /* Subtitle fades with offset */
          if (heroSubtitle) {
            const subY = ratio * -50;
            const subOp = Math.max(0, 1 - ratio * 1.5);
            heroSubtitle.style.transform = `translateY(${subY}px)`;
            heroSubtitle.style.opacity = subOp;
          }

          /* CTA fades */
          if (heroCta) {
            const ctaOp = Math.max(0, 1 - ratio * 2);
            heroCta.style.opacity = ctaOp;
          }

          /* Scroll indicator fades quickly */
          if (heroScroll) {
            const scrollOp = Math.max(0, 1 - ratio * 4);
            heroScroll.style.opacity = scrollOp;
          }

          /* Hero video scales slightly */
          if (heroBg) {
            const bgScale = 1 + ratio * 0.08;
            heroBg.style.transform = `scale(${bgScale})`;
          }
        } else {
          /* Reduced motion — just fade */
          heroContent.style.opacity = 1 - ratio * 1.2;
        }
      } else {
        hero.classList.remove('scroll-active');
      }

      requestAnimationFrame(updateHeroScroll);
    }

    updateHeroScroll();
  }

  /* ============================== */
  /* MASTER SCROLL MOTION LOOP      */
  /* ============================== */
  function initScrollMotion() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    /* Cache parallax elements */
    const parallaxEls = $$('[data-scroll-speed]').map(el => ({
      el,
      speed: parseFloat(el.dataset.scrollSpeed) || 0,
      rect: null,
    }));

    /* Cache heading parallax elements */
    const headingParallaxEls = $$('[data-heading-parallax]').map(el => ({
      el,
      direction: parseFloat(el.dataset.headingParallax) || 1,
      sectionEl: el.closest('.section'),
    }));

    /* Background text */
    const bgText = $('.section-bg-text');
    const projectsSection = $('#projects');

    /* Section glitch trigger */
    const sections = $$('[data-scroll-section]');
    let lastSectionIndex = -1;

    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const vel = state.smoothVelocity || 0;

      /* ---- Depth parallax for elements with data-scroll-speed ---- */
      parallaxEls.forEach(item => {
        const rect = item.el.getBoundingClientRect();
        /* Only animate if near viewport */
        if (rect.bottom > -200 && rect.top < vh + 200) {
          const center = rect.top + rect.height / 2;
          const distFromCenter = (center - vh / 2) / vh;
          const translateY = distFromCenter * item.speed * -100;
          item.el.style.transform = `translate3d(0, ${translateY}px, 0)`;
        }
      });

      /* ---- Heading horizontal parallax ---- */
      headingParallaxEls.forEach(item => {
        if (!item.sectionEl) return;
        const sRect = item.sectionEl.getBoundingClientRect();
        if (sRect.bottom > 0 && sRect.top < vh) {
          /* Progress through section: 0 at top, 1 at bottom */
          const progress = 1 - (sRect.bottom / (sRect.height + vh));
          const translateX = (progress - 0.5) * item.direction * 10; /* vw */
          item.el.style.transform = `translateX(${translateX}vw)`;
        }
      });

      /* ---- Background text horizontal scroll ---- */
      if (bgText && projectsSection) {
        const pRect = projectsSection.getBoundingClientRect();
        if (pRect.bottom > 0 && pRect.top < vh) {
          const progress = 1 - (pRect.bottom / (pRect.height + vh));
          const translateX = -20 + progress * 60; /* moves right as you scroll */
          bgText.style.transform = `translateY(-50%) translateX(${translateX}vw)`;
        }
      }

      /* ---- Section transition glitch ---- */
      let currentSectionIndex = 0;
      sections.forEach((section, i) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= vh * 0.4) {
          currentSectionIndex = i;
        }
      });

      if (currentSectionIndex !== lastSectionIndex && lastSectionIndex !== -1) {
        const currentSection = sections[currentSectionIndex];
        if (currentSection && !currentSection.classList.contains('hero')) {
          /* Brief scan line + micro-glitch */
          currentSection.classList.add('transitioning');
          const heading = currentSection.querySelector('.section-title');
          if (heading) heading.classList.add('micro-glitch');

          setTimeout(() => {
            currentSection.classList.remove('transitioning');
            if (heading) heading.classList.remove('micro-glitch');
          }, 300);
        }
      }
      lastSectionIndex = currentSectionIndex;

      /* ---- Timeline velocity glow ---- */
      if (dom.playhead) {
        if (Math.abs(vel) > 15) {
          dom.playhead.classList.add('fast-scroll');
        } else {
          dom.playhead.classList.remove('fast-scroll');
        }
      }

      requestAnimationFrame(update);
    }

    update();
  }

  /* ============================== */
  /* PROJECT THUMBNAIL PARALLAX     */
  /* ============================== */
  function initProjectParallax() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const panels = $$('.comic-panel').map(panel => ({
      el: panel,
      thumb: panel.querySelector('.panel-thumbnail'),
      frame: panel.querySelector('.panel-frame'),
    }));

    function update() {
      const vh = window.innerHeight;

      panels.forEach(item => {
        if (!item.thumb) return;
        const rect = item.el.getBoundingClientRect();

        /* Only process near-viewport panels */
        if (rect.bottom > -100 && rect.top < vh + 100) {
          item.el.classList.add('scroll-active');

          /* Card center relative to viewport center */
          const center = rect.top + rect.height / 2;
          const distFromCenter = (center - vh / 2) / vh;

          /* Thumbnail moves at different speed than card, creating depth */
          const thumbY = distFromCenter * -20; /* ±20px */
          const thumbScale = 1.05; /* always slightly zoomed for reveal */

          /* Don't override hover transform — check if hovered */
          if (!item.el.matches(':hover')) {
            item.thumb.style.transform = `scale(${thumbScale}) translateY(${thumbY}px)`;
          }
        } else {
          item.el.classList.remove('scroll-active');
        }
      });

      requestAnimationFrame(update);
    }

    update();
  }

  /* ============================== */
  /* PROJECT HOVER DEPTH            */
  /* ============================== */
  function initProjectHoverDepth() {
    if (state.isTouch) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    $$('.comic-panel').forEach(panel => {
      const thumb = panel.querySelector('.panel-thumbnail');
      if (!thumb) return;

      let hoverX = 0, hoverY = 0;
      let targetX = 0, targetY = 0;
      let rafId = null;

      function lerpHover() {
        hoverX += (targetX - hoverX) * 0.1;
        hoverY += (targetY - hoverY) * 0.1;

        panel.style.setProperty('--hover-x', hoverX.toFixed(2));
        panel.style.setProperty('--hover-y', hoverY.toFixed(2));

        if (Math.abs(targetX - hoverX) > 0.1 || Math.abs(targetY - hoverY) > 0.1) {
          rafId = requestAnimationFrame(lerpHover);
        }
      }

      panel.addEventListener('mousemove', (e) => {
        const rect = panel.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        /* Cursor position relative to center, normalized -1 to 1 */
        const relX = (e.clientX - cx) / (rect.width / 2);
        const relY = (e.clientY - cy) / (rect.height / 2);

        /* Image shifts OPPOSITE to cursor (max ±10px) */
        targetX = relX * -10;
        targetY = relY * -10;

        if (!rafId) {
          rafId = requestAnimationFrame(lerpHover);
        }
      });

      panel.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!rafId) {
          rafId = requestAnimationFrame(lerpHover);
        }
      });
    });
  }

  /* ============================== */
  /* TIMELINE ENHANCED              */
  /* ============================== */
  function initTimelineEnhanced() {
    /* Smooth playhead interpolation */
    let currentPlayheadPos = 0;
    let targetPlayheadPos = 0;

    /* Override the playhead update in updateTimeline */
    const origUpdateTimeline = updateTimeline;

    /* Patch: after the original updateTimeline sets the playhead position,
       we smooth it. We do this by running our own RAF loop. */
    function smoothPlayhead() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetPlayheadPos = Math.min(1, Math.max(0, scrollTop / docHeight)) * 100;

      currentPlayheadPos += (targetPlayheadPos - currentPlayheadPos) * 0.15;

      if (dom.playhead) {
        dom.playhead.style.left = currentPlayheadPos + '%';
      }

      requestAnimationFrame(smoothPlayhead);
    }

    smoothPlayhead();
  }

  /* ============================== */
  /* CURSOR ENHANCEMENTS            */
  /* ============================== */
  function initCursorEnhanced() {
    if (state.isTouch) return;

    /* Play mode on cinema frame and showreel */
    const playTargets = $$('.cinema-frame, .cinema-placeholder');
    playTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        dom.cursorRing.classList.add('play-mode');
      });
      el.addEventListener('mouseleave', () => {
        dom.cursorRing.classList.remove('play-mode');
      });
    });

    /* Velocity-reactive cursor stretching */
    function updateCursorVelocity() {
      const vel = Math.abs(state.smoothVelocity || 0);
      const stretch = Math.min(vel / 50, 0.15);

      if (vel > 3) {
        const scaleX = 1 - stretch * 0.3;
        const scaleY = 1 + stretch * 0.5;
        dom.cursorRing.style.borderRadius = `${50 - stretch * 15}%`;
      } else {
        dom.cursorRing.style.borderRadius = '';
      }

      requestAnimationFrame(updateCursorVelocity);
    }

    updateCursorVelocity();
  }

  /* ============================== */
  /* MICRO-GLITCH TRIGGERS          */
  /* ============================== */
  function initMicroGlitch() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    /* Glitch on project panel hover (very subtle, 2-frame) */
    $$('.comic-panel').forEach(panel => {
      panel.addEventListener('mouseenter', () => {
        const frame = panel.querySelector('.panel-frame');
        if (frame) {
          frame.classList.add('micro-glitch');
          setTimeout(() => frame.classList.remove('micro-glitch'), 150);
        }
      });
    });
  }

  /* ============================== */
  /* SHOWREEL PARALLAX              */
  /* ============================== */
  function initShowreelParallax() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const showreel = $('#showreel');
    const cinemaFrame = $('.cinema-frame');
    const cinemaShadow = $('.cinema-shadow');
    const playIcon = showreel ? showreel.querySelector('.play-icon') : null;

    if (!showreel || !cinemaFrame) return;

    function update() {
      const rect = showreel.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.bottom > 0 && rect.top < vh) {
        showreel.classList.add('scroll-active');
        const progress = 1 - (rect.bottom / (rect.height + vh));
        const center = rect.top + rect.height / 2;
        const distFromCenter = (center - vh / 2) / vh;

        /* Frame parallax */
        const frameY = distFromCenter * -15;
        cinemaFrame.style.transform = `translateY(${frameY}px)`;

        /* Shadow moves differently */
        if (cinemaShadow) {
          const shadowY = distFromCenter * -8;
          cinemaShadow.style.transform = `translateY(${shadowY}px)`;
        }
      } else {
        showreel.classList.remove('scroll-active');
      }

      requestAnimationFrame(update);
    }

    update();
  }

  /* ============================== */
  /* INITIALIZE EVERYTHING          */
  /* ============================== */
  function init() {
    initLoader();
    initCursor();
    initMagnetic();
    initRipple();
    initNavbar();
    initTimeline();
    initTimelineNav();
    initGrain();
    initReveals();
    initProjectShowcaseSequence();
    initShowreel();
    initModal();
    initParallax();
    initResize();
    initLazyVideos();
    initSmoke();
    initSoundToggle();
    initScrollSound();
    initButtonSounds();
    initExperimentalVideos();

    /* === MOTION ENGINE === */
    initScrollVelocity();
    initHeroMotion();
    initScrollMotion();
    initTimelineEnhanced();
    initCursorEnhanced();
    initMicroGlitch();
    initShowreelParallax();
  }

  /* ============================== */
  /* EXPERIMENTAL VIDEO OVERLAYS    */
  /* ============================== */
  function initExperimentalVideos() {
    $$('.exp-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (typeof SoundEngine !== 'undefined') SoundEngine.playHoverTick();
      });
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
