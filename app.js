(function(){
  'use strict';

  /* ------------------------------------------------------------------
     Sample data. Edit PROGRAMS, ITEMS, SCHOOLS and the seed trainees
     below to change what the prototype starts with.
     ------------------------------------------------------------------ */
  var PROGRAMS = {
    handicraft:{ name:'Handicraft', product:'mats', certAt:400 },
    tailoring:{ name:'Tailoring', product:'uniforms', certAt:400 },
    computers:{ name:'Fundamentals of computers', product:null, certAt:240 },
    cleaning:{ name:'Cleaning materials', product:'phenyl', certAt:400 }
  };
  var ITEMS = {
    phenyl:{ name:'Phenyl', unit:'L', program:'cleaning', stock:210 },
    uniforms:{ name:'School uniforms', unit:'pcs', program:'tailoring', stock:210 },
    mats:{ name:'Jute mats', unit:'pcs', program:'handicraft', stock:58 }
  };
  var SCHOOLS = [
    { id:'vern', name:'KISS Vernacular School', base:210, staff:210, use:{ phenyl:330, uniforms:90, mats:45 } },
    { id:'cbse', name:'KISS CBSE School', base:64, staff:64, use:{ phenyl:110, uniforms:30, mats:15 } },
    { id:'sca', name:'Satellite Centre A', base:38, staff:38, use:{ phenyl:70, uniforms:22, mats:10 } },
    { id:'scb', name:'Satellite Centre B', base:41, staff:41, use:{ phenyl:78, uniforms:20, mats:12 } },
    { id:'grs', name:'Govt. Residential School A', base:52, staff:52, use:{ phenyl:95, uniforms:26, mats:14 } }
  ];
  var trainees = [
    { id:'KS26-0412', name:'Sumitra Soren', program:'cleaning', days:46, hours:262, units:205, certified:'2 Sep' },
    { id:'KS26-0388', name:'Bikram Munda', program:'cleaning', days:38, hours:214, units:160, certified:null },
    { id:'KS25-1907', name:'Laxmi Kisan', program:'tailoring', days:44, hours:260, units:148, certified:null },
    { id:'KS26-0231', name:'Dulari Majhi', program:'tailoring', days:21, hours:118, units:61, certified:null },
    { id:'KS26-0154', name:'Ramesh Hembram', program:'handicraft', days:33, hours:190, units:74, certified:null },
    { id:'KS25-1733', name:'Puspanjali Sabar', program:'handicraft', days:47, hours:271, units:138, certified:'9 Sep' },
    { id:'KS26-0309', name:'Mangal Santal', program:'computers', days:30, hours:150, units:0, certified:null },
    { id:'KS26-0276', name:'Rasmita Naik', program:'computers', days:41, hours:236, units:0, certified:null },
    { id:'KS26-0447', name:'Sanjay Bhuyan', program:'cleaning', days:12, hours:64, units:48, certified:null },
    { id:'KS26-0190', name:'Kabita Pradhan', program:'tailoring', days:29, hours:165, units:88, certified:null }
  ];
  var month = { key:'', hours:1486, made:{ phenyl:640, uniforms:310, mats:120 }, dispatches:14 };
  var ledger = [
    { date:'18 Sep', kind:'dispatch', text:'Sent 120 L phenyl to KISS Vernacular School' },
    { date:'18 Sep', kind:'shift', text:'Bikram Munda added 7 h and 18 L phenyl' },
    { date:'17 Sep', kind:'shift', text:'Laxmi Kisan added 8 h and 12 pcs school uniforms' },
    { date:'17 Sep', kind:'dispatch', text:'Sent 40 pcs school uniforms to Satellite Centre B' },
    { date:'16 Sep', kind:'reg', text:'Sanjay Bhuyan registered for Cleaning materials' },
    { date:'15 Sep', kind:'dispatch', text:'Sent 12 pcs jute mats to KISS CBSE School' },
    { date:'9 Sep', kind:'cert', text:'Puspanjali Sabar certified in Handicraft' },
    { date:'2 Sep', kind:'cert', text:'Sumitra Soren certified in Cleaning materials' }
  ];

  /* ---------- Helpers ---------- */
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var dstr = function(d){ return d.getDate()+' '+MONTHS[d.getMonth()]; };
  var monthKey = function(d){ return d.getFullYear()+'-'+(d.getMonth()+1); };
  var fmtN = function(n){ return Math.round(n).toLocaleString('en-IN'); };
  var isNum = function(n){ return typeof n === 'number' && isFinite(n) && n >= 0; };

  month.key = monthKey(new Date());

  var score = function(t){ return t.hours + t.units; };
  var demand = function(k){
    return SCHOOLS.reduce(function(s,sc){ return s + sc.use[k]*sc.staff/sc.base; }, 0);
  };
  var coverDays = function(k){
    var d = demand(k);
    return d > 0 ? ITEMS[k].stock / (d/30) : 999;
  };
  var log = function(kind,text){
    ledger.unshift({ date:dstr(new Date()), kind:kind, text:text });
    if(ledger.length > 200){ ledger.length = 200; }
  };
  var setMsg = function(id,text,err){
    var el = $(id); el.textContent = text; el.className = 'msg' + (err ? ' err' : '');
  };

  /* ---------- Saving in this browser ---------- */
  var KEY = 'kiss-vocational-centre-v1';
  function validTrainee(t){
    return t && typeof t.id === 'string' && typeof t.name === 'string' && PROGRAMS[t.program] &&
      isNum(t.days) && isNum(t.hours) && isNum(t.units) && (t.certified === null || typeof t.certified === 'string');
  }
  function save(){
    try{
      var stock = {}, staff = {};
      Object.keys(ITEMS).forEach(function(k){ stock[k] = ITEMS[k].stock; });
      SCHOOLS.forEach(function(s){ staff[s.id] = s.staff; });
      localStorage.setItem(KEY, JSON.stringify({
        v:1, trainees:trainees, ledger:ledger, month:month, stock:stock, staff:staff,
        buffer:parseFloat($('buffer').value)
      }));
    }catch(e){}
  }
  function load(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return;
      var d = JSON.parse(raw);
      if(!d || d.v !== 1) return;
      if(Array.isArray(d.trainees) && d.trainees.every(validTrainee)){ trainees = d.trainees; }
      if(Array.isArray(d.ledger)){
        ledger = d.ledger.filter(function(e){
          return e && typeof e.date === 'string' && typeof e.text === 'string' && typeof e.kind === 'string';
        }).slice(0,200);
      }
      if(d.stock){ Object.keys(ITEMS).forEach(function(k){ if(isNum(d.stock[k])){ ITEMS[k].stock = d.stock[k]; } }); }
      if(d.staff){ SCHOOLS.forEach(function(s){ if(isNum(d.staff[s.id])){ s.staff = d.staff[s.id]; } }); }
      if(d.month && d.month.key === month.key && isNum(d.month.hours) && isNum(d.month.dispatches) && d.month.made){
        month.hours = d.month.hours; month.dispatches = d.month.dispatches;
        Object.keys(ITEMS).forEach(function(k){ if(isNum(d.month.made[k])){ month.made[k] = d.month.made[k]; } });
      } else if(d.month){
        /* A new month has started: this month's counters begin again at zero. */
        month.hours = 0; month.dispatches = 0;
        Object.keys(ITEMS).forEach(function(k){ month.made[k] = 0; });
      }
      if(isNum(d.buffer) && d.buffer <= 4){ $('buffer').value = d.buffer; }
    }catch(e){}
  }

  /* ---------- Overview ---------- */
  function renderOverview(){
    var keys = Object.keys(ITEMS), low = null;
    keys.forEach(function(k){
      var d = coverDays(k);
      if(!low || d < low.d){ low = { k:k, d:d }; }
    });
    var it = ITEMS[low.k];
    if(low.d < 14){
      $('headline').textContent = it.name + ' will run out in about ' + Math.max(1,Math.floor(low.d)) + ' days.';
      $('subline').textContent = 'Schools use about ' + fmtN(demand(low.k)) + ' ' + it.unit + ' a month and the store holds ' + fmtN(it.stock) + ' ' + it.unit + '. It is made by trainees in ' + PROGRAMS[it.program].name.toLowerCase() + ', so their next shifts matter most.';
    } else {
      $('headline').textContent = 'Every product has more than two weeks of stock.';
      $('subline').textContent = 'The forecast shows what to make next month so the store stays ahead of the schools.';
    }

    var inTraining = trainees.filter(function(t){ return !t.certified; }).length;
    var certified = trainees.length - inTraining;
    var underTwo = keys.filter(function(k){ return coverDays(k) < 14; }).length;
    var made = keys.map(function(k){ return fmtN(month.made[k]) + ' ' + ITEMS[k].unit + ' ' + ITEMS[k].name.toLowerCase(); }).join(', ');
    var stockLine = keys.map(function(k){ return ITEMS[k].name + ' ' + fmtN(ITEMS[k].stock) + ' ' + ITEMS[k].unit; }).join(', ');

    $('chain').innerHTML =
      '<li><a class="stage stage-training" href="#trainees"><h2>Training</h2><div class="or" lang="or">ପ୍ରଶିକ୍ଷଣ</div><div class="big">'+inTraining+'</div><div class="cap">trainees in '+Object.keys(PROGRAMS).length+' programs</div><div class="foot">'+certified+' certified so far. A certificate needs a production score of 400 (240 for computers).</div></a></li>' +
      '<li><a class="stage stage-production" href="#trainees"><h2>Production</h2><div class="or" lang="or">ଉତ୍ପାଦନ</div><div class="big">'+fmtN(month.hours)+'</div><div class="cap">hours worked this month</div><div class="foot">Made: '+esc(made)+'.</div></a></li>' +
      '<li><a class="stage stage-store" href="#store"><h2>Store</h2><div class="or" lang="or">ଭଣ୍ଡାର</div><div class="big">'+underTwo+'</div><div class="cap">'+(underTwo===1?'product':'products')+' under two weeks of stock</div><div class="foot">'+esc(stockLine)+'.</div></a></li>' +
      '<li><a class="stage stage-distribution" href="#store"><h2>Distribution</h2><div class="or" lang="or">ବିତରଣ</div><div class="big">'+month.dispatches+'</div><div class="cap">dispatches to schools this month</div><div class="foot">Stock leaves the store only by dispatch to a school.</div></a></li>';

    $('cover').innerHTML = keys.map(function(k){
      var d = coverDays(k), pct = Math.min(100, d/30*100), warn = d < 14;
      return '<li><div class="cover-head"><strong>'+ITEMS[k].name+'</strong><span class="'+(warn?'low':'')+'">'+fmtN(ITEMS[k].stock)+' '+ITEMS[k].unit+', about '+Math.floor(d)+' days</span></div>' +
             '<div class="stitch'+(warn?' warn':'')+'" style="--p:'+pct+'%" role="img" aria-label="'+Math.floor(d)+' days of cover, out of 30 shown"></div></li>';
    }).join('');

    $('ledger').innerHTML = ledger.slice(0,8).map(function(e){
      return '<li><span class="d">'+esc(e.date)+'</span><span>'+esc(e.text)+'</span></li>';
    }).join('');
  }

  /* ---------- Trainees ---------- */
  function trainRow(t){
    var p = PROGRAMS[t.program], sc = score(t), pct = Math.min(100, sc/p.certAt*100), action;
    if(t.certified){
      action = '<span class="ok">Certified '+esc(t.certified)+'</span><br><button class="btn ghost sm" type="button" data-profile="'+esc(t.id)+'">View training profile</button>';
    } else if(sc >= p.certAt){
      action = '<button class="btn sm" type="button" data-cert="'+esc(t.id)+'">Issue certificate</button>';
    } else {
      action = '<span class="muted">In training</span>';
    }
    return '<tr><th scope="row" class="rowh"><strong>'+esc(t.name)+'</strong><br><span class="muted">'+esc(t.id)+'</span></th>' +
           '<td>'+p.name+'</td><td class="num">'+t.days+'</td><td class="num">'+t.hours+'</td><td class="num">'+t.units+'</td>' +
           '<td class="scorecell">'+sc+' of '+p.certAt+'<div class="stitch" style="--p:'+pct+'%" role="img" aria-label="Score '+sc+' of '+p.certAt+'"></div></td>' +
           '<td>'+action+'</td></tr>';
  }
  function renderTrainees(){
    $('trainee-rows').innerHTML = trainees.map(trainRow).join('');
    var sel = $('shift-trainee'), cur = sel.value;
    var open = trainees.filter(function(t){ return !t.certified; });
    sel.innerHTML = open.map(function(t){
      return '<option value="'+esc(t.id)+'">'+esc(t.name)+' ('+PROGRAMS[t.program].name+')</option>';
    }).join('');
    if(open.some(function(t){ return t.id === cur; })){ sel.value = cur; }
    syncUnits();
  }
  function syncUnits(){
    var t = trainees.filter(function(x){ return x.id === $('shift-trainee').value; })[0];
    var u = $('shift-units'), hint = $('units-hint');
    if(!t){ u.disabled = true; u.value = 0; hint.textContent = 'Every trainee is certified.'; return; }
    var p = PROGRAMS[t.program];
    if(p.product){
      var it = ITEMS[p.product];
      u.disabled = false;
      hint.textContent = 'Units made are added to the store as ' + it.name.toLowerCase() + ' (' + it.unit + ').';
    } else {
      u.disabled = true; u.value = 0;
      hint.textContent = 'This program is training only. No goods go to the store.';
    }
  }

  /* ---------- Store ---------- */
  function renderStore(){
    $('stock-rows').innerHTML = Object.keys(ITEMS).map(function(k){
      var it = ITEMS[k], d = coverDays(k), pct = Math.min(100, d/30*100), warn = d < 14;
      return '<tr><th scope="row" class="rowh"><strong>'+it.name+'</strong></th><td>'+PROGRAMS[it.program].name+'</td>' +
             '<td class="num">'+fmtN(it.stock)+' '+it.unit+'</td>' +
             '<td class="coverbar"><span class="'+(warn?'low':'')+'">About '+Math.floor(d)+' days</span><div class="stitch'+(warn?' warn':'')+'" style="--p:'+pct+'%" role="img" aria-label="'+Math.floor(d)+' days of cover, out of 30 shown"></div></td></tr>';
    }).join('');
    $('dispatches').innerHTML = ledger.filter(function(e){ return e.kind === 'dispatch'; }).slice(0,8).map(function(e){
      return '<li><span class="d">'+esc(e.date)+'</span><span>'+esc(e.text)+'</span></li>';
    }).join('');
    syncDispHint();
  }
  function syncDispHint(){
    var it = ITEMS[$('disp-item').value];
    $('disp-hint').textContent = 'In store: ' + fmtN(it.stock) + ' ' + it.unit + '.';
  }

  /* ---------- Forecast ---------- */
  function buildForecast(){
    var keys = Object.keys(ITEMS);
    var h = '<table><thead><tr><th scope="col">School</th><th scope="col" class="num">Staff now</th><th scope="col" class="num">Staff when use was measured</th>';
    keys.forEach(function(k){ h += '<th scope="col" class="num">'+ITEMS[k].name+' ('+ITEMS[k].unit+')</th>'; });
    h += '</tr></thead><tbody>';
    SCHOOLS.forEach(function(s){
      h += '<tr><th scope="row" class="rowh">'+esc(s.name)+'</th><td class="num"><input class="staff" type="number" min="0" step="1" value="'+s.staff+'" data-school="'+s.id+'" aria-label="Staff now at '+esc(s.name)+'"></td><td class="num">'+s.base+'</td>';
      keys.forEach(function(k){ h += '<td class="num" id="f-'+s.id+'-'+k+'"></td>'; });
      h += '</tr>';
    });
    h += '</tbody><tfoot><tr><th scope="row" class="rowh">All schools</th><td></td><td></td>';
    keys.forEach(function(k){ h += '<td class="num" id="ft-'+k+'"></td>'; });
    h += '</tr></tfoot></table>';
    $('forecast-table').innerHTML = h;
  }
  function updateCells(){
    Object.keys(ITEMS).forEach(function(k){
      var tot = 0;
      SCHOOLS.forEach(function(s){
        var v = s.use[k]*s.staff/s.base; tot += v;
        $('f-'+s.id+'-'+k).textContent = fmtN(v);
      });
      $('ft-'+k).textContent = fmtN(tot);
    });
  }
  function renderMakes(){
    var w = parseFloat($('buffer').value);
    $('buffer-out').textContent = (w === 1 ? '1 week' : w + ' weeks') + ' of use';
    $('makes').innerHTML = Object.keys(ITEMS).map(function(k){
      var it = ITEMS[k], d = Math.round(demand(k)), buf = Math.ceil(d/30*7*w);
      var need = Math.max(0, d + buf - it.stock);
      var note = need > 0
        ? 'Demand '+fmtN(d)+' + buffer '+fmtN(buf)+' − in store '+fmtN(it.stock)
        : 'The store already covers next month plus the buffer.';
      return '<div class="make"><div class="make-n">'+fmtN(need)+'<span>'+it.unit+'</span></div><h3>'+it.name+'</h3><p>'+note+'</p></div>';
    }).join('');
  }

  function renderAll(){
    renderOverview(); renderTrainees(); renderStore(); renderMakes();
  }
  function commit(){ renderAll(); save(); }

  /* ---------- Actions ---------- */
  $('reg-form').addEventListener('submit', function(e){
    e.preventDefault();
    var name = $('reg-name').value.trim(), id = $('reg-id').value.trim().toUpperCase(), prog = $('reg-program').value;
    if(!name || !id){ setMsg('reg-msg','Enter the student name and ID.',true); return; }
    var dup = trainees.filter(function(t){ return t.id.toUpperCase() === id; })[0];
    if(dup){
      setMsg('reg-msg', id + ' is already enrolled in ' + PROGRAMS[dup.program].name + '. A student can join only one program.', true);
      return;
    }
    trainees.push({ id:id, name:name, program:prog, days:0, hours:0, units:0, certified:null });
    log('reg', name + ' registered for ' + PROGRAMS[prog].name);
    setMsg('reg-msg', name + ' is registered for ' + PROGRAMS[prog].name + '.', false);
    $('reg-name').value = ''; $('reg-id').value = '';
    commit();
  });

  $('shift-trainee').addEventListener('change', syncUnits);
  $('shift-form').addEventListener('submit', function(e){
    e.preventDefault();
    var t = trainees.filter(function(x){ return x.id === $('shift-trainee').value; })[0];
    var h = parseInt($('shift-hours').value,10), u = parseInt($('shift-units').value,10) || 0;
    if(!t){ setMsg('shift-msg','There is no trainee to add a shift for.',true); return; }
    if(isNaN(h) || h < 1 || h > 12){ setMsg('shift-msg','Hours worked must be between 1 and 12.',true); return; }
    if(u < 0){ setMsg('shift-msg','Units made cannot be negative.',true); return; }
    var p = PROGRAMS[t.program], before = score(t) >= p.certAt;
    t.days += 1; t.hours += h; month.hours += h;
    var text = t.name + ' added ' + h + ' h';
    if(p.product && u > 0){
      var it = ITEMS[p.product];
      t.units += u; it.stock += u; month.made[p.product] += u;
      text += ' and ' + u + ' ' + it.unit + ' ' + it.name.toLowerCase();
    }
    log('shift', text);
    var msg = 'Shift added for ' + t.name + '.';
    if(!before && score(t) >= p.certAt){ msg += ' The production score now meets the target for a certificate.'; }
    setMsg('shift-msg', msg, false);
    commit();
  });

  $('trainee-rows').addEventListener('click', function(e){
    var c = e.target.closest('[data-cert]'), v = e.target.closest('[data-profile]');
    if(c){
      var t = trainees.filter(function(x){ return x.id === c.getAttribute('data-cert'); })[0];
      t.certified = dstr(new Date());
      log('cert', t.name + ' certified in ' + PROGRAMS[t.program].name);
      commit();
    } else if(v){
      showProfile(v.getAttribute('data-profile'));
    }
  });
  function showProfile(id){
    var t = trainees.filter(function(x){ return x.id === id; })[0]; if(!t) return;
    var p = PROGRAMS[t.program];
    var rows = [
      ['Student', t.name], ['Student ID', t.id], ['Program', p.name],
      ['Days in production', t.days], ['Hours worked', t.hours],
      ['Units made', p.product ? t.units + ' ' + ITEMS[p.product].unit + ' ' + ITEMS[p.product].name.toLowerCase() : 'Training only'],
      ['Production score', score(t) + ' of ' + p.certAt], ['Certified on', t.certified]
    ];
    $('profile-sub').textContent = 'KISS Vocational Centre';
    $('profile-body').innerHTML = rows.map(function(r){ return '<dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd>'; }).join('');
    var dlg = $('profile');
    if(dlg.showModal){ dlg.showModal(); } else { dlg.setAttribute('open',''); }
  }
  $('print-profile').addEventListener('click', function(){ window.print(); });

  $('disp-item').addEventListener('change', syncDispHint);
  $('disp-form').addEventListener('submit', function(e){
    e.preventDefault();
    var school = SCHOOLS.filter(function(s){ return s.id === $('disp-school').value; })[0];
    var it = ITEMS[$('disp-item').value], q = parseInt($('disp-qty').value,10);
    if(isNaN(q) || q < 1){ setMsg('disp-msg','Enter a quantity of 1 or more.',true); return; }
    if(q > it.stock){
      setMsg('disp-msg','Only ' + fmtN(it.stock) + ' ' + it.unit + ' of ' + it.name.toLowerCase() + ' is in the store. Lower the quantity or wait for the next production shift.', true);
      return;
    }
    it.stock -= q; month.dispatches += 1;
    log('dispatch', 'Sent ' + q + ' ' + it.unit + ' ' + it.name.toLowerCase() + ' to ' + school.name);
    setMsg('disp-msg', 'Sent ' + q + ' ' + it.unit + ' of ' + it.name.toLowerCase() + ' to ' + school.name + '.', false);
    commit();
  });

  $('buffer').addEventListener('input', function(){ renderMakes(); save(); });
  $('forecast-table').addEventListener('input', function(e){
    var el = e.target;
    if(!el.matches || !el.matches('input[data-school]')) return;
    var s = SCHOOLS.filter(function(x){ return x.id === el.getAttribute('data-school'); })[0];
    var v = parseInt(el.value,10);
    s.staff = (isNaN(v) || v < 0) ? 0 : v;
    updateCells(); renderMakes(); renderOverview(); renderStore(); save();
  });

  /* Two-step reset so a stray click cannot wipe the data */
  var resetTimer = null;
  $('reset').addEventListener('click', function(){
    var b = $('reset');
    if(!resetTimer){
      b.textContent = 'Click again to reset';
      resetTimer = setTimeout(function(){ b.textContent = 'Reset sample data'; resetTimer = null; }, 4000);
      return;
    }
    clearTimeout(resetTimer);
    try{ localStorage.removeItem(KEY); }catch(e){}
    location.reload();
  });

  /* ---------- Setup and navigation ---------- */
  $('reg-program').innerHTML = Object.keys(PROGRAMS).map(function(k){ return '<option value="'+k+'">'+PROGRAMS[k].name+'</option>'; }).join('');
  $('disp-school').innerHTML = SCHOOLS.map(function(s){ return '<option value="'+s.id+'">'+esc(s.name)+'</option>'; }).join('');
  $('disp-item').innerHTML = Object.keys(ITEMS).map(function(k){ return '<option value="'+k+'">'+ITEMS[k].name+'</option>'; }).join('');
  load();
  buildForecast(); updateCells(); renderAll();

  var VIEWS = ['overview','trainees','store','forecast'];
  function show(name, moveFocus){
    if(VIEWS.indexOf(name) < 0){ name = 'overview'; }
    VIEWS.forEach(function(v){ $('view-'+v).classList.toggle('on', v === name); });
    Array.prototype.forEach.call(document.querySelectorAll('.mast nav a'), function(a){
      if(a.getAttribute('href') === '#'+name){ a.setAttribute('aria-current','page'); } else { a.removeAttribute('aria-current'); }
    });
    window.scrollTo(0,0);
    if(moveFocus){
      var h = $('view-'+name).querySelector('h1');
      if(h){ h.setAttribute('tabindex','-1'); h.focus({ preventScroll:true }); }
    }
  }
  document.addEventListener('click', function(e){
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if(!a) return;
    var name = a.getAttribute('href').slice(1);
    if(VIEWS.indexOf(name) < 0) return;
    e.preventDefault();
    show(name, true);
    try{ history.replaceState(null,'','#'+name); }catch(err){}
  });
  window.addEventListener('hashchange', function(){
    var n = (location.hash||'#overview').slice(1);
    if(VIEWS.indexOf(n) > -1){ show(n, false); }
  });
  show((location.hash||'#overview').slice(1), false);
})();
