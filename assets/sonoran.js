/* Sonoran Vows, shared JS (vanilla, dependency-free). Safe to include once per page. */
(function () {
  if (window.__sv) return; window.__sv = 1;
  var C = window.SV_CONFIG || {};
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function $(s, r) { return (r || document).querySelector(s); }
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function init() {
    $$('.sv').forEach(function (r) { r.classList.add('js'); });

    /* images: tasteful placeholder if a photo cannot load */
    $$('.sv .ph img').forEach(function (im) {
      function fb() { im.parentNode.classList.add('fb'); }
      if (im.complete && im.naturalWidth === 0 && im.currentSrc) fb();
      im.addEventListener('error', fb);
    });

    /* header */
    var hdr = $('#hdr');
    function sc() { if (hdr) hdr.classList.toggle('scr', window.scrollY > 40); }
    sc(); window.addEventListener('scroll', sc, { passive: true });
    $$('.sv .dd').forEach(function (b) {
      var m = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function (ev) { ev.stopPropagation(); var o = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', o); m.classList.toggle('open', o); });
      document.addEventListener('click', function () { b.setAttribute('aria-expanded', 'false'); m.classList.remove('open'); });
      document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { b.setAttribute('aria-expanded', 'false'); m.classList.remove('open'); } });
    });
    var bg = $('.sv .burger'), dr = $('#drawer');
    if (bg && dr) {
      function setD(o) { bg.setAttribute('aria-expanded', o); bg.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); dr.classList.toggle('open', o); hdr && hdr.classList.toggle('menu-open', o); document.documentElement.style.overflow = o ? 'hidden' : ''; }
      bg.addEventListener('click', function () { setD(bg.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && dr.classList.contains('open')) { setD(false); bg.focus(); } });
      $$('a', dr).forEach(function (a) { a.addEventListener('click', function () { setD(false); }); });
    }

    /* reveals, fade, photo masks, drawn lines, botanicals */
    var T = $$('.sv [data-rv], .sv [data-draw], .sv .exp');
    if ('IntersectionObserver' in window && !RM) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: .1 });
      T.forEach(function (t) { io.observe(t); });
    } else T.forEach(function (t) { t.classList.add('in'); });

    /* services index, hovering a row changes the featured photograph */
    $$('[data-svx]').forEach(function (w) {
      var rows = $$('.svr', w), ims = $$('.svx-media .ph', w), tag = $('.svx-media .tagline', w);
      function on(i) { rows.forEach(function (r, k) { r.classList.toggle('on', k === i); }); ims.forEach(function (m, k) { m.classList.toggle('on', k === i); }); if (tag) tag.textContent = rows[i].getAttribute('data-s'); }
      rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { on(i); }); r.addEventListener('focus', function () { on(i); }); });
      on(0);
    });

    /* WEDDING STYLE EXPLORER */
    $$('[data-sx]').forEach(function (sx) {
      var tabs = $$('[role=tab]', sx), panes = $$('[role=tabpanel]', sx), mains = $$('.sx-main .ph', sx), cur = 0;
      function go(i, f) {
        i = (i + tabs.length) % tabs.length; cur = i;
        tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
        panes.forEach(function (p, k) { p.hidden = k !== i; });
        mains.forEach(function (m, k) { m.classList.toggle('on', k === i); });
        sx.style.setProperty('--tint', tabs[i].getAttribute('data-tint'));
        if (f) tabs[i].focus();
      }
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () { go(k); });
        t.addEventListener('keydown', function (ev) { var m = { ArrowRight: 1, ArrowLeft: -1 }[ev.key]; if (m) { ev.preventDefault(); go(cur + m, true); } });
      });
      $$('[data-save-style]', sx).forEach(function (b) {
        b.addEventListener('click', function () {
          var name = b.getAttribute('data-save-style'), ok = store.set('sv_style', { name: name, palette: b.getAttribute('data-pal') });
          var msg = b.parentNode.querySelector('.saved-msg');
          msg.textContent = ok ? name + ' is saved. It will be added to your wedding inquiry.' : 'Your browser blocked saving; you can choose this style in the inquiry form.';
        });
      });
      var saved = store.get('sv_style');
      var start = 0; if (saved) tabs.forEach(function (t, k) { if (t.getAttribute('data-name') === saved.name) start = k; });
      go(start);
    });

    /* MOODBOARD STUDIO */
    $$('[data-mb]').forEach(function (mb) {
      var st = store.get('sv_board') || { atmos: 'sunset', pal: '', imgs: [] };
      var list = $('[data-saved-list]', mb), sA = $('[data-sum-atmos]', mb), sP = $('[data-sum-pal]', mb), cnt = $('[data-count]', mb);
      function render() {
        $$('input[name=mb_atmos]', mb).forEach(function (r) { r.checked = r.value === st.atmos; });
        $$('input[name=mb_pal]', mb).forEach(function (r) { r.checked = r.value === st.pal; });
        $$('[data-group]', mb).forEach(function (g) { g.hidden = g.getAttribute('data-group') !== st.atmos; });
        $$('.heart', mb).forEach(function (h) { var on = st.imgs.some(function (x) { return x.k === h.getAttribute('data-k'); }); h.setAttribute('aria-pressed', on); h.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + h.getAttribute('data-alt') + (on ? ' from' : ' to') + ' your board'); });
        var aL = $('input[name=mb_atmos]:checked', mb), pL = $('input[name=mb_pal]:checked', mb);
        sA.textContent = aL ? aL.getAttribute('data-label') : 'none'; sP.textContent = pL ? pL.getAttribute('data-label') : 'not chosen yet';
        cnt.textContent = st.imgs.length;
        list.innerHTML = st.imgs.length ? '' : '<p class="mb-empty">Tap the heart on any image to save it here.</p>';
        st.imgs.forEach(function (x) { var f = document.createElement('figure'); f.className = 'ph'; var im = new Image(); im.src = x.src; im.alt = x.alt; im.onerror = function () { f.classList.add('fb'); }; f.setAttribute('data-cap', x.alt); f.appendChild(im); list.appendChild(f); });
        st.atmosLabel = aL ? aL.getAttribute('data-label') : ''; st.palLabel = pL ? pL.getAttribute('data-label') : '';
        store.set('sv_board', st);
      }
      $$('input[name=mb_atmos]', mb).forEach(function (r) { r.addEventListener('change', function () { st.atmos = r.value; render(); }); });
      $$('input[name=mb_pal]', mb).forEach(function (r) { r.addEventListener('change', function () { st.pal = r.value; render(); }); });
      $$('.heart', mb).forEach(function (h) {
        h.addEventListener('click', function () {
          var k = h.getAttribute('data-k'), i = -1;
          st.imgs.forEach(function (x, n) { if (x.k === k) i = n; });
          if (i > -1) st.imgs.splice(i, 1); else st.imgs.push({ k: k, src: h.getAttribute('data-src'), alt: h.getAttribute('data-alt') });
          render();
        });
      });
      var cl = $('.clear', mb); cl && cl.addEventListener('click', function () { st = { atmos: st.atmos, pal: '', imgs: [] }; render(); });
      render();
    });

    /* GALLERY filters + lightbox */
    $$('[data-gal]').forEach(function (g) {
      var bs = $$('.gchips button', g), it = $$('.gi', g), lb = $('dialog', g);
      bs.forEach(function (b) {
        b.addEventListener('click', function () {
          var c = b.getAttribute('data-c');
          bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          it.forEach(function (i) {
            var show = c === 'all' || (' ' + i.getAttribute('data-c') + ' ').indexOf(' ' + c + ' ') > -1;
            if (show) { i.hidden = false; requestAnimationFrame(function () { i.classList.remove('out'); }); }
            else { i.classList.add('out'); setTimeout(function () { if (i.classList.contains('out')) i.hidden = true; }, RM ? 0 : 450); }
          });
        });
      });
      if (lb && lb.showModal) {
        var li = $('img', lb), lp = $('p', lb), last;
        it.forEach(function (i) { i.addEventListener('click', function () { var im = $('img', i); last = i; li.src = im.currentSrc || im.src; li.alt = im.alt; lp.textContent = i.getAttribute('data-t') + ', editorial inspiration'; lb.showModal(); }); });
        $('.x', lb).addEventListener('click', function () { lb.close(); });
        lb.addEventListener('click', function (ev) { if (ev.target === lb) lb.close(); });
        lb.addEventListener('close', function () { last && last.focus(); });
      }
    });

    /* FORMS, validation, steps, saved inspiration, draft persistence, honest submission */
    $$('.sv form.vf').forEach(function (f) {
      var steps = $$('.step', f), nav = $$('.snav li', f), meter = $('.fmeter i', f), st = 0, stat = $('.fstat', f);
      var bN = $('[data-next]', f), bP = $('[data-prev]', f), bS = $('[type=submit]', f), KEY = 'sv_inq_' + f.getAttribute('data-form');
      function req(scope) { return $$('input[required],select[required],textarea[required],[data-multi-req]', scope); }
      function filled(el) {
        if (el.hasAttribute('data-multi-req')) return !!$('input:checked', el);
        if (el.type === 'radio') return !!$('input[name="' + el.name + '"]:checked', f);
        if (el.type === 'checkbox') return el.checked;
        if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value.trim());
        return el.value.trim() !== '';
      }
      function ok(el) { var box = el.hasAttribute('data-multi-req') ? el : el.closest('.f'); var g = filled(el); if (box) box.classList.toggle('bad', !g); $$('input,select,textarea', box || f).forEach(function (x) { if (x.type !== 'hidden') x.setAttribute('aria-invalid', !g); }); return g; }
      function check(scope) {
        var bad = req(scope).filter(function (el) { return !ok(el); });
        if (bad.length) { var t = bad[0].matches('[data-multi-req]') ? $('input', bad[0]) : bad[0]; t.focus(); stat.textContent = 'Please check the highlighted fields.'; stat.className = 'fstat bad'; return false; }
        stat.textContent = ''; stat.className = 'fstat'; return true;
      }
      function progress() { if (!meter) return; var a = req(f), d = a.filter(filled); meter.style.width = (a.length ? d.length / a.length * 100 : 0) + '%'; }
      function save() {
        if (!f.hasAttribute('data-persist')) return; var o = {};
        $$('input,select,textarea', f).forEach(function (el) {
          if (!el.name || el.type === 'hidden' || el.name === 'website_url' || el.name === 'privacy_consent') return;
          if (el.type === 'radio' || el.type === 'checkbox') { if (el.checked) (o[el.name] = o[el.name] || []).push(el.value); }
          else o[el.name] = el.value;
        });
        store.set(KEY, o);
      }
      function restore() {
        var o = store.get(KEY); if (!o) return;
        $$('input,select,textarea', f).forEach(function (el) {
          if (!(el.name in o)) return;
          if (el.type === 'radio' || el.type === 'checkbox') el.checked = o[el.name].indexOf(el.value) > -1;
          else if (el.type !== 'hidden') el.value = o[el.name];
        });
      }
      restore();
      /* saved inspiration from the Style Explorer and Moodboard Studio */
      var sty = store.get('sv_style'), bd = store.get('sv_board'), box = $('[data-saved]', f);
      if (box && (sty || (bd && (bd.imgs && bd.imgs.length || bd.pal)))) {
        var h = '<b>Your saved inspiration</b>';
        if (sty) { h += 'Wedding style: ' + sty.name + '. '; var s1 = $('[name=wedding_style]', f); if (s1 && !s1.value) s1.value = sty.name; $('[name=saved_style]', f).value = sty.name; }
        if (bd) {
          var parts = []; if (bd.atmosLabel) parts.push('atmosphere: ' + bd.atmosLabel); if (bd.palLabel) parts.push('palette: ' + bd.palLabel); if (bd.imgs && bd.imgs.length) parts.push(bd.imgs.length + ' saved image' + (bd.imgs.length > 1 ? 's' : '') + ' (' + bd.imgs.map(function (x) { return x.alt; }).join('; ') + ')');
          if (parts.length) { h += 'Moodboard, ' + parts.join(', ') + '.'; $('[name=saved_moodboard]', f).value = parts.join(' | '); }
          var s2 = $('[name=color_palette]', f); if (s2 && !s2.value && bd.palLabel) s2.value = bd.palLabel;
        }
        box.innerHTML = h + ' <span class="hint">These will be included with your inquiry.</span>'; box.hidden = false;
      }
      $$('input,select,textarea', f).forEach(function (el) { el.addEventListener(el.matches('select,[type=radio],[type=checkbox]') ? 'change' : 'input', function () { var b = el.closest('.f'); if (b && b.classList.contains('bad')) ok(b.matches('[data-multi-req]') ? b : el); progress(); save(); }); });
      function show(i) {
        st = i; steps.forEach(function (s, k) { s.hidden = k !== i; });
        nav.forEach(function (n, k) { n.classList.toggle('on', k === i); n.classList.toggle('done', k < i); });
        if (bP) bP.hidden = i === 0; if (bN) bN.hidden = i === steps.length - 1; if (bS) bS.hidden = i !== steps.length - 1;
        var lg = $('legend.sl', steps[i]); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus({ preventScroll: true }); }
        if (f.getBoundingClientRect().top < 0) f.scrollIntoView({ behavior: RM ? 'auto' : 'smooth', block: 'start' });
      }
      if (steps.length) { show(0); bN.addEventListener('click', function () { if (check(steps[st])) show(st + 1); }); bP.addEventListener('click', function () { show(st - 1); }); }
      progress();
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (steps.length && !check(steps[st])) return;
        if (!check(f)) return;
        if ($('[name=website_url]', f).value) return;
        var ep = (C.formEndpoint || '').trim();
        /* No backend by choice: show the thank-you state; nothing is sent or stored. */
        if (!ep) { f.classList.add('sent'); store.del(KEY); var dn = $('.fdone', f); dn && dn.focus(); return; }
        var fd = new FormData(f); fd.append('form_name', f.getAttribute('data-form')); fd.append('page', location.href);
        stat.textContent = 'Sending…'; stat.className = 'fstat'; if (bS) bS.disabled = true;
        fetch(ep, { method: 'POST', body: fd }).then(function (r) {
          if (!r.ok) throw new Error(r.status);
          f.classList.add('sent'); store.del(KEY); var d = $('.fdone', f); d && d.focus();
        }).catch(function () { stat.textContent = 'Something went wrong and your inquiry was not sent. Please try again in a moment.'; stat.className = 'fstat bad'; })
          .then(function () { if (bS) bS.disabled = false; });
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
