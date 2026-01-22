// Week4 Project#1 To-Do-List
// FR1: 일정 추가 / FR2: 일정 삭제

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'week4_todolist_items_v1';

  const el = {
    dlgAdd: document.getElementById('dlgAdd'),
    addForm: document.getElementById('addForm'),
    formError: document.getElementById('formError'),

    btnOpenAdd: document.getElementById('btnOpenAdd'),
    btnCloseAdd: document.getElementById('btnCloseAdd'),
    btnCancelAdd: document.getElementById('btnCancelAdd'),
    btnClearAll: document.getElementById('btnClearAll'),

    q: document.getElementById('q'),
    filter: document.getElementById('filter'),
    sort: document.getElementById('sort'),

    cards: document.getElementById('cards'),
    empty: document.getElementById('empty'),
    resultMeta: document.getElementById('resultMeta'),

    statAll: document.getElementById('statAll'),
    statToday: document.getElementById('statToday'),
    statPast: document.getElementById('statPast'),

    inputTitle: document.getElementById('title'),
    inputDate: document.getElementById('date'),
    inputTime: document.getElementById('time'),
    inputMemo: document.getElementById('memo'),
  };

  const state = {
    items: loadItems(),
  };

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function todayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  }

  function toTimestamp(dateStr, timeStr) {
    const t = (timeStr && /^\d{2}:\d{2}$/.test(timeStr)) ? timeStr : '23:59';
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = t.split(':').map(Number);
    return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
  }

  function isToday(item) {
    return item.date === todayKey();
  }

  function isPast(item) {
    return toTimestamp(item.date, item.time) < Date.now();
  }

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(x => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.date === 'string')
        .map(x => ({
          id: x.id,
          title: String(x.title),
          date: String(x.date),
          time: typeof x.time === 'string' ? x.time : '',
          memo: typeof x.memo === 'string' ? x.memo : '',
          createdAt: typeof x.createdAt === 'number' ? x.createdAt : Date.now(),
        }));
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function setItems(nextItems) {
    state.items = nextItems;
    saveItems(nextItems);
    render();
  }

  function clearFormError() {
    el.formError.hidden = true;
    el.formError.textContent = '';
  }

  function showFormError(msg) {
    el.formError.textContent = msg;
    el.formError.hidden = false;
  }

  function openDialog() {
    clearFormError();

    // 날짜 기본값 = 오늘
    if (el.inputDate && !el.inputDate.value) el.inputDate.value = todayKey();

    if (typeof el.dlgAdd.showModal === 'function') {
      el.dlgAdd.showModal();
    } else {
      el.dlgAdd.setAttribute('open', '');
    }

    setTimeout(() => el.inputTitle && el.inputTitle.focus(), 30);
  }

  function closeDialog() {
    if (typeof el.dlgAdd.close === 'function') {
      el.dlgAdd.close();
    } else {
      el.dlgAdd.removeAttribute('open');
    }
  }

  function validateForm() {
    const title = (el.inputTitle.value || '').trim();
    const date = (el.inputDate.value || '').trim();
    const time = (el.inputTime.value || '').trim();
    const memo = (el.inputMemo.value || '').trim();

    if (title.length < 1 || title.length > 40) {
      return { ok: false, msg: '제목은 1~40자여야 합니다.' };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return { ok: false, msg: '날짜를 선택하세요.' };
    }

    if (time) {
      if (!/^\d{2}:\d{2}$/.test(time)) {
        return { ok: false, msg: '시간 형식이 올바르지 않습니다.' };
      }
      const [hh, mm] = time.split(':').map(Number);
      if (hh > 23 || mm > 59) {
        return { ok: false, msg: '시간 범위가 올바르지 않습니다. (00:00~23:59)' };
      }
    }

    if (memo.length > 160) {
      return { ok: false, msg: '메모는 최대 160자입니다.' };
    }

    return { ok: true, value: { title, date, time, memo } };
  }

  function updateStats() {
    el.statAll.textContent = String(state.items.length);
    el.statToday.textContent = String(state.items.filter(isToday).length);
    el.statPast.textContent = String(state.items.filter(isPast).length);
  }

  function getViewItems() {
    const query = (el.q.value || '').trim().toLowerCase();
    const filter = el.filter.value;
    const sort = el.sort.value;

    let list = state.items.slice();

    if (filter === 'today') list = list.filter(isToday);
    if (filter === 'upcoming') list = list.filter(it => !isPast(it));
    if (filter === 'past') list = list.filter(isPast);

    if (query) {
      list = list.filter(it => {
        const text = `${it.title} ${it.memo || ''}`.toLowerCase();
        return text.includes(query);
      });
    }

    if (sort === 'date_asc') list.sort((a, b) => toTimestamp(a.date, a.time) - toTimestamp(b.date, b.time));
    if (sort === 'date_desc') list.sort((a, b) => toTimestamp(b.date, b.time) - toTimestamp(a.date, a.time));
    if (sort === 'created_desc') list.sort((a, b) => b.createdAt - a.createdAt);

    return list;
  }

  function makeBadge(text, className) {
    const span = document.createElement('span');
    span.className = className ? `badge ${className}` : 'badge';
    span.textContent = text;
    return span;
  }

  function createCard(item) {
    const article = document.createElement('article');
    article.className = 'card';
    article.dataset.id = item.id;

    const top = document.createElement('div');
    top.className = 'card__top';

    const left = document.createElement('div');

    const title = document.createElement('div');
    title.className = 'card__title';
    title.textContent = item.title;

    const meta = document.createElement('div');
    meta.className = 'card__meta';

    if (isToday(item)) meta.appendChild(makeBadge('오늘', 'badge--today'));
    else if (isPast(item)) meta.appendChild(makeBadge('지난 일정', 'badge--past'));
    else meta.appendChild(makeBadge('예정', ''));

    const when = item.time ? `${item.date} · ${item.time}` : item.date;
    meta.appendChild(makeBadge(when, ''));

    left.appendChild(title);
    left.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'card__actions';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'iconbtn';
    del.dataset.action = 'delete';
    del.setAttribute('aria-label', '삭제');
    del.textContent = '🗑';

    actions.appendChild(del);

    top.appendChild(left);
    top.appendChild(actions);

    article.appendChild(top);

    if (item.memo) {
      const memo = document.createElement('div');
      memo.className = 'card__memo';
      memo.textContent = item.memo;
      article.appendChild(memo);
    }

    return article;
  }

  function render() {
    updateStats();

    const view = getViewItems();
    el.resultMeta.textContent = `${view.length}개`;

    el.cards.innerHTML = '';

    if (view.length === 0) {
      el.empty.hidden = false;
      return;
    }

    el.empty.hidden = true;
    const frag = document.createDocumentFragment();
    view.forEach(it => frag.appendChild(createCard(it)));
    el.cards.appendChild(frag);
  }

  function addItem(value) {
    const item = {
      id: (crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: value.title,
      date: value.date,
      time: value.time,
      memo: value.memo,
      createdAt: Date.now(),
    };

    setItems([item, ...state.items]);
  }

  function deleteItemById(id) {
    const target = state.items.find(x => x.id === id);
    const extra = target ? `\n\n- ${target.title}` : '';

    if (!window.confirm(`이 일정을 삭제할까요?${extra}`)) return;

    setItems(state.items.filter(x => x.id !== id));
  }

  // ------- events -------
  el.btnOpenAdd.addEventListener('click', openDialog);
  el.btnCloseAdd.addEventListener('click', closeDialog);
  el.btnCancelAdd.addEventListener('click', closeDialog);

  el.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormError();

    const v = validateForm();
    if (!v.ok) {
      showFormError(v.msg);
      return;
    }

    addItem(v.value);
    el.addForm.reset();
    closeDialog();
  });

  el.cards.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action !== 'delete') return;

    const card = btn.closest('.card');
    if (!card) return;

    const id = card.dataset.id;
    if (!id) return;

    deleteItemById(id);
  });

  let t = 0;
  function scheduleRender() {
    window.clearTimeout(t);
    t = window.setTimeout(render, 80);
  }

  el.q.addEventListener('input', scheduleRender);
  el.filter.addEventListener('change', render);
  el.sort.addEventListener('change', render);

  el.btnClearAll.addEventListener('click', () => {
    if (state.items.length === 0) {
      window.alert('삭제할 일정이 없습니다.');
      return;
    }

    if (!window.confirm('모든 일정을 삭제할까요? (되돌릴 수 없음)')) return;
    setItems([]);
  });

  el.dlgAdd.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog();
  });

  // boot
  render();
});
