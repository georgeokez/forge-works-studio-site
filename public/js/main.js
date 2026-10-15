// Loaded in <head> so the .js / .motion classes are set before first paint.
// .motion gates every "starts hidden, animates in" style, so visitors who prefer reduced motion
// (or browsers without IntersectionObserver) simply get the finished page.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
document.documentElement.classList.add('js');
if (!reduceMotion && 'IntersectionObserver' in window) document.documentElement.classList.add('motion');

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// Wrap each word of an element's text in spans, keeping inline markup such as <em> and <br>.
// With `mask`, words get an overflow-hidden wrapper so they can rise into view.
function splitWords(root, mask) {
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
      if (child.nodeType !== Node.TEXT_NODE) return;
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.append(part);
          return;
        }
        const word = document.createElement('span');
        word.textContent = part;
        if (mask) {
          const outer = document.createElement('span');
          outer.className = 'w';
          word.style.setProperty('--i', words.length);
          outer.append(word);
          frag.append(outer);
        } else {
          word.className = 'gw';
          frag.append(word);
        }
        words.push(word);
      });
      child.replaceWith(frag);
    });
  };
  walk(root);
  return words;
}

document.addEventListener('DOMContentLoaded', () => {
  const motion = document.documentElement.classList.contains('motion');

  // Mobile navigation
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (header && toggle) {
    const setOpen = (open) => {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(!header.classList.contains('nav-open')));
    header.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  }
  // Never leave keyboard focus inside a tucked-away header
  header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));

  // Scroll spy: underline the nav item for the section crossing the middle of the viewport
  const spyLinks = [...document.querySelectorAll('[data-spy]')];
  if (spyLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          spyLinks.forEach((a) => {
            const on = a.dataset.spy === e.target.id;
            a.classList.toggle('is-active', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-45% 0px -54% 0px' },
    );
    document.querySelectorAll('main > section').forEach((s) => spy.observe(s));
  }

  // Footer wordmark: one span per letter (for the reveal and per-letter hover)
  document.querySelectorAll('[data-letters]').forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.setProperty('--i', i);
      el.append(s);
    });
  });

  // Scroll reveal, with staggered siblings inside [data-stagger] groups
  if (motion) {
    document.querySelectorAll('[data-split]').forEach((el) => splitWords(el, true));
    document.querySelectorAll('[data-stagger]').forEach((group) => {
      [...group.children]
        .filter((el) => el.classList.contains('rv'))
        .forEach((el, i) => el.style.setProperty('--d', `${i * 90}ms`));
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('.rv, .draw, [data-split], [data-letters]').forEach((el) => io.observe(el));
  }

  // Marquee: drifts on its own, speeds up with scroll velocity and follows scroll direction
  let kickMarquee = () => {};
  const marquee = document.querySelector('[data-marquee]');
  const track = marquee?.querySelector('[data-marquee-track]');
  if (track && motion) {
    const BASE = 40; // px per second
    let x = 0;
    let dir = 1;
    let boost = 0;
    let width = 0;
    let last = 0;
    let visible = false;
    let running = false;
    const measure = () => {
      width = track.firstElementChild.offsetWidth;
    };
    const step = (now) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      boost *= 0.92;
      x = (x + dir * (BASE + boost) * dt) % width;
      if (x < 0) x += width;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      if (visible) requestAnimationFrame(step);
      else running = false;
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(step);
      }
    }).observe(marquee);
    kickMarquee = (dy) => {
      if (dy) dir = dy > 0 ? 1 : -1;
      boost = Math.min(boost + Math.abs(dy) * 6, 900);
    };
  }

  // Scroll-linked effects, batched into one frame per scroll
  const progressBar = document.querySelector('[data-scroll-progress]');
  const hero = document.querySelector('[data-hero]');
  const heroArt = document.querySelector('[data-hero-art]');
  const goal = document.querySelector('[data-goal]');
  const goalWords = goal && motion ? splitWords(goal, false) : [];
  const principles = motion ? [...document.querySelectorAll('[data-principles] > li')] : [];
  const process = motion ? document.querySelector('[data-process]') : null;
  const processLine = process?.querySelector('.process-line');
  const steps = process ? [...process.querySelectorAll('li')] : [];
  const parallax = motion ? [...document.querySelectorAll('[data-parallax]')] : [];
  let lastY = window.scrollY;
  let litWords = -1;

  const update = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const dy = y - lastY;
    lastY = y;

    if (header) {
      header.classList.toggle('is-scrolled', y > 8);
      if (dy > 2 && y > 320 && !header.classList.contains('nav-open') && !header.contains(document.activeElement)) {
        header.classList.add('is-hidden');
      } else if (dy < -2 || y <= 320) {
        header.classList.remove('is-hidden');
      }
    }
    if (progressBar) {
      const max = document.documentElement.scrollHeight - vh;
      progressBar.style.transform = `scaleX(${max > 0 ? clamp(y / max) : 0})`;
    }
    if (!motion) return;

    kickMarquee(dy);

    if (hero && heroArt) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > 0) heroArt.style.setProperty('--hs', clamp(-r.top / r.height).toFixed(4));
    }

    if (goalWords.length) {
      // 0 when the paragraph's top reaches 85% of the viewport, 1 when its bottom reaches 45%
      const r = goal.getBoundingClientRect();
      const n = Math.round(clamp((vh * 0.85 - r.top) / (vh * 0.4 + r.height)) * goalWords.length);
      if (n !== litWords) {
        goalWords.forEach((w, i) => w.classList.toggle('on', i < n));
        litWords = n;
      }
    }

    principles.forEach((li) => {
      const r = li.getBoundingClientRect();
      li.classList.toggle('is-lit', r.top + r.height / 2 < vh * 0.72);
    });

    if (process) {
      const r = process.getBoundingClientRect();
      const vertical = processLine.offsetHeight > processLine.offsetWidth;
      const p = vertical ? clamp((vh * 0.75 - r.top) / r.height) : clamp((vh * 0.85 - r.top) / (vh * 0.4));
      process.style.setProperty('--p', p.toFixed(4));
      steps.forEach((li) => {
        const n = li.querySelector('.node').getBoundingClientRect();
        const at = vertical ? (n.top + n.height / 2 - r.top) / r.height : (n.left + n.width / 2 - r.left) / r.width;
        li.classList.toggle('is-lit', p > 0 && p >= at);
      });
    }

    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = (vh - r.top) / (vh + r.height); // 0 entering at the bottom, 1 leaving at the top
      el.style.setProperty('--shift', `${((0.5 - p) * 70).toFixed(1)}px`);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // Pointer effects: mouse and trackpad only
  if (motion && finePointer) {
    // Buttons lean toward the cursor
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.25}px`);
        el.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.35}px`);
      });
      el.addEventListener('pointerleave', () => {
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
      });
    });

    // Soft glow that follows the cursor
    document.querySelectorAll('[data-spotlight]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sx', `${e.clientX - r.left}px`);
        el.style.setProperty('--sy', `${e.clientY - r.top}px`);
        el.style.setProperty('--so', '1');
      });
      el.addEventListener('pointerleave', () => el.style.setProperty('--so', '0'));
    });

    // Hero emblem layers drift at different depths
    if (hero && heroArt) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        heroArt.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        heroArt.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => {
        heroArt.style.setProperty('--px', '0');
        heroArt.style.setProperty('--py', '0');
      });
    }

    // "View case" bubble that trails the cursor over [data-cursor] elements
    const cursorTargets = document.querySelectorAll('[data-cursor]');
    if (cursorTargets.length) {
      document.documentElement.classList.add('has-cursor');
      const cursor = document.createElement('div');
      const label = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.append(label);
      document.body.append(cursor);
      let tx = 0;
      let ty = 0;
      let cx = 0;
      let cy = 0;
      let raf = 0;
      const follow = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(follow) : 0;
      };
      window.addEventListener(
        'pointermove',
        (e) => {
          tx = e.clientX;
          ty = e.clientY;
          if (!cursor.classList.contains('is-on')) {
            cx = tx;
            cy = ty;
          }
          if (!raf) raf = requestAnimationFrame(follow);
        },
        { passive: true },
      );
      cursorTargets.forEach((el) => {
        el.addEventListener('pointerenter', () => {
          label.textContent = el.dataset.cursor;
          cursor.classList.add('is-on');
        });
        el.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
      });
    }
  }

  // Contact form: submit without a page reload when JS is available
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const statusEl = form.querySelector('[data-form-status]');
  const submit = form.querySelector('[data-submit]');
  const submitLabel = submit.querySelector('span') || submit;

  const showStatus = (kind, html) => {
    statusEl.innerHTML = '';
    const p = document.createElement('p');
    p.className = kind;
    p.textContent = html;
    statusEl.appendChild(p);
  };

  const setFieldError = (name, message) => {
    const input = form.elements[name];
    if (!input) return;
    const field = input.closest('.field');
    const errEl = field.querySelector('.field-error');
    field.classList.toggle('has-error', Boolean(message));
    if (errEl) errEl.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    ['name', 'email', 'message'].forEach((n) => setFieldError(n, ''));
    submit.disabled = true;
    const original = submitLabel.textContent;
    submitLabel.textContent = 'Sending…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        form.reset();
        showStatus('ok', "Thanks — your message is in. We'll be in touch within one working day.");
      } else if (data.errors) {
        Object.entries(data.errors).forEach(([k, v]) => setFieldError(k, v));
        showStatus('err', 'Please check the highlighted fields.');
        const first = Object.keys(data.errors)[0];
        form.elements[first]?.focus();
      } else {
        showStatus('err', data.message || "Sorry, that didn't send. Please email us directly.");
      }
    } catch {
      showStatus('err', "Sorry, that didn't send. Please email us directly.");
    } finally {
      submit.disabled = false;
      submitLabel.textContent = original;
    }
  });
});
