/* Week3 - Calculator
   요구사항
   - 숫자(0-9), 연산자(+, -, *, /) 버튼
   - 입력 식을 상단에 표시 (현재 입력 상태 확인)
   - '=' 계산 결과 출력
   - 'C' 또는 'CE'로 초기화
   - 추가 기능(1개): History 저장/조회(최근 10개), 클릭 시 재입력
   - (optional) 숫자 길이 제한(기본 24자)
*/
(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const el = {
    expr: $('#expr'),
    result: $('#result'),
    msg: $('#msg'),
    pad: document.querySelector('.pad'),
    historyList: $('#historyList'),
    clearHistory: $('#clearHistory'),
  };

  const MAX_LEN = 24;
  const HISTORY_KEY = 'week3_calc_history_v1';
  /** @type {{expr:string, result:string}[]} */
  let history = [];

  let expression = '0';

  function setMsg(text, warn=false){
    el.msg.textContent = text || '';
    el.msg.classList.toggle('msg--warn', !!warn);
    if (!text) return;
    clearTimeout(setMsg._t);
    setMsg._t = setTimeout(() => { el.msg.textContent = ''; el.msg.classList.remove('msg--warn'); }, 2200);
  }

  function normalizeExpr(expr){
    return expr.replace(/^0(?![.])/,'0'); // keep 0 if alone
  }

  function render(){
    el.expr.textContent = expression || '0';
  }

  function setExpression(next){
    expression = next || '0';
    expression = expression.trim();
    if (!expression) expression = '0';
    render();
  }

  function clearAll(){
    setExpression('0');
    el.result.textContent = ' ';
    setMsg('전체 초기화(C)');
  }

  function clearEntry(){
    if (expression.length <= 1) return setExpression('0');
    setExpression(expression.slice(0, -1));
    setMsg('한 글자 삭제(CE)');
  }

  function appendToken(token){
    if (!token) return;

    // length limit
    if ((expression === '0' ? 0 : expression.length) + token.length > MAX_LEN){
      setMsg(`입력 길이 제한(${MAX_LEN}자)`, true);
      return;
    }

    // prevent invalid leading operators
    const ops = '+-*/';
    if (ops.includes(token) && (expression === '0' || expression.endsWith('('))) {
      if (token === '-') { // unary minus allowed
        setExpression((expression === '0' ? '' : expression) + token);
        return;
      }
      setMsg('연산자는 앞에 숫자가 필요합니다.', true);
      return;
    }

    // replace initial 0 with digit
    if (expression === '0' && /\d/.test(token)){
      setExpression(token);
      return;
    }

    setExpression(expression + token);
  }

  function saveHistory(){
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  function loadHistory(){
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return;
    try{
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) history = parsed.slice(0, 10);
    }catch{
      // ignore
    }
  }

  function pushHistory(expr, result){
    const entry = { expr, result: String(result) };
    history.unshift(entry);
    history = history.slice(0, 10);
    saveHistory();
    renderHistory();
  }

  function renderHistory(){
    el.historyList.innerHTML = '';
    if (!history.length){
      const li = document.createElement('li');
      li.textContent = '기록이 없습니다.';
      li.style.color = '#64748b';
      el.historyList.appendChild(li);
      return;
    }

    history.forEach((h, idx) => {
      const li = document.createElement('li');
      li.className = 'item';
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `기록 ${idx + 1}: ${h.expr} = ${h.result}`);

      const e = document.createElement('div');
      e.className = 'item__expr';
      e.textContent = h.expr;

      const r = document.createElement('div');
      r.className = 'item__res';
      r.textContent = `= ${h.result}`;

      li.append(e, r);
      li.addEventListener('click', () => {
        setExpression(h.expr);
        el.result.textContent = `= ${h.result}`;
        setMsg('기록을 불러왔습니다.');
      });
      li.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') li.click();
      });

      el.historyList.appendChild(li);
    });
  }

  // ---------- Expression parser (No eval) ----------
  function tokenize(expr){
    const tokens = [];
    let i = 0;

    const isDigit = (c) => c >= '0' && c <= '9';
    const isOp = (c) => ['+','-','*','/'].includes(c);

    while (i < expr.length){
      const c = expr[i];

      if (c === ' '){ i++; continue; }

      // number (supports decimals)
      if (isDigit(c) || c === '.'){
        let j = i;
        let dot = 0;
        while (j < expr.length && (isDigit(expr[j]) || expr[j] === '.')){
          if (expr[j] === '.') dot++;
          if (dot > 1) throw new Error('잘못된 소수점');
          j++;
        }
        const num = expr.slice(i, j);
        if (num === '.') throw new Error('잘못된 숫자');
        tokens.push({ type:'num', value: parseFloat(num) });
        i = j;
        continue;
      }

      // parenthesis
      if (c === '(' || c === ')'){
        tokens.push({ type: c });
        i++;
        continue;
      }

      // operator (handle unary minus)
      if (isOp(c)){
        // unary minus if at start or after '(' or operator
        const prev = tokens.at(-1);
        const unary = c === '-' && (!prev || prev.type === '(' || prev.type === 'op');
        if (unary){
          tokens.push({ type:'num', value: -1 });
          tokens.push({ type:'op', value:'*' });
          i++;
          continue;
        }
        tokens.push({ type:'op', value:c });
        i++;
        continue;
      }

      throw new Error(`허용되지 않은 문자: ${c}`);
    }

    return tokens;
  }

  function precedence(op){
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/') return 2;
    return 0;
  }

  function toRPN(tokens){
    const out = [];
    const stack = [];

    for (const t of tokens){
      if (t.type === 'num') out.push(t);

      else if (t.type === 'op'){
        while (stack.length){
          const top = stack.at(-1);
          if (top.type === 'op' && precedence(top.value) >= precedence(t.value)){
            out.push(stack.pop());
          } else break;
        }
        stack.push(t);
      }

      else if (t.type === '('){
        stack.push(t);
      }

      else if (t.type === ')'){
        while (stack.length && stack.at(-1).type !== '('){
          out.push(stack.pop());
        }
        if (!stack.length) throw new Error('괄호가 맞지 않습니다.');
        stack.pop(); // remove '('
      }
    }

    while (stack.length){
      const top = stack.pop();
      if (top.type === '(') throw new Error('괄호가 맞지 않습니다.');
      out.push(top);
    }
    return out;
  }

  function evalRPN(rpn){
    const st = [];
    for (const t of rpn){
      if (t.type === 'num') st.push(t.value);
      else if (t.type === 'op'){
        const b = st.pop();
        const a = st.pop();
        if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error('식이 올바르지 않습니다.');
        let v = 0;
        if (t.value === '+') v = a + b;
        if (t.value === '-') v = a - b;
        if (t.value === '*') v = a * b;
        if (t.value === '/'){
          if (b === 0) throw new Error('0으로 나눌 수 없습니다.');
          v = a / b;
        }
        st.push(v);
      }
    }
    if (st.length !== 1) throw new Error('식이 올바르지 않습니다.');
    const res = st[0];
    // normalize -0
    return Object.is(res, -0) ? 0 : res;
  }

  function evaluateExpression(expr){
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const result = evalRPN(rpn);
    return result;
  }

  function onEqual(){
    const exprRaw = expression;

    try{
      const value = evaluateExpression(exprRaw);
      const out = Number.isFinite(value) ? String(+value.toFixed(12)).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1') : '오류';
      el.result.textContent = `= ${out}`;
      pushHistory(exprRaw, out);
      setMsg('계산 완료');
    }catch(err){
      el.result.textContent = ' ';
      setMsg(err?.message ?? '계산 오류', true);
    }
  }

  function bind(){
    el.pad.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const act = btn.dataset.act;
      const token = btn.dataset.token;

      if (act === 'c') return clearAll();
      if (act === 'ce') return clearEntry();
      if (act === 'eq') return onEqual();
      if (token) return appendToken(token);
    });

    el.clearHistory.addEventListener('click', () => {
      history = [];
      saveHistory();
      renderHistory();
      setMsg('기록 삭제');
    });

    window.addEventListener('keydown', (e) => {
      const k = e.key;

      if (k === 'Enter') { e.preventDefault(); return onEqual(); }
      if (k === 'Backspace') { e.preventDefault(); return clearEntry(); }
      if (k === 'Escape') { e.preventDefault(); return clearAll(); }

      const allowed = '0123456789+-*/().';
      if (allowed.includes(k)) appendToken(k);
    });
  }

  function applyDemoIfAny(){
    const params = new URLSearchParams(location.search);
    const demo = params.get('demo');
    if (!demo) return;

    if (demo === 'history'){
      setExpression('2+3*4');
      el.result.textContent = '= 14';
      history = [
        { expr:'2+3*4', result:'14' },
        { expr:'(10-2)/4', result:'2' },
      ];
      saveHistory();
      renderHistory();
    }
    if (demo === 'error'){
      setExpression('10/0');
      setMsg('0으로 나눌 수 없습니다.', true);
    }
  }

  function init(){
    loadHistory();
    renderHistory();
    render();
    bind();
    applyDemoIfAny();
  }

  init();
})();
