/* ============================================================
   THRUSHAR PREM — CINEMATIC PORTFOLIO
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
    timelineSections: ['hero', 'showreel', 'projects', 'services', 'about', 'contact'],
    totalTimecode: '03:24:00:00',
  };

  /* Project data for modal */
  const PROJECTS = {
    1: {
      title: 'MIDNIGHT CHASE',
      category: 'SHORT FILM',
      duration: '04:32',
      year: '2025',
      software: 'Premiere Pro, After Effects, DaVinci Resolve',
      techniques: 'Color Grading, Sound Design, VFX Compositing',
      description: 'A tense, atmospheric short film following a lone figure through rain-soaked city streets. Heavy emphasis on mood-driven color grading and precise rhythmic editing.',
    },
    2: {
      title: 'URBAN DECAY',
      category: 'MUSIC VIDEO',
      duration: '03:18',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Speed Ramping, Glitch Effects, Beat Sync',
      description: 'An experimental music video exploring urban environments through distorted visuals and tightly synced editing. Every cut lands on beat.',
    },
    3: {
      title: 'NEON NIGHTS',
      category: 'COMMERCIAL',
      duration: '00:45',
      year: '2024',
      software: 'After Effects, Photoshop',
      techniques: 'Motion Graphics, Typography Animation, Compositing',
      description: 'A sleek product commercial built around bold typography and smooth motion graphics. Clean, modern, and visually striking.',
    },
    4: {
      title: 'FRAGMENTS',
      category: 'DOCUMENTARY',
      duration: '12:07',
      year: '2024',
      software: 'DaVinci Resolve, Premiere Pro',
      techniques: 'Color Grading, Interview Editing, B-Roll Assembly',
      description: 'A mini-documentary exploring memory and place. Carefully paced with layered audio design and a muted, film-like color palette.',
    },
    5: {
      title: 'ECLIPSE',
      category: 'MOTION GRAPHICS',
      duration: '01:20',
      year: '2025',
      software: 'After Effects, Illustrator',
      techniques: 'Shape Animation, Particle Effects, 3D Camera',
      description: 'An abstract motion piece exploring light and shadow. Built entirely in After Effects with procedural animation and 3D camera work.',
    },
    6: {
      title: 'VELOCITY',
      category: 'GAMING MONTAGE',
      duration: '02:55',
      year: '2025',
      software: 'Premiere Pro, After Effects',
      techniques: 'Speed Ramping, Flow Transitions, Sound Design',
      description: 'A high-energy gaming montage featuring precision speed ramps, seamless flow transitions, and custom sound design. Every frame hits different.',
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
    showreelFrame: $('#showreel-frame'),
    soundToggle:  $('#sound-toggle'),
  };

  /* ============================== */
  /* STATE                          */
  /* ============================== */
  const state = {
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    ring:   { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    lastScroll: 0,
    scrollDir: 'down',
    loaded: false,
    modalOpen: false,
    isMobile: window.innerWidth <= 768,
    soundEnabled: false,
    activeSection: 0,
  };

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
      el = document.getElementById('camera-cursor');
      if (!el) return;
      cx = state.mouse.x;
      cy = state.mouse.y;
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
        // Need to target the inner div for transform so we don't fight with the fixed positioning translate?
        // Actually, since left/top are used, we can just transform the element itself.
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
      if (el) el.style.display = 'none';
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
    
    dom.timeline.classList.add('visible');
    SoundEngine.playReveal(); // Cinematic reveal chord
    setTimeout(() => {
      $$('.hero [data-reveal]').forEach(el => el.classList.add('revealed'));
    }, 300);
  }

  /* ============================== */
  /* CUSTOM CURSOR                  */
  /* ============================== */
  function initCursor() {
    if (state.isMobile) return;

    document.addEventListener('mousemove', (e) => {
      state.mouse.x = e.clientX;
      state.mouse.y = e.clientY;
    });

    const interactives = $$('a, button, .comic-panel, .cinema-frame, [data-magnetic]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => dom.cursorRing.classList.add('expanded'));
      el.addEventListener('mouseleave', () => dom.cursorRing.classList.remove('expanded'));
    });

    document.addEventListener('mouseleave', () => {
      dom.cursorDot.classList.add('hidden');
      dom.cursorRing.classList.add('hidden');
    });
    document.addEventListener('mouseenter', () => {
      dom.cursorDot.classList.remove('hidden');
      dom.cursorRing.classList.remove('hidden');
    });

    updateCursor();
  }

  function updateCursor() {
    state.cursor.x += (state.mouse.x - state.cursor.x) * CONFIG.cursorLerp;
    state.cursor.y += (state.mouse.y - state.cursor.y) * CONFIG.cursorLerp;
    state.ring.x += (state.mouse.x - state.ring.x) * CONFIG.cursorRingLerp;
    state.ring.y += (state.mouse.y - state.ring.y) * CONFIG.cursorRingLerp;

    dom.cursorDot.style.left = state.cursor.x + 'px';
    dom.cursorDot.style.top = state.cursor.y + 'px';
    dom.cursorRing.style.left = state.ring.x + 'px';
    dom.cursorRing.style.top = state.ring.y + 'px';

    requestAnimationFrame(updateCursor);
  }

  /* ============================== */
  /* MAGNETIC BUTTONS               */
  /* ============================== */
  function initMagnetic() {
    if (state.isMobile) return;

    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        btn.style.transform = `translate(${dx * CONFIG.magnetStrength}px, ${dy * CONFIG.magnetStrength}px)`;
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
    window.addEventListener('scroll', updateTimeline, { passive: true });
    updateTimeline();

    // Timeline Scrubbing Logic
    let isScrubbing = false;

    function scrub(e) {
      if (!isScrubbing) return;
      const rect = dom.timelineTrack.getBoundingClientRect();
      const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      
      let progress = (clientX - rect.left) / rect.width;
      progress = Math.max(0, Math.min(1, progress));
      
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, progress * docHeight);
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
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, Math.max(0, scrollTop / docHeight));

    dom.playhead.style.left = (progress * 100) + '%';

    const totalSeconds = 12240; // 3 hours 24 mins (204 mins * 60)
    const currentSeconds = progress * totalSeconds;
    const hours = Math.floor(currentSeconds / 3600);
    const mins = Math.floor((currentSeconds % 3600) / 60);
    const secs = Math.floor(currentSeconds % 60);
    const frames = Math.floor((currentSeconds % 1) * 24);
    
    dom.timecode.textContent =
      String(hours).padStart(2, '0') + ':' +
      String(mins).padStart(2, '0') + ':' +
      String(secs).padStart(2, '0') + ':' +
      String(frames).padStart(2, '0');
      
    if (dom.duration) {
      dom.duration.textContent = dom.timecode.textContent;
    }

    const sections = CONFIG.timelineSections;
    let activeIndex = 0;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = document.getElementById(sections[i]);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.4) {
          activeIndex = i;
          break;
        }
      }
    }

    // Section change detection — trigger sound
    if (activeIndex !== state.activeSection) {
      state.activeSection = activeIndex;
      SoundEngine.playSectionChange();
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
  }

  /* ============================== */
  /* COMIC PANEL PROJECTS           */
  /* ============================== */
  function initProjectPanels() {
    $$('.comic-panel').forEach(panel => {
      const video = panel.querySelector('.panel-video');

      // Hover: play video preview + sound
      panel.addEventListener('mouseenter', () => {
        if (video) {
          video.play().catch(() => {});
        }
        SoundEngine.playHoverTick();
      });

      panel.addEventListener('mouseleave', () => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });

      // Click: open modal with cinematic whoosh
      panel.addEventListener('click', () => {
        const projectId = panel.dataset.project;
        SoundEngine.playWhooshOpen();
        openModal(projectId);
      });
    });
  }

  /* ============================== */
  /* SHOWREEL                       */
  /* ============================== */
  function initShowreel() {
    if (dom.showreelFrame) {
      dom.showreelFrame.addEventListener('click', () => {
        SoundEngine.playWhooshOpen();
        openShowreelModal();
      });
    }
  }

  function openShowreelModal() {
    dom.modal.classList.add('active');
    dom.modal.setAttribute('aria-hidden', 'false');
    state.modalOpen = true;
    document.body.style.overflow = 'hidden';

    $('#modal-title').textContent = 'SHOWREEL 2025';
    $('#modal-description').textContent = 'A curated collection of my best work — short films, commercials, motion graphics, and more. Every frame, every cut, every color choice is intentional.';
    $('#modal-category').textContent = 'SHOWREEL';
    $('#modal-duration').textContent = '02:30';
    $('#modal-year').textContent = '2025';
    $('#modal-software').textContent = 'Premiere Pro, After Effects, DaVinci Resolve';
    $('#modal-techniques').textContent = 'Color Grading, Motion Graphics, Sound Design, Compositing';
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
    $('#modal-duration').textContent = project.duration;
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
  /* PARALLAX                       */
  /* ============================== */
  function initParallax() {
    const heroContent = $('.hero-content');
    if (!heroContent) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      if (scrollY < vh) {
        const ratio = scrollY / vh;
        heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
        heroContent.style.opacity = 1 - ratio * 1.2;
      }
    }, { passive: true });
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
      }, 250);
    });
  }

  /* ============================== */
  /* TIMELINE CLIP CLICK NAV        */
  /* ============================== */
  function initTimelineNav() {
    dom.clips.forEach(clip => {
      clip.style.cursor = 'none';
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
    initProjectPanels();
    initShowreel();
    initModal();
    initParallax();
    initResize();
    initLazyVideos();
    initSmoke();
    initSoundToggle();
    initScrollSound();
    initButtonSounds();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
