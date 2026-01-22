// Week4 Project#2 회원가입
// FR1: 아이디 중복 체크
// FR2: 비밀번호 규칙 + 정상성 체크(실시간)

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'week4_users_v1';

  const el = {
    form: document.getElementById('form'),

    name: document.getElementById('name'),
    username: document.getElementById('username'),
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    password2: document.getElementById('password2'),

    btnCheck: document.getElementById('btnCheck'),
    btnPw: document.getElementById('btnPw'),
    btnReset: document.getElementById('btnReset'),

    idHint: document.getElementById('idHint'),
    pwHint: document.getElementById('pwHint'),
    msg: document.getElementById('formMsg'),

    rLen: document.getElementById('rLen'),
    rMix: document.getElementById('rMix'),
    rSpec: document.getElementById('rSpec'),
    rSpace: document.getElementById('rSpace'),
    rRepeat: document.getElementById('rRepeat'),
  };

  const state = {
    checkedId: '',
    idOk: false,
  };

  function readUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function setMsg(type, text) {
    // type: 'error' | 'success' | 'neutral'
    if (!text) {
      el.msg.hidden = true;
      el.msg.textContent = '';
      el.msg.classList.remove('alert--success');
      return;
    }
    el.msg.hidden = false;
    el.msg.textContent = text;
    if (type === 'success') el.msg.classList.add('alert--success');
    else el.msg.classList.remove('alert--success');
  }

  function setHint(target, type, text) {
    target.textContent = text || '';
    target.classList.remove('hint--ok', 'hint--bad');
    if (type === 'ok') target.classList.add('hint--ok');
    if (type === 'bad') target.classList.add('hint--bad');
  }

  function resetIdCheck(reason) {
    state.idOk = false;
    state.checkedId = '';
    if (reason) setHint(el.idHint, 'neutral', reason);
  }

  function validateUsername(id) {
    const v = (id || '').trim();
    if (v.length < 4 || v.length > 16) return { ok: false, msg: '아이디는 4~16자입니다.' };
    if (!/^[a-z]/.test(v)) return { ok: false, msg: '아이디는 영문 소문자로 시작해야 합니다.' };
    if (!/^[a-z0-9._]+$/.test(v)) return { ok: false, msg: '허용 문자: 영문/숫자/._' };
    return { ok: true, msg: '형식 OK' };
  }

  function evalPassword(pw) {
    const value = pw || '';

    const lenOk = value.length >= 8 && value.length <= 20;
    const mixOk = /[A-Za-z]/.test(value) && /\d/.test(value);
    const specOk = /[!@#$%^&*()_+\-={}[\]:;"'<>,.?/|~`]/.test(value);
    const spaceOk = !/\s/.test(value);
    const repeatOk = !/(.)\1\1/.test(value);

    return {
      lenOk,
      mixOk,
      specOk,
      spaceOk,
      repeatOk,
      allOk: lenOk && mixOk && specOk && spaceOk && repeatOk,
    };
  }

  function markRule(ruleEl, ok) {
    ruleEl.classList.remove('rule--ok', 'rule--bad');
    if (ok) ruleEl.classList.add('rule--ok');
    else ruleEl.classList.add('rule--bad');
  }

  function refreshPasswordUI() {
    const pw = el.password.value;
    const r = evalPassword(pw);

    if (!pw) {
      // 비어있으면 모두 회색으로
      [el.rLen, el.rMix, el.rSpec, el.rSpace, el.rRepeat].forEach(ruleEl => {
        ruleEl.classList.remove('rule--ok', 'rule--bad');
      });
    } else {
      markRule(el.rLen, r.lenOk);
      markRule(el.rMix, r.mixOk);
      markRule(el.rSpec, r.specOk);
      markRule(el.rSpace, r.spaceOk);
      markRule(el.rRepeat, r.repeatOk);
    }

    const pw2 = el.password2.value;

    if (!pw && !pw2) {
      setHint(el.pwHint, 'neutral', '');
      return;
    }

    if (!pw2) {
      setHint(el.pwHint, 'neutral', '비밀번호 확인을 입력하세요.');
      return;
    }

    if (pw === pw2) setHint(el.pwHint, 'ok', '비밀번호가 일치합니다.');
    else setHint(el.pwHint, 'bad', '비밀번호가 일치하지 않습니다.');
  }

  async function sha256Hex(text) {
    try {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // 과제용 fallback(보안 목적 아님)
      let h = 2166136261;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return `fallback_${(h >>> 0).toString(16)}`;
    }
  }

  function isEmailValid(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleCheckId() {
    setMsg('neutral', '');

    const id = el.username.value.trim();
    const v = validateUsername(id);
    if (!v.ok) {
      resetIdCheck();
      setHint(el.idHint, 'bad', v.msg);
      el.username.focus();
      return;
    }

    const users = readUsers();
    const exists = users.some(u => String(u.username || '').toLowerCase() === id.toLowerCase());

    if (exists) {
      resetIdCheck();
      setHint(el.idHint, 'bad', '이미 사용 중인 아이디입니다.');
      return;
    }

    state.idOk = true;
    state.checkedId = id;
    setHint(el.idHint, 'ok', '사용 가능한 아이디입니다.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('neutral', '');

    const name = el.name.value.trim();
    const id = el.username.value.trim();
    const email = el.email.value.trim();
    const pw = el.password.value;
    const pw2 = el.password2.value;

    if (!name) return setMsg('error', '이름을 입력하세요.'), el.name.focus();
    if (name.length > 20) return setMsg('error', '이름은 20자 이하여야 합니다.'), el.name.focus();

    const idV = validateUsername(id);
    if (!idV.ok) return setMsg('error', `아이디 형식 오류: ${idV.msg}`), el.username.focus();

    // FR1: 중복확인을 통과해야 가입 가능
    if (!state.idOk || state.checkedId !== id) {
      return setMsg('error', '아이디 중복확인을 먼저 완료하세요.'), el.btnCheck.focus();
    }

    // FR2: 비밀번호 규칙 통과
    const r = evalPassword(pw);
    if (!r.allOk) return setMsg('error', '비밀번호 규칙을 모두 만족해야 합니다.'), el.password.focus();
    if (pw !== pw2) return setMsg('error', '비밀번호 확인이 일치하지 않습니다.'), el.password2.focus();

    if (!isEmailValid(email)) return setMsg('error', '이메일 형식이 올바르지 않습니다.'), el.email.focus();

    // 저장 직전에 한 번 더 중복 확인
    const users = readUsers();
    if (users.some(u => String(u.username || '').toLowerCase() === id.toLowerCase())) {
      resetIdCheck('방금 같은 아이디가 등록되었습니다. 다시 중복확인하세요.');
      return setMsg('error', '아이디가 이미 존재합니다.'), el.username.focus();
    }

    const pwHash = await sha256Hex(pw);
    users.push({
      username: id,
      name,
      email: email || undefined,
      pwHash,
      createdAt: Date.now(),
    });
    writeUsers(users);

    setMsg('success', '가입이 완료되었습니다. (LocalStorage에 저장됨)');
    el.form.reset();
    resetIdCheck();
    setHint(el.idHint, 'neutral', '');
    setHint(el.pwHint, 'neutral', '');
    refreshPasswordUI();
  }

  function bindEvents() {
    el.username.addEventListener('input', () => {
      if (state.idOk) resetIdCheck('아이디가 변경되었습니다. 다시 중복확인하세요.');
      setMsg('neutral', '');
    });

    el.btnCheck.addEventListener('click', handleCheckId);

    el.password.addEventListener('input', () => {
      refreshPasswordUI();
      setMsg('neutral', '');
    });
    el.password2.addEventListener('input', () => {
      refreshPasswordUI();
      setMsg('neutral', '');
    });

    el.btnPw.addEventListener('click', () => {
      const isHidden = el.password.type === 'password';
      el.password.type = isHidden ? 'text' : 'password';
      el.password2.type = isHidden ? 'text' : 'password';
      el.btnPw.textContent = isHidden ? '숨김' : '보기';
    });

    el.btnReset.addEventListener('click', () => {
      setTimeout(() => {
        resetIdCheck();
        setHint(el.idHint, 'neutral', '');
        setHint(el.pwHint, 'neutral', '');
        setMsg('neutral', '');
        refreshPasswordUI();
      }, 0);
    });

    el.form.addEventListener('submit', handleSubmit);
  }

  bindEvents();
  refreshPasswordUI();
});
