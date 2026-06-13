/* ==========================================================================
   POCKET DRAGON - INTERACTIVE CONTROLLER
   Acoustic physics, 3D css transitions, & game-inspired micro-interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initCustomCursor();
  initHeroMobileScreen();
  initPlaygroundHoverSounds();
  initFaqAccordion();
  initFaqReveal();
  initSubscriptionModal();
  initLoginForm();
  initHeaderScroll();
});

/* ==========================================================================
   WEB AUDIO API: PHYSICAL MAHJONG TILE CLACK SYNTHESIZER
   ========================================================================== */
let audioCtx = null;

/**
 * Initializes the Audio Context on first physical user interaction.
 */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

/**
 * Synthesizes a physical "clack" sound of two bone/acrylic tiles colliding.
 * Uses a double impulse structure: a sharp main strike followed by a rapid secondary micro-bounce.
 */
function playTileClack() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  // Sound generator helper for a single strike
  const playStrike = (time, volume, pitchOffset) => {
    // 1. High frequency transient snap (representing initial contact)
    const snapOsc = audioCtx.createOscillator();
    const snapGain = audioCtx.createGain();
    snapOsc.type = 'sine';
    
    // Quick pitch sweep downwards
    snapOsc.frequency.setValueAtTime(3200 + pitchOffset, time);
    snapOsc.frequency.exponentialRampToValueAtTime(800, time + 0.005);
    
    // Quick envelope
    snapGain.gain.setValueAtTime(volume * 0.8, time);
    snapGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.006);
    
    snapOsc.connect(snapGain);
    snapGain.connect(audioCtx.destination);
    
    snapOsc.start(time);
    snapOsc.stop(time + 0.01);

    // 2. High-frequency resonance of the heavy bone/plastic material
    const resonanceOsc = audioCtx.createOscillator();
    const resonanceGain = audioCtx.createGain();
    const resonanceFilter = audioCtx.createBiquadFilter();
    
    resonanceOsc.type = 'triangle';
    resonanceOsc.frequency.setValueAtTime(1450 + (pitchOffset * 0.5), time);
    
    // Fast decay envelope for the body sound
    resonanceGain.gain.setValueAtTime(volume * 0.5, time);
    resonanceGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);
    
    // Bandpass filter to isolate the sharp material clink
    resonanceFilter.type = 'bandpass';
    resonanceFilter.frequency.setValueAtTime(1800, time);
    resonanceFilter.Q.setValueAtTime(8, time);
    
    resonanceOsc.connect(resonanceFilter);
    resonanceFilter.connect(resonanceGain);
    resonanceGain.connect(audioCtx.destination);
    
    resonanceOsc.start(time);
    resonanceOsc.stop(time + 0.05);

    // 3. Low-end wooden table knock component (felt more than heard)
    const knockOsc = audioCtx.createOscillator();
    const knockGain = audioCtx.createGain();
    knockOsc.type = 'sine';
    knockOsc.frequency.setValueAtTime(120, time);
    knockOsc.frequency.linearRampToValueAtTime(80, time + 0.03);
    
    knockGain.gain.setValueAtTime(volume * 0.25, time);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
    
    knockOsc.connect(knockGain);
    knockGain.connect(audioCtx.destination);
    
    knockOsc.start(time);
    knockOsc.stop(time + 0.04);
  };

  // Primary Impact (heavy click)
  playStrike(now, 0.45, 0);

  // Secondary Micro-Impact (tactile bounce back 16 milliseconds later)
  playStrike(now + 0.016, 0.22, -150);
}

/**
 * Synthesizes a soft physical wood-clink sound of sliding tiles contacting each other on a rack.
 */
function playWoodSlideClink() {
  initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;

  const playStrike = (time, volume, pitch) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, time + 0.006);
    
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.015);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(time);
    osc.stop(time + 0.02);
  };

  // Soft sliding double click
  playStrike(now, 0.06, 2200);
  playStrike(now + 0.012, 0.03, 1900);
}

/**
 * Triggers soft wood-slide sounds when hover tilting the Walnut trays.
 */
function initPlaygroundHoverSounds() {
  const items = document.querySelectorAll('.playground-card');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Play soft clink only if audio context is running (initialized by a previous action)
      if (audioCtx && audioCtx.state === 'running') {
        playWoodSlideClink();
      }
    });
  });
}

/* ==========================================================================
   SECTION 1: HERO MOSAIC (3D CSS Flip & Tilt Physics)
   ========================================================================= */
