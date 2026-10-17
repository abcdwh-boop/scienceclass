/* ======================================================================
   자동으로 책을 배치하고 클릭 이벤트를 연결합니다.
   ★ 책 이름, URL, 설명, 구역 이름은 library-data.js에서 수정하세요. ★
   ====================================================================== */
(() => {
  'use strict';
  const CFG = LIBRARY_DATA;
  const LAYOUT = LIBRARY_LAYOUT;
  // 포토샵처럼 조정해 확정한 책등 좌표를 우선 적용합니다.
  // 브라우저 임시 저장값(localStorage)은 사용하지 않습니다.
  const POSITIONS = window.BOOK_SLOT_OVERRIDES || {};
  const W = LAYOUT.imageWidth;
  const H = LAYOUT.imageHeight;
  const stage = document.getElementById('library-stage');
  const layer = document.getElementById('book-layer');
  const tooltip = document.getElementById('book-tooltip');
  const overlay = document.getElementById('book-overlay');
  const dialog = document.getElementById('open-book');
  const openLink = document.getElementById('dialog-open');
  const unassignedNote = document.getElementById('unassigned-note');
  const listBody = document.getElementById('book-list-body');
  let openTrigger = null;
  let pickedTimer = null;
  let allSlots = [];
  const sectionNames = Object.fromEntries(CFG.sections.map(s => [s.id,s.title]));

  // 사용자 데이터의 문자 내용은 textContent로 출력합니다 (HTML로 해석하지 않음).
  document.title = CFG.siteTitle;
  document.getElementById('site-title').textContent = CFG.siteTitle;
  document.getElementById('site-subtitle').textContent = CFG.siteSubtitle;
  for (const section of CFG.sections) {
    const label = document.getElementById('section-' + section.id);
    if (label) label.textContent = section.title;
  }

  function safeUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const url = new URL(raw, window.location.href);
      return ['http:','https:'].includes(url.protocol) ? url.href : null;
    } catch { return null; }
  }
  const pad = n => String(n).padStart(2,'0');
  const pct = (v, total) => (100 * v / total).toFixed(6) + '%';

  // 이미지 위 책마다 '이미지의 같은 부분'을 잘라 붙입니다.
  // 배경이 그대로 보이다가 hover할 때 해당 책 한 권만 딸깍 들립니다.
  function createSlot(section, row, position, x, y, w, h) {
    const id = `${section}-${row}-${pad(position)}`;
    const correction = POSITIONS[id];
    // 위치 수정 파일에 등록된 책은 보정된 좌표를 사용합니다.
    // 등록되지 않은 책은 원래 좌표를 그대로 사용합니다.
    if (correction && [correction.x, correction.y, correction.w, correction.h].every(Number.isFinite)
        && correction.w > 0 && correction.h > 0
        && correction.x >= 0 && correction.y >= 0
        && correction.x + correction.w <= W && correction.y + correction.h <= H) {
      ({ x, y, w, h } = correction);
    }
    const data = CFG.books[id] ?? null;
    const isRegistered = Boolean(data);
    const title = isRegistered ? (data.spineTitle || data.title || '제목 없음') : '';
    const fullTitle = isRegistered ? (data.title || data.spineTitle || '제목 없음') : '비어 있는 책';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'shelf-book' + (isRegistered ? '' : ' book-placeholder');
    btn.setAttribute('aria-label', `${sectionNames[section]} · ${fullTitle}${isRegistered ? '' : ' · 아직 등록되지 않음'} (${id})`);
    btn.dataset.slotId = id;
    btn.style.left = pct(x,W);
    btn.style.top = pct(y,H);
    btn.style.width = pct(w,W);
    btn.style.height = pct(h,H);
    // 스프라이트로 원본 이미지를 배경을 그대로 복제하여 상단 색/금박/스크래치를 유지합니다.
    btn.style.setProperty('--sprite-bg-width', (W / w * 100).toFixed(6) + '%');
    btn.style.setProperty('--sprite-bg-height', (H / h * 100).toFixed(6) + '%');
    btn.style.setProperty('--sprite-bg-x', (x / (W - w) * 100).toFixed(6) + '%');
    btn.style.setProperty('--sprite-bg-y', (y / (H - h) * 100).toFixed(6) + '%');
    const art = document.createElement('span');
    art.className = 'book-art';
    art.setAttribute('aria-hidden','true');
    if (title) {
      const text = document.createElement('span');
      text.className = 'book-spine-title';
      text.textContent = title;
      art.appendChild(text);
    }
    btn.appendChild(art);
    btn.addEventListener('mouseenter', () => showTip(btn, fullTitle, id));
    btn.addEventListener('mouseleave', hideTip);
    btn.addEventListener('focus', () => showTip(btn, fullTitle, id));
    btn.addEventListener('blur', hideTip);
    btn.addEventListener('click', () => {
      window.clearTimeout(pickedTimer);
      btn.classList.add('book-picked');
      openTrigger = btn;
      // 책을 꺼내는 움직임 이후 펼친 책이 나타납니다.
      pickedTimer = window.setTimeout(() => {
        btn.classList.remove('book-picked');
        openBook({id, section, row, data, title: fullTitle});
      }, 195);
    });
    layer.appendChild(btn);
    allSlots.push({id, section, row, data, title:fullTitle, element:btn});
  }

  const countByRow = {};
  for (const group of LAYOUT.rows) {
    const key = group.section + '-' + group.row;
    let running = countByRow[key] ?? 0;
    for (let i=0; i<group.edges.length-1; i++) {
      const x = group.edges[i];
      const next = group.edges[i+1];
      running += 1;
      createSlot(group.section,group.row,running,x,group.y,next-x,group.bottom-group.y);
    }
    countByRow[key] = running;
  }
  const filled = allSlots.filter(s => Boolean(s.data));
  document.getElementById('collection-count').textContent = `총 ${allSlots.length}권의 책 자리 · 등록된 책 ${filled.length}권`;
  const invalidIds = Object.keys(CFG.books).filter(id => !allSlots.some(s => s.id === id));
  if (invalidIds.length) console.warn('존재하지 않는 책 위치 번호:',invalidIds.join(', '));

  function showTip(el, text, id) {
    tooltip.textContent = `${text} · ${id}`;
    const centerX = el.offsetLeft + el.offsetWidth / 2;
    const top = el.offsetTop;
    tooltip.style.left = `clamp(11%, ${centerX / stage.clientWidth * 100}%, 89%)`;
    tooltip.style.top = Math.max(26, top - 3) / stage.clientHeight * 100 + '%';
    tooltip.classList.add('is-visible');
  }
  function hideTip() {tooltip.classList.remove('is-visible');}

  function openBook(slot) {
    const data = slot.data || {};
    const url = safeUrl(data.url);
    document.getElementById('dialog-section').textContent = sectionNames[slot.section] || slot.section;
    document.getElementById('dialog-book-title').textContent = data.title || '아직 이름 붙이지 않은 책';
    document.getElementById('dialog-book-description').textContent = data.description ||
      `이 자리에 새로운 자료를 꽂아 둘 수 있습니다.\n관리 파일(library-data.js)에서 ${slot.id} 위치에 책 제목, 설명, 링크를 등록해 보세요.`;
    document.getElementById('dialog-url').textContent = url || (data.url ? '올바른 http(s) 주소를 입력해 주세요.' : '아직 등록된 주소가 없습니다.');
    openLink.href = url || '#';
    openLink.classList.toggle('btn-disabled', !url);
    openLink.setAttribute('aria-disabled', String(!url));
    openLink.tabIndex = url ? 0 : -1;
    unassignedNote.hidden = Boolean(url);
    overlay.hidden = false;
    document.body.classList.add('book-is-open');
    hideTip();
    dialog.focus({preventScroll:true});
  }
  function closeBook() {
    overlay.hidden = true;
    document.body.classList.remove('book-is-open');
    if (openTrigger && document.contains(openTrigger)) openTrigger.focus({preventScroll:true});
  }
  document.getElementById('dialog-close').addEventListener('click',closeBook);
  document.getElementById('dialog-x').addEventListener('click',closeBook);
  document.getElementById('overlay-dim').addEventListener('click',closeBook);
  openLink.addEventListener('click', (event) => {if (openLink.getAttribute('aria-disabled') === 'true') event.preventDefault();});
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) {event.preventDefault();closeBook();}
    if (event.key !== 'Tab' || overlay.hidden) return;
    const focusables = [...dialog.querySelectorAll('button:not([disabled]),a[href]:not([aria-disabled="true"])')];
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {event.preventDefault();last.focus();}
    else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
  });

  // 목록보기: 스크롤/키보드/작은 화면에 대한 보조 접근 방법입니다.
  for (const section of CFG.sections) {
    const wrapper = document.createElement('div');
    wrapper.className = 'book-list-section';
    const h = document.createElement('h3');
    h.textContent = section.title;
    wrapper.appendChild(h);
    for (const slot of filled.filter(s => s.section === section.id)) {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'list-book';
      row.textContent = slot.title;
      const small = document.createElement('small');
      small.textContent = `선반 ${slot.row} · ${slot.id}`;
      row.appendChild(small);
      row.addEventListener('click', () => {
        openTrigger = row;
        openBook(slot);
      });
      wrapper.appendChild(row);
    }
    listBody.appendChild(wrapper);
  }
  function wireToggle(buttonId,panelId) {
    const btn = document.getElementById(buttonId);
    const panel = document.getElementById(panelId);
    btn.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
      if (!panel.hidden && panelId === 'book-list') panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  }
  wireToggle('help-toggle','help-panel');
  wireToggle('list-toggle','book-list');
})();
