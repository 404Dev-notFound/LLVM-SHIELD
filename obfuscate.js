/* ---------- Util & UI wiring ---------- */
const steps = [1,2,3,4];
function gotoStep(n){
  steps.forEach(s=>{ document.getElementById('step-'+s).style.display='none'; document.getElementById('dot'+s).classList.remove('active'); });
  document.getElementById('step-'+n).style.display='block'; document.getElementById('dot'+n).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* File management */
const fileInput = document.getElementById('sourceFiles');
fileInput.addEventListener('change', e=>renderFiles(e.target.files));
function renderFiles(files){
  const wrap = document.getElementById('fileList'); wrap.innerHTML='';
  Array.from(files).forEach(f=>{
    const div = document.createElement('div'); div.className='file-item';
    div.innerHTML = `<div title="${f.name}">${f.name}</div><div style="display:flex;gap:8px;align-items:center"><div style="font-size:12px;color:var(--muted)">${Math.round(f.size/1024)} KB</div><i style="cursor:pointer;color:var(--accent)" title="Remove">✖</i></div>`;
    div.querySelector('i').addEventListener('click', ()=>{ div.remove(); });
    wrap.appendChild(div);
  });
}
function clearFiles(){ fileInput.value=''; document.getElementById('fileList').innerHTML=''; }

/* cycles & bogus UI sync */
const cyclesRange = document.getElementById('cyclesRange'), cyclesValue = document.getElementById('cyclesValue');
const bogusRange = document.getElementById('bogusRange'), bogusValue = document.getElementById('bogusValue');
cyclesRange.addEventListener('input', ()=> cyclesValue.innerText = cyclesRange.value);
bogusRange.addEventListener('input', ()=> bogusValue.innerText = bogusRange.value + '%');

/* Draggable pass-order */
const list = document.getElementById('draggableList');
let dragSrc = null;
list.addEventListener('dragstart', e => { dragSrc = e.target; e.target.classList.add('dragging'); });
list.addEventListener('dragend', e => { if(e.target) e.target.classList.remove('dragging'); dragSrc=null; });
list.addEventListener('dragover', e => { e.preventDefault(); const el = getPassItem(e.target); if(el && dragSrc !== el){ const rect = el.getBoundingClientRect(); const after = (e.clientY - rect.top) > rect.height/2; el.parentNode.insertBefore(dragSrc, after ? el.nextSibling : el); }});
function getPassItem(t){ while(t && !t.classList?.contains?.('pass-item')) t = t.parentElement; return t; }
function applyPassOrder(){
  const passes = Array.from(list.children).map(n=>n.dataset.pass).join(',');
  showLog(`Applied pass order: ${passes}`);
  document.getElementById('customPassOrder').value = passes;
}
function resetPassOrder(){
  const defaults = ['cfla','bogus','strenc','sym','anti'];
  list.innerHTML = '';
  defaults.forEach(p=>{
    const nameMap = {cfla:'CF-Flatten', bogus:'Bogus Injection', strenc:'String Encrypt', sym:'Symbol Rename', anti:'Anti-debug'};
    const div = document.createElement('div'); div.className='pass-item'; div.setAttribute('draggable','true'); div.dataset.pass=p;
    div.innerHTML = `<span>${nameMap[p]||p}</span><span class="pass-badge">Time:Med</span>`;
    list.appendChild(div);
  });
}

/* Report copy/clear */
function copyReport(){ navigator.clipboard?.writeText(document.getElementById('reportJson').innerText).then(()=> alert('Copied report JSON to clipboard')) }
function clearReport(){ document.getElementById('reportJson').innerText = '{ "waiting":"no events yet" }' }

/* Advanced modal simple functions */
function openAdvancedModal(){ document.getElementById('advancedModal').style.display='flex' }
function closeAdvancedModal(){ document.getElementById('advancedModal').style.display='none' }
function saveAdvanced(){ const p = document.getElementById('customPassOrder').value.trim(); if(p) showLog('Saved custom pass order: '+p); closeAdvancedModal(); }

/* UI helpers */
function showLog(msg){
  const lc = document.getElementById('logConsole');
  lc.innerText += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  lc.scrollTop = lc.scrollHeight;
}

/* Expected output status control */
const expectedKeys = ['inputParams','fileAttrs','bogusAmount','cyclesCompleted','stringEnc','fakeInserted','downloadReady'];
function setExpectedStatus(key, state, opt_message){
  const el = document.getElementById('st-'+key);
  if(!el) return;
  el.classList.remove('pending','running','done','failed');
  el.classList.add(state);
  if(opt_message) el.innerText = opt_message;
  else {
    if(state==='pending') el.innerText = 'Pending';
    if(state==='running') el.innerText = 'Running...';
    if(state==='done') el.innerText = 'Done';
    if(state==='failed') el.innerText = 'Failed';
  }
  const li = el.closest('li');
  const existingTs = li.querySelector('.ts'); if(existingTs) existingTs.remove();
  if(state==='done' || state==='failed'){
    const ts = document.createElement('span'); ts.className='ts'; ts.innerText = new Date().toLocaleTimeString();
    li.appendChild(ts);
    playBeep();
  }
}

/* WebSocket hookup */
let ws, wsConnected = false;
function connectWS(){
  const statusEl = document.getElementById('wsStatus');
  try { ws = new WebSocket('ws://localhost:3000'); }
  catch(e){ statusEl.innerText='ws://localhost:3000 (failed)'; statusEl.style.background='rgba(255,0,0,0.06)'; simulateFallback(); return; }
  ws.onopen = ()=>{ wsConnected=true; statusEl.innerText='ws://localhost:3000 (connected)'; statusEl.style.background='rgba(11,178,74,0.06)'; showLog('WebSocket connected') }
  ws.onmessage = (ev)=> { try { const j = JSON.parse(ev.data); document.getElementById('reportJson').innerText = JSON.stringify(j, null, 2); handleServerEvent(j); } catch(e){ showLog('Malformed WS event: ' + ev.data); } }
  ws.onerror = (e)=> { showLog('WS error'); simulateFallback(); }
  ws.onclose = ()=> { wsConnected=false; statusEl.innerText='ws://localhost:3000 (closed)'; statusEl.style.background='rgba(255,255,255,0.02)'; showLog('WebSocket closed'); }
}
function handleServerEvent(json){
  if(json.event && expectedKeys.includes(json.event)){
    const st = json.state || 'running';
    setExpectedStatus(json.event, st, json.message || undefined);
    if(json.payload?.percent !== undefined) document.getElementById('progressBar').style.width = json.payload.percent + '%';
    if(json.event === 'downloadReady' && st==='done'){ document.getElementById('successBanner').style.display='block'; }
    if(json.event==='fileAttrs' && st==='done' && json.payload?.size){ showLog(`Output size: ${json.payload.size} bytes`); }
  } else if(json.info){ showLog('INFO: ' + json.info); } else { showLog('Event: ' + JSON.stringify(json)); }
}
function simulateFallback(){
  document.getElementById('wsStatus').innerText='ws://localhost:3000 (no server)';
  document.getElementById('wsStatus').style.background='rgba(255,255,255,0.02)';
}

/* Run simulation / start / cancel */
let runTimerIDs = [];
function beginRun(){
  expectedKeys.forEach(k=>setExpectedStatus(k,'pending'));
  document.getElementById('progressBar').style.width='0%';
  document.getElementById('logConsole').innerText='';
  document.getElementById('successBanner').style.display='none';
  showLog('Starting obfuscation workflow...');

  if(wsConnected){
    const payload = {
      action:'start',
      files:Array.from(document.getElementById('fileList').children).map(n=>n.innerText.split(/\s/)[0]),
      options:{
        obfLevel: document.getElementById('obfLevel').value,
        cycles: cyclesRange.value,
        bogusPercent: bogusRange.value,
        stringEncrypt: document.getElementById('stringEncrypt').checked,
        passes: document.getElementById('customPassOrder').value || Array.from(list.children).map(n=>n.dataset.pass).join(',')
      }
    };
    ws.send(JSON.stringify(payload));
    showLog('Start command sent to server via WebSocket.');
    return;
  }

  const sequence = [
    {key:'inputParams', delay:400, note:'Parameters logged', pct:8},
    {key:'fileAttrs', delay:1100, note:'Computing file attributes', pct:20, payload:{size:123456}},
    {key:'bogusAmount', delay:1900, note:'Injecting bogus code', pct:45},
    {key:'cyclesCompleted', delay:2500, note:'Applying cycles', pct:68},
    {key:'stringEnc', delay:3300, note:'Encrypting strings', pct:82},
    {key:'fakeInserted', delay:3900, note:'Inserting fake code', pct:92},
    {key:'downloadReady', delay:4600, note:'Finalizing binary', pct:100}
  ];

  sequence.forEach(s=>{
    const t1 = setTimeout(()=>{ setExpectedStatus(s.key,'running','Running...'); showLog(s.note+' started'); document.getElementById('progressBar').style.width = s.pct * 0.6 + '%'; }, s.delay);
    runTimerIDs.push(t1);
    const t2 = setTimeout(()=>{ setExpectedStatus(s.key,'done'); showLog(s.note+' done'); document.getElementById('progressBar').style.width = s.pct + '%';
      if(s.payload) handleServerEvent({event:s.key,state:'done',payload:s.payload,message:s.note});
      if(s.key==='downloadReady'){ document.getElementById('successBanner').style.display='block'; }
    }, s.delay+700);
    runTimerIDs.push(t2);
  });
}
function cancelRun(){
  runTimerIDs.forEach(id=>clearTimeout(id)); runTimerIDs=[]; showLog('Run canceled by user'); document.getElementById('progressBar').style.width='0%'; expectedKeys.forEach(k=>setExpectedStatus(k,'pending')); document.getElementById('successBanner').style.display='none';
}

/* Download & report */
document.getElementById('downloadBtn').addEventListener('click', ()=>{
  const blob = new Blob(['OBFUSCATED_BINARY_PLACEHOLDER'], {type:'application/octet-stream'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='obfuscated_binary.bin'; a.click(); URL.revokeObjectURL(url);
  showLog('Downloaded obfuscated binary (simulated).');
});
function exportReportPDF(){ showLog('Export PDF requested (stub).'); alert('PDF export is a stub in this demo. Hook to server or use jsPDF to generate.'); }

/* Simple beep */
function playBeep(){ try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.type='sine'; o.frequency.value=880; g.gain.value=0.02; o.connect(g); g.connect(ctx.destination); o.start(); setTimeout(()=>{ o.stop(); ctx.close(); },90); } catch(e){} }

/* Auto-connect WS & init pass order */
window.addEventListener('load', ()=> {
  connectWS();
  document.getElementById('customPassOrder').value = Array.from(list.children).map(n=>n.dataset.pass).join(',');
});
