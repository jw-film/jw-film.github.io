/* JW FILM — content.json → 페이지 렌더러 (공개 사이트 + 관리자 미리보기 공용) */
(function () {
  const ICON = {
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    yt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none"/></svg>',
    kakao: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 3.5c-5.2 0-9.4 3.2-9.4 7.2 0 2.5 1.7 4.7 4.2 6l-1 3.7c-.1.3.2.5.5.3l4.3-2.8c.5.1 1 .1 1.4.1 5.2 0 9.4-3.2 9.4-7.3S17.2 3.5 12 3.5z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>'
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s) => esc(s).replace(/\n/g, '<br>');
  const bold = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // http(s) 주소만 허용 (javascript: 등 차단)
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '#');
  const ext = 'target="_blank" rel="noopener noreferrer"';

  function ytId(url) {
    const m = String(url || '').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  // [글자](kakao) [글자](youtube) [글자](https://...) 형식의 간단 링크
  function richText(text, links) {
    return esc(text).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, target) => {
      const url = target === 'kakao' ? links.kakao : target === 'youtube' ? links.youtube : target;
      const u = safeUrl(url);
      return u === '#' ? label : `<a href="${esc(u)}" ${ext}>${label}</a>`;
    });
  }

  function render(d) {
    const L = d.links || {};
    const S = d.site || {};
    const H = d.hero || {};
    const A = d.about || {};
    const W = d.work || {};
    const F = d.fields || {};
    const G = d.gear || {};
    const C = d.contact || {};
    const works = (W.items || []).filter((w) => ytId(w.url));
    const cats = [...new Set(works.map((w) => (w.category || '').trim()).filter(Boolean))];
    const year = new Date().getFullYear();

    const header = `
<header class="topbar"><div class="topinner">
  <a class="brand" href="#top" aria-label="${esc(S.brand)} 맨 위로"><span class="brand-mark">JW</span>${esc(S.brand)}</a>
  <nav class="socials" aria-label="바로가기">
    <a class="social insta" href="${esc(safeUrl(L.instaMain))}" ${ext} aria-label="${esc(L.instaMainLabel)}">${ICON.insta}<span class="label">Instagram</span></a>
    <a class="social yt" href="${esc(safeUrl(L.youtube))}" ${ext} aria-label="YouTube">${ICON.yt}<span class="label">YouTube</span></a>
    <a class="social kakao" href="${esc(safeUrl(L.kakao))}" ${ext} aria-label="카카오톡 문의">${ICON.kakao}<span class="label">카톡 문의</span></a>
  </nav>
</div></header>`;

    const hero = `
<section class="hero"><div class="hero-inner">
  <div class="eyebrow"><span class="dot"></span>${esc(H.eyebrow)}</div>
  <h1><span class="line">${esc(H.line1)}</span><span class="line grad">${esc(H.line2)}</span></h1>
  <p class="hero-copy">${esc(H.copy)}</p>
  <div class="hero-actions">
    <a class="btn kakao" href="${esc(safeUrl(L.kakao))}" ${ext}>${ICON.kakao}카카오톡으로 촬영 문의</a>
    <a class="btn ghost" href="#work">작업 보기</a>
  </div>
</div></section>`;

    const about = `
<section class="wrap reveal" id="about">
  <div class="section-head"><div class="kicker">01 / ABOUT</div><h2 class="h2">${br(A.title)}</h2></div>
  <div class="about">
    <div>${(A.statements || []).map((t) => `<p class="statement">${bold(t)}</p>`).join('')}</div>
    <div class="facts">
      <div class="fact"><div class="n">FOCUS</div><div class="v">${esc(A.focus)}</div></div>
      <div class="fact"><div class="n">BRAND</div><div class="v">${esc(S.brand)}</div></div>
      <div class="fact wide"><div class="n">FIELD</div><div class="v">${esc(A.field)}</div></div>
    </div>
  </div>
</section>`;

    const chips = cats.length > 1
      ? `<div class="chips" role="tablist" aria-label="작업 분류"><button class="chip on" data-cat="" type="button">전체</button>${cats.map((c) => `<button class="chip" data-cat="${esc(c)}" type="button">${esc(c)}</button>`).join('')}</div>`
      : '';
    const cards = works.map((w) => {
      const id = ytId(w.url);
      return `<button class="vcard" type="button" data-id="${id}" data-cat="${esc((w.category || '').trim())}" aria-label="${esc(w.title)} 영상 재생">
  <span class="vthumb"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span class="vplay">${ICON.play}</span></span>
  <span class="vmeta">${w.category ? `<span class="vcat">${esc(w.category)}</span>` : ''}<span class="vtitle">${esc(w.title || '제목 없음')}</span>${w.desc ? `<span class="vdesc">${esc(w.desc)}</span>` : ''}</span>
</button>`;
    }).join('');
    const worksBlock = works.length ? `${chips}<div class="vgrid" id="vgrid">${cards}</div>` : '';

    const work = `
<section class="work" id="work"><div class="wrap reveal">
  <div class="section-head"><div class="kicker">02 / WORK</div><h2 class="h2">${br(W.title)}</h2><p class="lead">${esc(W.lead)}</p></div>
  ${worksBlock}
  <div class="archive">
    <a class="feature" href="${esc(safeUrl(L.youtube))}" ${ext}>
      <img src="${esc(W.featureImage || 'assets/thumb.jpg')}" width="800" height="449" alt="직접 촬영한 공연 영상의 한 장면" decoding="async">
      <div class="feature-body"><span class="tag">WORK ARCHIVE</span><h3>${br(W.featureTitle)}</h3><p>${esc(W.featureDesc)}</p><span class="cta-line">전체 작업 보기 ${ICON.arrow}</span></div>
    </a>
    <div class="sidecards">
      <a class="sidecard yt" href="${esc(safeUrl(L.youtube))}" ${ext}>
        <span class="ic">${ICON.yt}</span><div><h3>YouTube 채널</h3><p>촬영 작업 영상</p></div><span class="go">채널 바로가기 ${ICON.arrow}</span>
      </a>
      <div class="sidecard insta"><span class="ic">${ICON.insta}</span>
        <div class="accts">
          <a class="acct" href="${esc(safeUrl(L.instaMain))}" ${ext}><span class="acct-label">${esc(L.instaMainLabel)}</span><span class="acct-handle">${esc(L.instaMainHandle)}</span></a>
          <a class="acct" href="${esc(safeUrl(L.instaDir))}" ${ext}><span class="acct-label">${esc(L.instaDirLabel)}</span><span class="acct-handle">${esc(L.instaDirHandle)}</span></a>
        </div>
      </div>
    </div>
  </div>
</div></section>`;

    const fields = `
<section class="wrap reveal" id="field">
  <div class="section-head"><div class="kicker">03 / FIELD</div><h2 class="h2">${br(F.title)}</h2><p class="lead">${esc(F.lead)}</p></div>
  <div class="fields">${(F.items || []).map((it, i) => `<article class="field"><div class="num">${String(i + 1).padStart(2, '0')}</div><div><h3>${esc(it.title)}</h3><p>${esc(it.desc)}</p></div></article>`).join('')}</div>
</section>`;

    const gear = `
<section class="gear" id="gear"><div class="wrap reveal">
  <div class="section-head"><div class="kicker">04 / GEAR</div><h2 class="h2">${br(G.title)}</h2><p class="lead">${esc(G.lead)}</p></div>
  <div class="geargrid">${(G.groups || []).map((g) => `<div class="gearcard"><div class="gearcat">${esc(g.category)}</div><ul>${(g.items || []).map((it) => `<li><strong>${esc(it.name)}</strong>${it.note ? `<span>${esc(it.note)}</span>` : ''}</li>`).join('')}</ul></div>`).join('')}</div>
</div></section>`;

    const faq = `
<section class="wrap reveal" id="faq">
  <div class="section-head"><div class="kicker">05 / FAQ</div><h2 class="h2">자주 묻는 질문</h2></div>
  <div class="faq">${(d.faq || []).map((f) => `<details><summary>${esc(f.q)}<span class="tog" aria-hidden="true"></span></summary><div class="answer">${richText(f.a, L)}</div></details>`).join('')}</div>
</section>`;

    const contact = `
<section class="contact" id="contact"><div class="wrap reveal">
  <div class="kicker">06 / CONTACT</div>
  <h2 class="h2">${br(C.title)}</h2>
  <p>${esc(C.lead)}</p>
  <div class="contact-actions">
    <a class="btn kakao big" href="${esc(safeUrl(L.kakao))}" ${ext}>${ICON.kakao}카카오톡 문의</a>
    <div class="contact-sub">
      <a class="btn insta stack" href="${esc(safeUrl(L.instaMain))}" ${ext}>${ICON.insta}<span class="btn-col"><small>${esc(L.instaMainLabel)}</small><b>${esc(L.instaMainHandle)}</b></span></a>
      <a class="btn ghost stack" href="${esc(safeUrl(L.instaDir))}" ${ext}>${ICON.insta}<span class="btn-col"><small>${esc(L.instaDirLabel)}</small><b>${esc(L.instaDirHandle)}</b></span></a>
      <a class="btn yt stack" href="${esc(safeUrl(L.youtube))}" ${ext}>${ICON.yt}<span class="btn-col"><small>작업 아카이브</small><b>YouTube</b></span></a>
    </div>
  </div>
</div></section>`;

    const footer = `
<footer class="footer"><div class="footer-inner">
  <div>© ${year} ${esc(S.brand)} · ${esc(S.legalName)}</div>
  ${S.bizNo ? `<div>사업자등록번호 ${esc(S.bizNo)}</div>` : ''}
</div></footer>`;

    return header + `<main id="top">${hero}${about}${work}${fields}${gear}${faq}${contact}</main>` + footer;
  }

  function mount(d, root) {
    root.innerHTML = render(d);
    wire(root);
  }

  function wire(root) {
    // 영상 필터
    const chips = root.querySelectorAll('.chip');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.toggle('on', c === chip));
      const cat = chip.dataset.cat;
      root.querySelectorAll('.vcard').forEach((v) => { v.hidden = !!cat && v.dataset.cat !== cat; });
    }));
    // 영상 라이트박스
    root.querySelectorAll('.vcard').forEach((v) => v.addEventListener('click', () => openBox(v.dataset.id, v)));
    // 스크롤 등장
    const els = root.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in'));
    } else {
      const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
      els.forEach((e) => io.observe(e));
    }
  }

  let box, lastFocus;
  function openBox(id, from) {
    lastFocus = from;
    if (!box) {
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', '영상 재생');
      box.innerHTML = '<button class="lb-close" type="button" aria-label="닫기">×</button><div class="lb-frame"></div>';
      document.body.appendChild(box);
      box.addEventListener('click', (e) => { if (e.target === box || e.target.classList.contains('lb-close')) closeBox(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('open')) closeBox(); });
    }
    box.querySelector('.lb-frame').innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="영상 재생" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    box.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    box.querySelector('.lb-close').focus();
  }
  function closeBox() {
    box.classList.remove('open');
    box.querySelector('.lb-frame').innerHTML = '';
    document.documentElement.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  window.JWRender = { render, mount, ytId };
})();