/* ==========================================================================
   PREMIUM PRELOADER & CUSTOM CURSOR LOGIC
   ========================================================================= */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const minDuration = 2000; // 2 seconds minimum show time
  const startTime = Date.now();

  const hidePreloader = () => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);

    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.add('loaded');
    }, remaining);
  };

  if (document.readyState === 'complete') {
    hidePreloader();
  } else {
    window.addEventListener('load', hidePreloader);
  }
}

function initCustomCursor() {
  const ring = document.getElementById('custom-cursor-ring');
  const dot = document.getElementById('custom-cursor-dot');
  if (!ring || !dot) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;
  let dotX = 0, dotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function tick() {
    // Ring follows mouse with smooth interpolation
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;

    // Dot follows mouse faster
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;

    requestAnimationFrame(tick);
  }
  tick();

  // Add hover status tracking to morph cursor
  const updateHoverables = () => {
    const hoverables = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], .faq-trigger, .playground-card, .btn-outline-rust, .btn-rust-filled, .btn-outline-offwhite, .btn-card-buy, .download-badge-link'
    );

    hoverables.forEach(el => {
      // Avoid duplicate event listeners
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = 'true';

      el.addEventListener('mouseenter', () => {
        ring.classList.add('hover-active');
        dot.classList.add('hover-active');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('hover-active');
        dot.classList.remove('hover-active');
      });
    });
  };

  updateHoverables();

  // Re-run whenever DOM updates might add new hoverable elements (like modals opening)
  const observer = new MutationObserver(updateHoverables);
  observer.observe(document.body, { childList: true, subtree: true });
}

/* ==========================================================================
   SECTION 1: HERO MOBILE SCREEN (3D Parallax Bezel Tilt)
   ========================================================================= */
