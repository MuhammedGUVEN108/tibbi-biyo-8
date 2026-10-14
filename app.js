'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const root = document.documentElement;
  const themeButton = $('#theme-toggle');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? '◐ Açık temaya geç' : '◐ Koyu temaya geç';
    themeButton.setAttribute('aria-label', themeButton.textContent);
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
  };
  setTheme('dark');
  themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  const menuButton = $('#menu-toggle');
  const rail = $('.wd-rail');
  const closeMenu = () => { rail.classList.remove('menu-open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton.addEventListener('click', () => {
    const open = rail.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && rail.classList.contains('menu-open')) { closeMenu(); menuButton.focus(); }
  });
  const navLinks = $$('#topic-nav a');
  const lessonSections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  navLinks.forEach((a) => a.addEventListener('click', () => {
    closeMenu();
    const section = $(a.getAttribute('href'));
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }));
  const progress = $('.reading-progress');
  const fill = $('#progress-fill');
  let updatePending = false;
  const updateReading = () => {
    const max = Math.max(1, root.scrollHeight - window.innerHeight);
    const pct = Math.max(0, Math.min(100, Math.round(window.scrollY / max * 100)));
    fill.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', String(pct));
    let active = lessonSections[0];
    lessonSections.forEach((s) => { if (s.getBoundingClientRect().top <= window.innerHeight * .3) active = s; });
    if (window.scrollY >= max - 4) active = lessonSections[lessonSections.length - 1];
    navLinks.forEach((a) => {
      if (a.hash === '#' + active.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    updatePending = false;
  };
  const scheduleReading = () => {
    if (!updatePending) { updatePending = true; requestAnimationFrame(updateReading); }
  };
  window.addEventListener('scroll', scheduleReading, { passive: true });
  window.addEventListener('resize', scheduleReading);
  document.addEventListener('toggle', scheduleReading, true);
  window.addEventListener('load', updateReading);
  updateReading();

  const phases = [
    ['01 / BÜYÜME', 'G1: Kopyalamaya hazırlan.', 'Hücre büyür, RNA ve protein üretir. DNA henüz eşlenmez. Uygun büyüme sinyalleri ve yeterli kaynaklar S fazına geçişi destekler.', '2n · 2C', 'G1', 'DNA: 2C'],
    ['02 / REPLİKASYON', 'S: DNA’yı bir kez kopyala.', 'Nükleer DNA replikasyonu gerçekleşir. DNA miktarı artarken kromozom sayısı değişmez; her kromozom iki kardeş kromatitten oluşur.', '2n · 2C → 4C', 'S', 'DNA: 2C → 4C'],
    ['03 / HAZIRLIK', 'G2: Tamamlandığını denetle.', 'Replikasyonun bitmiş olması ve DNA bütünlüğü kontrol edilir. Mitoz için gerekli proteinler ve hücresel düzen hazırlanır; yeni bir replikasyon turu başlamaz.', '2n · 4C', 'G2', 'DNA: 4C'],
    ['04 / DAĞITIM', 'M: İki tam takım oluştur.', 'Mitoz kardeş kromatitleri iki kutba dağıtır. Sitokinez tamamlandığında her diploid yavru hücre 2C DNA alır. Anafazda ayrılan her kardeş artık bağımsız kromozomdur.', '4C toplam → her yavru 2C', 'M', 'DNA: 4C → 2C + 2C'],
    ['DÖNGÜ DIŞI / İŞLEV', 'G0: Bölünmeden görevini sürdür.', 'Hücre aktif bölünme döngüsünün dışındadır. İşlevlerini sürdürebilir. Geri dönüş yeteneği hücre tipine bağlıdır; dönebilen hücreler G1 üzerinden ilerler.', 'Diploid örnekte 2n · 2C', 'G0', 'G1 ile bağlantılı']
  ];
  function selectCycle(index) {
    const p = phases[index];
    $('#cycle-detail').innerHTML = `<span class="eyebrow">${p[0]}</span><h3>${p[1]}</h3><p>${p[2]}</p><div class="dna-readout">${p[3]}<span>Kromozom takımı · DNA miktarı</span></div>`;
    $('#cycle-svg-phase').textContent = p[4];
    $('#cycle-svg-dna').textContent = p[5];
    $$('[data-cycle]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.cycle) === index)));
    $$('[data-ring]').forEach((ring) => ring.classList.toggle('is-active', Number(ring.dataset.ring) === index));
  }
  $$('[data-cycle]').forEach((button) => button.addEventListener('click', () => selectCycle(Number(button.dataset.cycle))));
  selectCycle(0);

  const mitoticStages = [
    ['Profaz', 'Kromozomlar yoğunlaşır. Sentrozomlar ayrılmaya ve mitotik iğ kurulmaya başlar. Çekirdek zarfı bu şemada henüz gösterilir.', 'Yoğunlaşma başlar; kardeşler birlikte.', 'Çekirdek zarfı korunuyor'],
    ['Prometafaz', 'Çekirdek zarfı çözülür. İğ mikrotübülleri kinetokorları arar ve yakalar. Bağlantılar kurulurken kromozomlar henüz tam dizilmemiştir.', 'Zarf çözülür; bağlanma kurulur.', 'Bağlantılar oluşuyor'],
    ['Metafaz', 'Kardeş kinetokorlar zıt kutuplara bağlıdır ve kromozomlar ekvator düzleminde dizilir. Kohezin, kardeşleri henüz birlikte tutar.', 'Dizilme var; ayrılma henüz yok.', 'Metafaz plağı'],
    ['Anafaz', 'Sekürin yıkımından sonra separaz kohezin bağlantısını çözer. Kardeş kromatitler bağımsız kromozom olarak zıt kutuplara gider. Kutuplar da uzaklaşabilir.', 'Kardeşler artık bağımsız kromozom.', 'Kutuplara ayrılma'],
    ['Telofaz', 'Kutuplardaki kromozomlar gevşer; çevrelerinde çekirdek zarfları yeniden kurulur. Sitokinez süreçleri bu dönemle örtüşebilir.', 'İki çekirdek yeniden kuruluyor.', 'İki yeni çekirdek'],
    ['Sitokinez', 'Aktin–miyozin II halkası bölünme oluğunu derinleştirir. Son hücreler arası köprünün ayrılmasıyla iki yavru hücre tamamlanır.', 'Çekirdek bölünmesinden sitoplazma ayrılmasına.', 'İki yavru hücre']
  ];
  const path = (d, cls) => `<path class="${cls}" d="${d}"/>`;
  const chromX = (x,y) => path(`M${x-8} ${y-14} L${x+8} ${y+14} M${x+8} ${y-14} L${x-8} ${y+14}`, 'chromosome');
  const chromV = (x,y,left) => path(`M${x+(left?10:-10)} ${y-13} L${x} ${y} L${x+(left?10:-10)} ${y+13}`, 'chromosome');
  function stageSVG(index) {
    let shapes = '';
    if (index === 5) {
      shapes += '<ellipse class="cell-outline" cx="125" cy="158" rx="91" ry="117"/><ellipse class="cell-outline" cx="335" cy="158" rx="91" ry="117"/><circle class="nuclear-outline" cx="125" cy="158" r="48"/><circle class="nuclear-outline" cx="335" cy="158" r="48"/>';
      shapes += path('M101 143 Q134 125 142 155 T116 179 M312 143 Q345 125 353 155 T327 179','chromosome');
    } else {
      shapes += index === 4 ? path('M225 52 C160 4 35 46 35 160 C35 274 160 316 225 268 Q230 263 235 268 C300 316 425 274 425 160 C425 46 300 4 235 52 Q230 57 225 52Z','cell-outline') : '<ellipse class="cell-outline" cx="230" cy="160" rx="201" ry="128"/>';
      if (index === 0) shapes += '<circle class="nuclear-outline" cx="230" cy="160" r="76"/>';
      if (index === 4) shapes += '<ellipse class="nuclear-outline" cx="130" cy="160" rx="56" ry="69"/><ellipse class="nuclear-outline" cx="330" cy="160" rx="56" ry="69"/>';
      if (index < 4) {
        shapes += '<circle class="pole" cx="65" cy="160" r="7"/><circle class="pole" cx="395" cy="160" r="7"/>';
        if (index > 0) {
          const coords = index === 1 ? [[185,110],[264,205]] : index === 2 ? [[230,115],[230,205]] : [[140,115],[140,205],[320,115],[320,205]];
          coords.forEach(([x,y],i) => { const pole = index === 3 ? (x < 230 ? 65 : 395) : (i===0 ? 65 : 395); shapes += path(`M${pole} 160 Q${(pole+x)/2} ${y} ${x} ${y}`, 'spindle'); if(index===2) shapes += path(`M${pole===65?395:65} 160 L${x} ${y}`, 'spindle'); });
          shapes += path('M65 160 Q230 48 395 160 M65 160 Q230 272 395 160','spindle');
        }
      }
      if(index === 0) shapes += chromX(210,132)+chromX(253,188);
      if(index === 1) shapes += chromX(185,110)+chromX(264,205);
      if(index === 2) shapes += path('M230 62 V257','nuclear-outline')+chromX(230,115)+chromX(230,205);
      if(index === 3) shapes += chromV(140,115,true)+chromV(140,205,true)+chromV(320,115,false)+chromV(320,205,false);
      if(index === 4) shapes += path('M110 133 Q146 113 148 155 T117 188 M310 133 Q346 113 348 155 T317 188','chromosome');
    }
    return `<svg viewBox="0 0 460 340" role="img" aria-label="${mitoticStages[index][0]}: ${mitoticStages[index][3]}">${shapes}<text x="230" y="328" text-anchor="middle" fill="currentColor" class="svg-small">${mitoticStages[index][3]}</text></svg>`;
  }
  function selectMitosis(index) {
    const s = mitoticStages[index];
    $('#mitosis-art').innerHTML = stageSVG(index);
    $('#mitosis-detail').innerHTML = `<span class="eyebrow">${String(index+1).padStart(2,'0')} / ${index===5?'SİTOPLAZMA BÖLÜNMESİ':'MİTOZ'}</span><h3>${s[0]}</h3><p>${s[1]}</p><div class="dna-readout">${s[2]}</div>`;
    $$('[data-mitosis]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.mitosis) === index)));
  }
  $$('[data-mitosis]').forEach((b) => b.addEventListener('click', () => selectMitosis(Number(b.dataset.mitosis))));
  selectMitosis(0);

  const dialog = $('#image-dialog');
  const dialogImage = $('#dialog-image');
  let imageTrigger = null;
  $$('.image-button').forEach((button) => button.addEventListener('click', () => {
    imageTrigger = button;
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.querySelector('img').alt;
    $('#dialog-caption').textContent = button.querySelector('img').alt;
    dialog.showModal();
    $('.dialog-image-wrap').scrollTo(0,0);
    $('#dialog-close').focus();
  }));
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if(imageTrigger) imageTrigger.focus({ preventScroll:true }); });

  // Veriler betikte gömülüdür: file:// altında fetch veya sunucu gerekmez.
  const answers = [1,0,2,3,0,2,1,3,0,2,1,3,0,2,1];
  const explanations = [
    'S fazında DNA eşlenir; G1 hazırlık, G2 eşlenme sonrası hazırlık dönemidir.',
    'Kardeşler henüz ayrılmadığı için 46 kromozom vardır. DNA 4C, kromatit sayısı 92’dir.',
    'G2 ve M, 4C DNA içerir. G0 ve G1 de yalnız DNA miktarıyla ayrılamaz.',
    'G0’dan geri dönüş hücre tipine bağlıdır. Bölünmeme, metabolik işlevin durması değildir.',
    'G2/M kontrolü tamamlanmamış DNA ile mitoza girişi geciktirir.',
    'Cdc25 bir fosfatazdır; Cdk üzerindeki inhibitör fosfatı uzaklaştırır.',
    'Wee1 inhibitör fosfat ekleyerek Cdk etkinliğini baskılar.',
    'Sekürin yıkılınca separaz üzerindeki inhibisyon kalkar; kohezin bağlantısı çözülebilir.',
    'Geminin, Cdt1’i inhibe ederek yeni MCM yüklenmesini ve tekrar lisanslamayı sınırlar.',
    'Düşük Cdk etkinliği geç mitoz/G1’de lisanslama için uygun ortam sağlar.',
    'Kohezin kardeşleri birlikte tutar; kondensin yoğunlaşmayı destekler.',
    'Metafazda dizilme, anafazda kardeşlerin ayrılması gerçekleşir.',
    'Amfitelik / bipolar bağlanmada kardeş kinetokorlar zıt kutuplara bağlıdır.',
    'Anafaz B kutupların uzaklaşmasıdır. Anafaz A kromozomların kutba yaklaşmasıdır.',
    'Kasılma halkası aktin–miyozin II sistemini kullanır; RhoA bu düzenlemeye katılır.'
  ];
  const topics = ['dongu','dna','dna','dongu','kontrol','cdk','cdk','yikim','replikasyon','replikasyon','ig','mitoz','ig','ig','sitokinez'];
  const form = $('#quiz-form');
  const result = $('#quiz-result');
  let graded = false;
  const getChoice = (i) => form.querySelector(`input[name="q${i}"]:checked`);
  const countAnswered = () => answers.filter((_,i) => getChoice(i)).length;
  const clearFeedback = () => {
    $$('.quiz-feedback').forEach((f) => { f.hidden=true; f.textContent=''; f.classList.remove('is-correct'); });
    result.hidden=true; result.textContent=''; graded=false;
  };
  form.addEventListener('change', () => {
    if(graded) clearFeedback();
    $('#quiz-count').textContent = `${countAnswered()} / ${answers.length} cevaplandı`;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    let correct=0; let blank=0; const missed = new Set();
    answers.forEach((answer,i) => {
      const selected=getChoice(i);
      const ok=selected!==null && Number(selected.value)===answer;
      if(ok) correct++;
      else { missed.add(topics[i]); if(!selected) blank++; }
      const feedback=$(`#feedback-${i}`);
      const correctText=form.querySelector(`input[name="q${i}"][value="${answer}"]`).closest('label').querySelector('span:last-child').textContent;
      feedback.replaceChildren();
      const heading=document.createElement('strong');
      heading.textContent=ok ? 'Doğru ✓' : selected ? 'Yanlış — doğru cevap: '+String.fromCharCode(65+answer) : 'Boş — doğru cevap: '+String.fromCharCode(65+answer);
      const explanation=document.createElement('p');
      explanation.textContent=correctText+'. '+explanations[i];
      const link=document.createElement('a');
      link.href='#'+topics[i]; link.textContent='İlgili konuya dön →';
      feedback.append(heading,explanation,link);feedback.hidden=false;feedback.classList.toggle('is-correct',ok);
    });
    result.replaceChildren();
    const heading=document.createElement('h3');heading.textContent=`${correct} / ${answers.length} doğru · %${Math.round(correct/answers.length*100)}`;
    const description=document.createElement('p');description.textContent=`${answers.length-correct-blank} yanlış, ${blank} boş. `+(correct===answers.length?'Tüm soruları doğru cevapladın. Bölüm sonu sorularını da açıklayarak tekrar et.':'Aşağıdaki konuları yeniden inceleyebilir, her sorunun altındaki açıklamayı okuyabilirsin.');
    result.append(heading,description);
    if(missed.size) {
      const links=document.createElement('div');links.className='result-links';
      missed.forEach((id) => { const a=document.createElement('a');a.href='#'+id;a.textContent=navLinks.find((n)=>n.hash==='#'+id).textContent.trim();links.append(a); });
      result.append(links);
    }
    result.hidden=false;graded=true;result.focus({preventScroll:true});result.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});scheduleReading();
  });
  $('#quiz-reset').addEventListener('click', () => {
    form.reset();clearFeedback();$('#quiz-count').textContent=`0 / ${answers.length} cevaplandı`;
    form.querySelector('input').focus({preventScroll:true});$('#test').scrollIntoView({behavior:'auto'});scheduleReading();
  });
})();
