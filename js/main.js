(function () {
  'use strict';

  // ===== Mobile nav =====
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.classList.toggle('active');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
        toggle.classList.remove('active');
      });
    });
  }

  // ===== Nav scroll state =====
  var nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ===== Scroll reveal =====
  var reveals = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
  }

  // ===== Animated counters =====
  var counters = document.querySelectorAll('.counter');
  if (counters.length && 'IntersectionObserver' in window) {
    var counted = false;
    var cObserver = new IntersectionObserver(function (entries) {
      if (counted) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          counted = true;
          counters.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            var duration = 1500;
            var startTime = null;
            function step(ts) {
              if (!startTime) startTime = ts;
              var progress = Math.min((ts - startTime) / duration, 1);
              var eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target);
              if (progress < 1) requestAnimationFrame(step);
              else el.textContent = target;
            }
            requestAnimationFrame(step);
          });
        }
      });
    }, { threshold: 0.5 });
    cObserver.observe(counters[0].closest('.hero-stats'));
  }

  // ===== Highlight today in hours =====
  var today = new Date().getDay();
  document.querySelectorAll('.hours-row').forEach(function (row) {
    if (parseInt(row.getAttribute('data-today'), 10) === today) {
      row.classList.add('is-today');
    }
  });

  // ===== Year in footer =====
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ===== Language switching =====
  var currentLang = 'nl';
  var langBtn = document.getElementById('lang-toggle');
  var flags = langBtn ? langBtn.querySelectorAll('.lang-flag') : [];

  function setLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('[data-nl][data-en]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
    });
    document.querySelectorAll('[data-placeholder-nl][data-placeholder-en]').forEach(function (el) {
      el.placeholder = el.getAttribute('data-placeholder-' + lang);
    });
    document.querySelectorAll('select option[data-nl][data-en]').forEach(function (opt) {
      opt.textContent = opt.getAttribute('data-' + lang);
    });
    flags.forEach(function (f) {
      f.classList.toggle('active', f.getAttribute('data-active') === lang);
    });
    try { localStorage.setItem('fz-lang', lang); } catch (e) {}
  }

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      setLang(currentLang === 'nl' ? 'en' : 'nl');
    });
  }
  try {
    var saved = localStorage.getItem('fz-lang');
    if (saved === 'en') setLang('en');
  } catch (e) {}

  // ===== Input sanitization =====
  function sanitize(str) {
    if (!str) return '';
    return str.replace(/[<>"'&]/g, function (c) {
      return { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c];
    }).trim();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    if (!phone) return true;
    return /^[\d\s\-+().]{6,20}$/.test(phone);
  }

  // ===== Rate limiting =====
  var lastSubmitTime = 0;
  var RATE_LIMIT_MS = 15000;

  // ===== Reservation form =====
  var resForm = document.getElementById('reservation-form');
  var resStatus = document.getElementById('res-status');
  var dateInput = document.getElementById('res-date');
  var honeypot = document.getElementById('res-hp');

  if (dateInput) {
    var now = new Date();
    var yyyy = now.getFullYear();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    dateInput.min = yyyy + '-' + mm + '-' + dd;
  }

  if (resForm) {
    resForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      if (honeypot && honeypot.value) return;

      // Rate limiting
      var nowMs = Date.now();
      if (nowMs - lastSubmitTime < RATE_LIMIT_MS) {
        showStatus(currentLang === 'nl'
          ? 'Even geduld. Probeer het over een paar seconden opnieuw.'
          : 'Please wait a moment before submitting again.', 'error');
        return;
      }

      var fd = new FormData(resForm);
      var data = {};
      fd.forEach(function (val, key) {
        if (key !== 'website') data[key] = sanitize(val);
      });

      // Validation
      if (!data.name || data.name.length < 2) {
        showStatus(currentLang === 'nl' ? 'Vul een geldige naam in (minimaal 2 tekens).' : 'Please enter a valid name (at least 2 characters).', 'error');
        return;
      }
      if (data.name.length > 100) {
        showStatus(currentLang === 'nl' ? 'Naam is te lang (max 100 tekens).' : 'Name is too long (max 100 characters).', 'error');
        return;
      }
      if (!data.email || !isValidEmail(data.email)) {
        showStatus(currentLang === 'nl' ? 'Vul een geldig e-mailadres in.' : 'Please enter a valid email address.', 'error');
        return;
      }
      if (!isValidPhone(data.phone)) {
        showStatus(currentLang === 'nl' ? 'Vul een geldig telefoonnummer in.' : 'Please enter a valid phone number.', 'error');
        return;
      }
      if (!data.date || !data.time) {
        showStatus(currentLang === 'nl' ? 'Vul datum en tijd in.' : 'Please fill in date and time.', 'error');
        return;
      }

      // Check date is not in the past
      var selectedDate = new Date(data.date + 'T' + data.time);
      if (selectedDate < new Date()) {
        showStatus(currentLang === 'nl' ? 'Kies een datum en tijd in de toekomst.' : 'Please choose a future date and time.', 'error');
        return;
      }

      // Limit notes length
      if (data.notes && data.notes.length > 500) {
        showStatus(currentLang === 'nl' ? 'Opmerkingen zijn te lang (max 500 tekens).' : 'Notes are too long (max 500 characters).', 'error');
        return;
      }

      lastSubmitTime = nowMs;

      var reservations = [];
      try { reservations = JSON.parse(localStorage.getItem('fz-reservations') || '[]'); } catch (e) {}

      // Limit total stored reservations to prevent storage abuse
      if (reservations.length >= 500) {
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        reservations = reservations.filter(function (r) {
          return new Date(r.createdAt) > cutoff;
        });
      }

      data.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      data.status = 'pending';
      data.createdAt = new Date().toISOString();
      reservations.push(data);
      try { localStorage.setItem('fz-reservations', JSON.stringify(reservations)); } catch (e) {}

      showStatus(currentLang === 'nl'
        ? 'Reservering ontvangen! We nemen snel contact op ter bevestiging.'
        : 'Reservation received! We\'ll contact you shortly to confirm.', 'success');
      resForm.reset();
      if (dateInput) dateInput.min = yyyy + '-' + mm + '-' + dd;
    });
  }

  function showStatus(msg, type) {
    if (!resStatus) return;
    resStatus.textContent = msg;
    resStatus.className = 'form-status ' + type;
    setTimeout(function () {
      resStatus.textContent = '';
      resStatus.className = 'form-status';
    }, 5000);
  }

  // ===== Particle background =====
  var canvas = document.getElementById('particles');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 50;
    var mouse = { x: -1000, y: -1000 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    for (var i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.05
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var glowSize = p.size;
        var glowOpacity = p.opacity;
        if (dist < 150) {
          glowSize = p.size + (1 - dist / 150) * 2;
          glowOpacity = p.opacity + (1 - dist / 150) * 0.3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,146,46,' + glowOpacity + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var d = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(201,146,46,' + (0.05 * (1 - d / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ===== Card tilt effect =====
  document.querySelectorAll('.glow-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / centerY * -4;
      var rotateY = (x - centerX) / centerX * 4;
      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // ===== Smooth anchor scroll =====
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id.length <= 1) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
