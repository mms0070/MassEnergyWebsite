/* ==========================================================================
   Mass Energy — site behaviour (vanilla JavaScript, no dependencies)
   --------------------------------------------------------------------------
   Everything here is progressive enhancement: the page is fully readable and
   navigable without it. Each feature is initialised independently so one
   failure cannot break the others.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ENQUIRY_EMAIL = 'sales@massenergy.pk'; // fallback; the form's data-email attribute is used when present

  /* ---------- Sticky header: subtle state change once the page scrolls ---------- */
  function initHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;
    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    var header = document.getElementById('site-header');
    if (!toggle || !nav || !header) return;

    var label = toggle.querySelector('.nav-toggle__label');
    var desktop = window.matchMedia('(min-width: 1200px)');
    var outside = [document.getElementById('main'), document.querySelector('.site-footer'), document.querySelector('.skip-link')];
    var isOpen = false;

    function setOpen(open, returnFocus) {
      isOpen = open;
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
      nav.classList.toggle('is-open', open);
      header.classList.toggle('menu-open', open);
      root.classList.toggle('menu-open', open);
      // Keep keyboard and screen reader focus inside the header while the menu covers the page
      outside.forEach(function (el) {
        if (!el) return;
        if (open) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
      if (open) {
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener('click', function () { setOpen(!isOpen, false); });

    nav.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (!isOpen || !link) return;
      setOpen(false, false);
      // The menu hides, so move focus to the destination section instead of losing it
      var target = link.hash ? document.getElementById(link.hash.slice(1)) : null;
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        window.setTimeout(function () { target.focus({ preventScroll: true }); }, 0);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (isOpen && (event.key === 'Escape' || event.key === 'Esc')) {
        event.preventDefault();
        setOpen(false, true);
      }
    });

    function onBreakpoint(event) {
      if (event.matches && isOpen) setOpen(false, false);
    }
    if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
    else if (desktop.addListener) desktop.addListener(onBreakpoint);
  }

  /* ---------- Highlight the navigation link for the section in view ---------- */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav__link'));
    var sections = new Map();

    links.forEach(function (link) {
      var id = (link.getAttribute('href') || '').slice(1);
      var section = id && document.getElementById(id);
      if (section) sections.set(section, link);
    });
    if (!sections.size) return;

    function setCurrent(activeLink) {
      links.forEach(function (link) {
        if (link === activeLink) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(sections.get(entry.target));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (_link, section) { observer.observe(section); });
  }

  /* ---------- Reveal content as it scrolls into view ---------- */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    function finish(el) {
      // Hand the element back to its normal styles (hover effects etc.) once revealed
      el.removeAttribute('data-reveal');
      el.classList.remove('is-visible');
    }

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      items.forEach(finish);
      return;
    }

    // Stagger elements that share a parent
    var counts = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      var index = counts.get(parent) || 0;
      counts.set(parent, index + 1);
      el.style.setProperty('--reveal-delay', Math.min(index, 6) * 90 + 'ms');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        observer.unobserve(el);
        el.classList.add('is-visible');
        var isTrack = el.getAttribute('data-reveal') === 'track';
        var delay = parseInt(el.style.getPropertyValue('--reveal-delay'), 10) || 0;
        window.setTimeout(function () { finish(el); }, (isTrack ? 2600 : 1000) + delay);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    items.forEach(function (el) { observer.observe(el); });
    root.classList.add('reveal-ready');

    // Never leave content hidden when printing
    window.addEventListener('beforeprint', function () { items.forEach(finish); });
  }

  /* ---------- FAQ accordion (WAI-ARIA accordion pattern) ---------- */
  function initAccordions() {
    Array.prototype.slice.call(document.querySelectorAll('.accordion')).forEach(function (accordion) {
      var triggers = Array.prototype.slice.call(accordion.querySelectorAll('.accordion__trigger'));

      function setExpanded(trigger, expanded) {
        trigger.setAttribute('aria-expanded', String(expanded));
        trigger.closest('.accordion__item').classList.toggle('is-open', expanded);
      }

      triggers.forEach(function (trigger, index) {
        setExpanded(trigger, index === 0); // first answer open by default

        trigger.addEventListener('click', function () {
          setExpanded(trigger, trigger.getAttribute('aria-expanded') !== 'true');
        });

        trigger.addEventListener('keydown', function (event) {
          var target = null;
          if (event.key === 'ArrowDown') target = triggers[(index + 1) % triggers.length];
          else if (event.key === 'ArrowUp') target = triggers[(index - 1 + triggers.length) % triggers.length];
          else if (event.key === 'Home') target = triggers[0];
          else if (event.key === 'End') target = triggers[triggers.length - 1];
          if (target) {
            event.preventDefault();
            target.focus();
          }
        });
      });

      accordion.classList.add('is-enhanced');
      // Enable height animation only after the initial state is painted
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () { accordion.classList.add('is-animated'); });
      });
    });
  }

  /* ---------- Enquiry form ----------
     No backend is configured, so the form prepares an email draft addressed to
     sales@massenergy.pk and never claims a message was sent. To use a form
     service instead, put its endpoint URL in the form's data-endpoint attribute
     (see README.md); success is then shown only after a confirmed response. */
  function initForm() {
    var form = document.getElementById('enquiry-form');
    if (!form) return;

    form.noValidate = true; // accessible custom validation replaces browser bubbles

    var formEmail = (form.getAttribute('data-email') || '').trim();
    if (formEmail.indexOf('@') !== -1) ENQUIRY_EMAIL = formEmail;
    var endpoint = (form.getAttribute('data-endpoint') || '').trim();
    var fields = {
      name: form.elements.namedItem('name'),
      contact: form.elements.namedItem('contact'),
      topic: form.elements.namedItem('topic'),
      message: form.elements.namedItem('message')
    };
    var trap = form.elements.namedItem('website');
    var statusEl = form.querySelector('[data-status]');
    var submitBtn = form.querySelector('[data-submit]');
    var submitLabel = form.querySelector('[data-submit-label]');
    var copyBtn = form.querySelector('[data-copy]');
    var modeNote = form.querySelector('[data-mode-note]');
    var fallback = form.querySelector('[data-fallback]');
    var fallbackText = fallback ? fallback.querySelector('textarea') : null;
    var counter = form.querySelector('[data-count-for="f-message"]');
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (endpoint) {
      submitLabel.textContent = 'Send Enquiry';
      if (modeNote) modeNote.textContent = 'Your enquiry will be sent to Mass Energy. A confirmation will appear here once it has been received.';
    } else if (copyBtn) {
      copyBtn.hidden = false;
    }

    /* Character counter */
    function updateCount() {
      if (counter) counter.textContent = fields.message.value.length + ' / ' + fields.message.maxLength;
    }
    fields.message.addEventListener('input', updateCount);
    updateCount();

    /* Validation */
    function errorFor(el) { return document.getElementById(el.id + '-error'); }

    function setError(el, message) {
      var errorEl = errorFor(el);
      var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (id) {
        return id && id !== errorEl.id;
      });
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
        el.setAttribute('aria-invalid', 'true');
        ids.push(errorEl.id);
      } else {
        errorEl.textContent = '';
        errorEl.hidden = true;
        el.removeAttribute('aria-invalid');
      }
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
      else el.removeAttribute('aria-describedby');
    }

    function validate(el) {
      var value = el.value.trim();
      var message = '';
      if (el === fields.name) {
        if (!value) message = 'Please enter your name.';
        else if (value.length < 2) message = 'Please enter at least 2 characters.';
      } else if (el === fields.contact) {
        if (!value) {
          message = 'Please enter a phone number or email address so we can reply.';
        } else if (value.indexOf('@') !== -1) {
          if (!EMAIL_PATTERN.test(value)) message = 'Please enter a valid email address, for example name@example.com.';
        } else {
          var digits = value.replace(/\D/g, '');
          if (!/^[+\d\s().-]+$/.test(value) || digits.length < 10 || digits.length > 15) {
            message = 'Please enter a valid phone number (10 to 15 digits) or an email address.';
          }
        }
      } else if (el === fields.topic) {
        if (!value) message = 'Please choose an enquiry type.';
      } else if (el === fields.message) {
        if (!value) message = 'Please enter a message.';
        else if (value.length < 10) message = 'Please add a little more detail (at least 10 characters).';
      }
      setError(el, message);
      return !message;
    }

    function validateAll() {
      var firstInvalid = null;
      Object.keys(fields).forEach(function (key) {
        if (!validate(fields[key]) && !firstInvalid) firstInvalid = fields[key];
      });
      return firstInvalid;
    }

    Object.keys(fields).forEach(function (key) {
      var el = fields[key];
      // Check format when leaving a field the visitor has filled in; re-check while correcting
      el.addEventListener('blur', function () { if (el.value.trim()) validate(el); });
      el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
      el.addEventListener('change', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
    });

    /* Messages */
    function values() {
      return {
        name: fields.name.value.trim(),
        contact: fields.contact.value.trim(),
        topic: fields.topic.value,
        message: fields.message.value.trim()
      };
    }

    function subjectLine(v) { return 'Website enquiry: ' + v.topic + ' (' + v.name + ')'; }

    function bodyText(v) {
      return [
        'Name: ' + v.name,
        'Phone or email: ' + v.contact,
        'Enquiry type: ' + v.topic,
        '',
        'Message:',
        v.message,
        '',
        '--',
        'Prepared with the enquiry form on www.massenergy.pk'
      ].join('\n');
    }

    function setStatus(parts, tone) {
      // parts: array of strings and {strong: '...'} objects; built with DOM methods (no HTML injection)
      statusEl.textContent = '';
      statusEl.setAttribute('data-tone', tone || 'info');
      parts.forEach(function (part) {
        if (typeof part === 'string') statusEl.appendChild(document.createTextNode(part));
        else {
          var strong = document.createElement('strong');
          strong.textContent = part.strong;
          statusEl.appendChild(strong);
        }
      });
    }

    function hideFallback() {
      if (fallback) fallback.hidden = true;
    }

    function showFallback(text) {
      if (!fallback || !fallbackText) return;
      fallbackText.value = text;
      fallback.hidden = false;
      fallbackText.focus();
      fallbackText.select();
    }

    function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
      }
      return Promise.resolve(legacyCopy(text));
    }

    function legacyCopy(text) {
      var active = document.activeElement;
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '0';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(area);
      if (active && active.focus) active.focus({ preventScroll: true });
      return ok;
    }

    function openEmailDraft(v) {
      var href = 'mailto:' + ENQUIRY_EMAIL +
        '?subject=' + encodeURIComponent(subjectLine(v)) +
        '&body=' + encodeURIComponent(bodyText(v));
      window.location.href = href;
      setStatus([
        'Your email app should now open with a draft addressed to ' + ENQUIRY_EMAIL + '. ',
        { strong: 'Your enquiry is not sent until you press Send in your email app.' },
        ' If nothing opened, use Copy Message and paste it into a new email.'
      ], 'info');
    }

    function sendToEndpoint() {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitLabel.textContent = 'Sending…';
      setStatus(['Sending your enquiry…'], 'info');

      return fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) throw new Error('Request failed with status ' + response.status);
        form.reset();
        updateCount();
        setStatus([{ strong: 'Thank you. ' }, 'Your enquiry has been received by Mass Energy.'], 'success');
      }).catch(function () {
        setStatus([
          'Sorry, your enquiry could not be sent. Please try again, or email ' + ENQUIRY_EMAIL + ' directly.'
        ], 'error');
        if (copyBtn) copyBtn.hidden = false;
      }).then(function () {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        submitLabel.textContent = 'Send Enquiry';
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      hideFallback();
      var firstInvalid = validateAll();
      if (firstInvalid) {
        setStatus(['Please check the highlighted fields and try again.'], 'error');
        firstInvalid.focus();
        return;
      }
      if (trap && trap.value) return; // likely an automated submission
      if (endpoint) sendToEndpoint();
      else openEmailDraft(values());
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        hideFallback();
        var firstInvalid = validateAll();
        if (firstInvalid) {
          setStatus(['Please complete the highlighted fields before copying your message.'], 'error');
          firstInvalid.focus();
          return;
        }
        var v = values();
        var text = 'To: ' + ENQUIRY_EMAIL + '\nSubject: ' + subjectLine(v) + '\n\n' + bodyText(v);
        copyText(text).then(function (ok) {
          if (ok) {
            setStatus([
              { strong: 'Message copied. ' },
              'Paste it into a new email to ' + ENQUIRY_EMAIL + ' and send it from your email account.'
            ], 'success');
          } else {
            setStatus([
              'Copying is not available in this browser. Your message is shown below: select it, copy it and paste it into an email to ' + ENQUIRY_EMAIL + '.'
            ], 'info');
            showFallback(text);
          }
        });
      });
    }

    /* "Ask about…" links in the Solutions section pre-select the enquiry type */
    Array.prototype.slice.call(document.querySelectorAll('[data-enquiry]')).forEach(function (link) {
      link.addEventListener('click', function () {
        var wanted = link.getAttribute('data-enquiry');
        var match = Array.prototype.some.call(fields.topic.options, function (option) { return option.value === wanted; });
        if (match) {
          fields.topic.value = wanted;
          if (fields.topic.getAttribute('aria-invalid') === 'true') validate(fields.topic);
        }
      });
    });
  }

  /* ---------- Solar + lithium energy-flow guide ----------
     Without JavaScript, all three states are listed and the diagram shows
     daytime. With it, toggle buttons switch the diagram and the caption. */
  function initEnergyFlow() {
    var widget = document.querySelector('[data-energy-flow]');
    if (!widget) return;
    var group = widget.querySelector('.energy-flow__modes');
    var buttons = Array.prototype.slice.call(widget.querySelectorAll('[data-flow-mode]'));
    var states = Array.prototype.slice.call(widget.querySelectorAll('[data-flow-state]'));
    var statesBox = widget.querySelector('[data-flow-states]');
    var visual = widget.querySelector('[data-flow-visual]');
    if (!group || !buttons.length || !visual) return;

    function animate() {
      if (reducedMotion.matches) return;
      visual.classList.remove('is-animating');
      void visual.getBoundingClientRect(); // restart the CSS animation
      visual.classList.add('is-animating');
    }

    function setMode(mode, withAnimation) {
      visual.setAttribute('data-mode', mode);
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-flow-mode') === mode));
      });
      states.forEach(function (state) {
        state.hidden = state.getAttribute('data-flow-state') !== mode;
      });
      if (withAnimation) animate();
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        setMode(button.getAttribute('data-flow-mode'), true);
      });
    });

    group.hidden = false;
    widget.classList.add('is-interactive');
    setMode('day', false);
    // Announce caption changes only after the initial state is set
    if (statesBox) statesBox.setAttribute('aria-live', 'polite');

    // Play the flow once when the diagram first scrolls into view
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          animate();
          observer.disconnect();
        }
      }, { threshold: 0.35 });
      observer.observe(visual);
    }
  }

  /* ---------- Current year in the footer ---------- */
  function initYear() {
    var year = String(new Date().getFullYear());
    Array.prototype.slice.call(document.querySelectorAll('[data-year]')).forEach(function (el) { el.textContent = year; });
  }

  /* ---------- Start ---------- */
  var navReady = true;
  [initHeader, initNav, initScrollSpy, initAccordions, initEnergyFlow, initForm, initYear, initReveal].forEach(function (init) {
    try {
      init();
    } catch (error) {
      if (init === initNav) navReady = false;
      if (window.console) console.error('Mass Energy: ' + init.name + ' failed', error);
    }
  });

  // Tell the inline guard in <head> that enhancement succeeded; otherwise it restores the no-JS layout
  if (navReady) window.massEnergyReady = true;
  else root.classList.remove('js');
})();