function initHeroMobileScreen() {
  const wrapper = document.getElementById('phone-container-wrapper');
  if (!wrapper) return;

  const visualContainer = wrapper.parentElement;
  
  visualContainer.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Relative coordinates between -1 and 1
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    // Max rotation in degrees
    const maxRotX = 15; 
    const maxRotY = 15;

    const rotX = -dy * maxRotX;
    const rotY = dx * maxRotY;

    // Apply 3D warp to wrapper
    wrapper.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(20px)`;
  });

  visualContainer.addEventListener('mouseleave', () => {
    // Return smoothly to center state
    wrapper.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
}

/* ==========================================================================
   SECTION 5: FAQ REVEAL (IntersectionObserver Sequential left-to-right)
   ========================================================================= */
function initFaqReveal() {
  const faqSection = document.getElementById('faq');
  const items = document.querySelectorAll('.faq-item:not(.faq-hidden)');
  const viewMoreBtn = document.getElementById('faq-view-more-btn');
  if (!faqSection || items.length === 0) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('revealed');
          }, index * 150);
        });
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  observer.observe(faqSection);

  if (viewMoreBtn) {
    let expanded = false;
    const hiddenItems = Array.from(document.querySelectorAll('.faq-item.faq-hidden'));

    viewMoreBtn.addEventListener('click', () => {
      try {
        playTileClack();
      } catch(e) {}

      if (!expanded) {
        // Expand
        hiddenItems.forEach((item, index) => {
          item.classList.remove('faq-hidden');
          setTimeout(() => {
            item.classList.add('revealed');
          }, index * 120);
        });
        viewMoreBtn.textContent = 'VIEW LESS QUESTIONS';
        expanded = true;
      } else {
        // Collapse
        hiddenItems.forEach((item) => {
          item.classList.remove('revealed');
          const trigger = item.querySelector('.faq-trigger');
          const panel = item.querySelector('.faq-panel');
          if (trigger && trigger.getAttribute('aria-expanded') === 'true') {
            trigger.setAttribute('aria-expanded', 'false');
            panel.setAttribute('aria-hidden', 'true');
            panel.style.maxHeight = '0';
          }
        });

        setTimeout(() => {
          hiddenItems.forEach(item => {
            item.classList.add('faq-hidden');
          });
        }, 400);

        viewMoreBtn.textContent = 'VIEW MORE QUESTIONS (6)';
        expanded = false;
      }
    });
  }
}

/* ==========================================================================
   SECTION 5: FAQ ACOUSTIC ACCORDION (Tactile Clack)
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');
  
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      // Initialize Web Audio API on click to satisfy user interaction policies
      initAudio();

      const item = trigger.closest('.faq-item');
      const panel = item.querySelector('.faq-panel');
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // 1. Play tactile double "clack" audio feedback
      playTileClack();

      // 2. Add visual mechanical "clack" shake animation to item card
      item.classList.remove('clack-active');
      void item.offsetWidth; // Force CSS reflow to restart keyframe animation
      item.classList.add('clack-active');

      // 3. Toggle heights and state attributes
      if (isExpanded) {
        trigger.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        panel.style.maxHeight = '0';
      } else {
        trigger.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }

      // Cleanup visual shake class after animation completes
      setTimeout(() => {
        item.classList.remove('clack-active');
      }, 400);
    });
  });
}

/* ==========================================================================
   SECTION 3: SUBSCRIPTION MODAL (Cancellation Clause info trigger)
   ========================================================================= */
function initSubscriptionModal() {
  const trigger = document.getElementById('annual-info-trigger');
  const modal = document.getElementById('subscription-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const confirmBtn = document.getElementById('modal-confirm-btn');

  if (!trigger || !modal) return;

  const openModal = () => {
    initAudio();
    playTileClack();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock main scrolling
  };

  const closeModal = () => {
    initAudio();
    playTileClack();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Unlock scrolling
  };

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  confirmBtn.addEventListener('click', closeModal);

  // Close when clicking overlay backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   SECTION 4: LOGIN FORM (Premium alerts & authentications)
   ========================================================================= */
function initLoginForm() {
  const form = document.getElementById('portal-login-form');
  const signUpBtn = document.getElementById('signup-nav-btn');
  const forgotLink = document.getElementById('forgot-password-link');

  if (!form) return;

  // Custom alert toast generator to fit premium editorial design (avoids alert() blocking)
  const showPremiumToast = (message, isError = false) => {
    // Remove existing toast
    const existing = document.querySelector('.premium-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `premium-toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${isError ? 'var(--color-rust)' : 'var(--color-green-light)'};
      color: var(--color-offwhite);
      border: 1px solid var(--color-offwhite-trans);
      padding: 1.25rem 2.5rem;
      border-radius: 8px;
      font-family: var(--font-primary);
      font-size: 0.85rem;
      font-weight: bold;
      letter-spacing: var(--letter-spacing-wide);
      z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    `;
    toast.textContent = message.toUpperCase();
    document.body.appendChild(toast);

    // Fade-in
    setTimeout(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    }, 50);

    // Audio click feedback
    try {
      playTileClack();
    } catch(e) {}

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.transform = 'translateY(10px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username-input').value;
    
    showPremiumToast(`AUTHENTICATING PROFILE: ${username}...`);
    
    setTimeout(() => {
      showPremiumToast("PORTAL ACTIVE: DOWNLOAD POCKET DRAGON MOBILE FOR COMPETE CLUBS", false);
    }, 1200);
  });

  signUpBtn.addEventListener('click', () => {
    showPremiumToast("SIGN UP DIRECTLY IN POCKET DRAGON APP FOR 2-WEEK FREE TRIAL MEMBERSHIP");
  });

  forgotLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPremiumToast("PASSWORD RESET TOKEN SENT TO YOUR REGISTERED PROFILE DEVICE");
  });
}

/* ==========================================================================
   NAVIGATION SCRIPTS (Scroll-effects, anchor highlights)
   ========================================================================= */
function initHeaderScroll() {
  const header = document.querySelector('.studio-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Policy triggers for Razorpay footer compliance mockup
  const policyTriggers = document.querySelectorAll('.policy-trigger');
  policyTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const policyType = trigger.dataset.policy;
      const title = policyType === 'privacy' ? 'PRIVACY POLICY' : 'TERMS OF USE';
      
      // Display standard policy alerts nicely
      const modal = document.getElementById('subscription-modal');
      if (modal) {
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        const modalFineprint = modal.querySelector('.modal-fineprint');
        
        modalTitle.textContent = title;
        if (policyType === 'privacy') {
          modalBody.innerHTML = `
            <p><strong>POCKET DRAGON PRIVACY PLEDGE</strong></p>
            <p>We take player data security seriously. Your credentials and gaming histories are stored with top-tier encrypted protocols and are never shared with third parties.</p>
            <p>For Razorpay transactions, we process billing details securely under strictly authenticated tokens.</p>
          `;
        } else {
          modalBody.innerHTML = `
            <p><strong>TERMS OF GAME SERVICE</strong></p>
            <p>By registering, you agree to fair-play rules. Abuse of matchmaking, exploiting bots, or bug manipulation will result in direct suspension of ranks and memberships.</p>
            <p>Subscription cancellations can be managed at any point under account settings.</p>
          `;
        }
        if (modalFineprint) modalFineprint.remove();
        
        // Open the modal
        initAudio();
        playTileClack();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });
}
