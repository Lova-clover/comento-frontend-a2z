/* Week3 - Clock (Battery + Alarms)
   요구사항
   - 배터리: 최초 100%, 1초마다 1% 감소
   - 0%가 되면 "시간 표시 영역"만 검은 배경으로 안 보이게
   - 알람: 시/분/초 설정 + 추가, 최대 3개, 현황 업데이트
   - 추가 기능(1개): 5분 스누즈 + localStorage 지속성
*/
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const el = {
    batteryFill: $('#batteryFill'),
    batteryPct: $('#batteryPct'),
    chargeBtn: $('#chargeBtn'),

    clockWrap: $('#clockWrap'),
    dateText: $('#dateText'),
    timeText: $('#timeText'),
    fullText: $('#fullText'),
    deadHint: $('#deadHint'),

    hInput: $('#hInput'),
    mInput: $('#mInput'),
    sInput: $('#sInput'),
    addBtn: $('#addBtn'),
    clearBtn: $('#clearBtn'),
    toast: $('#toast'),

    alarmList: $('#alarmList'),
    alarmCount: $('#alarmCount'),
    nextAlarm: $('#nextAlarm'),
    alarmState: $('#alarmState'),

    modal: $('#modal'),
    modalDesc: $('#modalDesc'),
    stopBtn: $('#stopBtn'),
    snoozeBtn: $('#snoozeBtn'),
  };

  /** @type {{battery:number, alarms:Array<Alarm>, ringingId:string|null}} */
  let state = {
    battery: 100,
    alarms: [],
    ringingId: null,
  };

  /** Alarm type */
  // id: string, h/m/s: number, enabled: boolean, label: string
  const STORAGE_KEY = 'week3_clock_state_v1';

  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtTime(h, m, s) { return `${pad2(h)}:${pad2(m)}:${pad2(s)}`; }

  function toast(msg) {
    el.toast.textContent = msg;
    if (!msg) return;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.toast.textContent = ''; }, 2200);
  }

  function nowParts() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    return { d, yyyy, mm, dd, hh, mi, ss };
  }

  function renderClock() {
    const { yyyy, mm, dd, hh, mi, ss } = nowParts();
    el.dateText.textContent = `${yyyy}-${mm}-${dd}`;
    el.timeText.textContent = `${hh}:${mi}:${ss}`;
    el.fullText.textContent = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;

    const dead = state.battery <= 0;
    el.clockWrap.classList.toggle('clock--dead', dead);
    el.deadHint.hidden = !dead;
  }

  function renderBattery() {
    const pct = Math.max(0, Math.min(100, Math.round(state.battery)));
    el.batteryPct.textContent = `${pct}%`;
    el.batteryFill.style.width = `${pct}%`;

    // 배터리 색 변화 (UX)
    const fill = el.batteryFill;
    if (pct >= 50) fill.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
    else if (pct >= 20) fill.style.background = 'linear-gradient(90deg, #f59e0b, #f97316)';
    else fill.style.background = 'linear-gradient(90deg, #ef4444, #b91c1c)';
  }

  function persist() {
    const payload = {
      battery: state.battery,
      alarms: state.alarms,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function restore() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      if (typeof payload?.battery === 'number') state.battery = payload.battery;
      if (Array.isArray(payload?.alarms)) state.alarms = payload.alarms;
    } catch {
      // ignore
    }
  }

  function sortAlarms() {
    state.alarms.sort((a, b) => (a.h * 3600 + a.m * 60 + a.s) - (b.h * 3600 + b.m * 60 + b.s));
  }

  function nextEnabledAlarmAfter(now = new Date()) {
    const hh = now.getHours();
    const mi = now.getMinutes();
    const ss = now.getSeconds();
    const cur = hh * 3600 + mi * 60 + ss;

    const enabled = state.alarms.filter(a => a.enabled);
    if (!enabled.length) return null;

    // 오늘 남은 알람
    const today = enabled
      .map(a => ({ a, t: a.h * 3600 + a.m * 60 + a.s }))
      .sort((x, y) => x.t - y.t);

    const later = today.find(x => x.t >= cur);
    if (later) return later.a;
    return today[0].a; // 내일 첫 알람
  }

  function renderAlarmStatus() {
    el.alarmCount.textContent = `${state.alarms.length} / 3`;
    const next = nextEnabledAlarmAfter();
    el.nextAlarm.textContent = next ? fmtTime(next.h, next.m, next.s) : '-';
    el.alarmState.textContent = state.ringingId ? '울림' : '대기';
  }

  function renderAlarms() {
    el.alarmList.innerHTML = '';
    sortAlarms();

    state.alarms.forEach((a) => {
      const li = document.createElement('li');
      li.className = 'alarmItem';
      li.dataset.id = a.id;

      const time = document.createElement('div');
      time.className = 'alarmTime';
      time.textContent = fmtTime(a.h, a.m, a.s);

      const badge = document.createElement('span');
      badge.className = `badge ${a.enabled ? '' : 'badge--off'}`;
      badge.textContent = a.enabled ? 'ON' : 'OFF';

      const grow = document.createElement('div');
      grow.className = 'grow';

      const actions = document.createElement('div');
      actions.className = 'actions';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'btn';
      toggleBtn.textContent = a.enabled ? '끄기' : '켜기';
      toggleBtn.addEventListener('click', () => {
        a.enabled = !a.enabled;
        persist();
        renderAlarms();
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn btn--danger';
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => {
        state.alarms = state.alarms.filter(x => x.id !== a.id);
        persist();
        renderAlarms();
      });

      actions.append(toggleBtn, delBtn);
      li.append(time, badge, grow, actions);
      el.alarmList.appendChild(li);
    });

    renderAlarmStatus();
  }

  function validateHMS(h, m, s) {
    if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return false;
    if (h < 0 || h > 23) return false;
    if (m < 0 || m > 59) return false;
    if (s < 0 || s > 59) return false;
    return true;
  }

  function addAlarm(h, m, s) {
    if (state.alarms.length >= 3) {
      toast('알람은 최대 3개까지 가능합니다.');
      return;
    }
    if (!validateHMS(h, m, s)) {
      toast('시간 입력이 올바르지 않습니다.');
      return;
    }

    const id = crypto.randomUUID?.() ?? String(Date.now() + Math.random());
    state.alarms.push({ id, h, m, s, enabled: true });
    persist();
    renderAlarms();
    toast(`알람 추가: ${fmtTime(h, m, s)}`);
  }

  function clearAlarms() {
    state.alarms = [];
    persist();
    renderAlarms();
    toast('알람 전체 삭제');
  }

  function openModal(alarm) {
    state.ringingId = alarm.id;
    el.modalDesc.textContent = `알람 시간: ${fmtTime(alarm.h, alarm.m, alarm.s)}`;
    el.modal.setAttribute('data-open', 'true');
    el.modal.setAttribute('aria-hidden', 'false');
    renderAlarmStatus();
  }

  function closeModal() {
    state.ringingId = null;
    el.modal.removeAttribute('data-open');
    el.modal.setAttribute('aria-hidden', 'true');
    renderAlarmStatus();
  }

  function stopAlarm() {
    // 알람 "끄기" = 해당 알람을 OFF로 전환(다시 켜기 가능)
    const id = state.ringingId;
    if (!id) return closeModal();
    const alarm = state.alarms.find(a => a.id === id);
    if (alarm) alarm.enabled = false;
    persist();
    closeModal();
    renderAlarms();
    toast('알람을 껐습니다.');
  }

  // 추가 기능: 스누즈(5분)
  function snooze5min() {
    const id = state.ringingId;
    if (!id) return closeModal();

    const now = new Date();
    const snooze = new Date(now.getTime() + 5 * 60 * 1000);
    const h = snooze.getHours();
    const m = snooze.getMinutes();
    const s = snooze.getSeconds();

    // 스누즈는 "새 알람"으로 추가 (최대 3개 제한 포함)
    closeModal();
    if (state.alarms.length >= 3) {
      toast('스누즈 실패: 알람이 3개라서 추가할 수 없습니다.');
      return;
    }
    addAlarm(h, m, s);
    toast('5분 스누즈 설정 완료');
  }

  function checkAlarms() {
    if (state.ringingId) return; // 이미 울리는 중
    if (state.battery <= 0) return; // 화면은 꺼져도 알람은 울릴 수 있다/없다 논쟁 방지: 여기서는 울리지 않게
    const now = new Date();
    const hh = now.getHours();
    const mi = now.getMinutes();
    const ss = now.getSeconds();

    const match = state.alarms.find(a => a.enabled && a.h === hh && a.m === mi && a.s === ss);
    if (match) openModal(match);
  }

  function tickBattery() {
    // 요구: 1초에 1% 감소
    state.battery = Math.max(0, state.battery - 1);
    renderBattery();
    persist();
  }

  function bindEvents() {
    el.addBtn.addEventListener('click', () => {
      const h = Number(el.hInput.value);
      const m = Number(el.mInput.value);
      const s = Number(el.sInput.value);
      addAlarm(h, m, s);
    });

    el.clearBtn.addEventListener('click', clearAlarms);

    el.chargeBtn.addEventListener('click', () => {
      state.battery = 100;
      renderBattery();
      persist();
      toast('배터리 100%로 충전');
    });

    el.modal.addEventListener('click', (e) => {
      const target = e.target;
      if (target?.dataset?.close === 'true') closeModal();
    });

    el.stopBtn.addEventListener('click', stopAlarm);
    el.snoozeBtn.addEventListener('click', snooze5min);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') el.addBtn.click();
      if (e.key === 'Escape') stopAlarm();
    });
  }

  function applyDemoIfAny() {
    const params = new URLSearchParams(location.search);
    const demo = params.get('demo');
    if (!demo) return;

    if (demo === 'alarm') {
      state.battery = 78;
      state.alarms = [{ id: 'demo', h: 11, m: 32, s: 42, enabled: true }];
      persist();
      renderBattery();
      renderAlarms();
      openModal(state.alarms[0]);
    }

    if (demo === 'dead') {
      state.battery = 0;
      persist();
      renderBattery();
    }
  }

  function init() {
    restore();
    bindEvents();

    applyDemoIfAny();

    // 첫 렌더
    renderBattery();
    renderAlarms();
    renderClock();

    // Clock tick
    setInterval(() => {
      renderClock();
      checkAlarms();
    }, 250);

    // Battery tick (1s)
    setInterval(() => {
      // 데모 모드에서는 배터리 깎지 않기(스크린샷용)
      const params = new URLSearchParams(location.search);
      if (params.get('demo')) return;
      if (state.battery <= 0) return;
      tickBattery();
    }, 1000);
  }

  init();
})();
