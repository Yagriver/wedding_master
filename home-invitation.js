(() => {
  const words={
    es:{eyebrow:'Una invitación para vosotros',open:'Abrir nuestra invitación',hint:'Toca el sobre y empieza nuestra historia',welcome:'Nos encantará celebrarlo contigo',opening:'Abriendo vuestra invitación…'},
    it:{eyebrow:'Un invito per voi',open:'Apri il nostro invito',hint:'Tocca la busta: la nostra storia comincia qui',welcome:'Non vediamo l’ora di festeggiare con te',opening:'Il vostro invito si sta aprendo…'},
    en:{eyebrow:'An invitation for you',open:'Open our invitation',hint:'Tap the envelope. Our story begins here.',welcome:'We can’t wait to celebrate with you',opening:'Opening your invitation…'}
  };
  let cleanup=()=>{};
  const butterfly=`<svg viewBox="0 0 60 45" fill="none"><path class="wing-left" d="M30 28C8-6-5 6 9 24C-4 35 16 47 30 28Z" fill="currentColor"/><path class="wing-right" d="M30 28C52-6 65 6 51 24C64 35 44 47 30 28Z" fill="currentColor"/><path d="M30 32V17M30 19L25 12M30 19L35 12" stroke="#9a866b" stroke-width="1"/></svg>`;
  window.WeddingHomeInvitation={
    render(lang){const w=words[lang];return `<section class="home-invitation" aria-labelledby="invitation-title"><p class="eyebrow">${w.eyebrow}</p><h1 id="invitation-title">Chiara <em>&amp;</em> Yago</h1><p class="invitation-dateline">ROMA <span>·</span> 03 LUGLIO 2027</p><button class="welcome-envelope-button" type="button" aria-label="${w.open}"><span class="welcome-envelope-scene" aria-hidden="true"><span class="welcome-paper-back"><img src="assets/honeymoon/envelope-open-paper.webp" alt=""></span><span class="welcome-flap"><img src="assets/honeymoon/envelope-open-paper.webp" alt=""></span><span class="welcome-card"><img class="welcome-invitation-film" src="assets/welcome/invitation-closed.jpg" alt=""></span><span class="welcome-paper-front"><img src="assets/honeymoon/envelope-open-paper.webp" alt=""></span><img class="welcome-ribbon" src="assets/honeymoon/silk-flowers.webp" alt=""><span class="welcome-seal"><img src="assets/honeymoon/envelope-cutout.webp" alt=""></span><img class="welcome-closed" src="assets/honeymoon/envelope-cutout.webp" alt="">${[0,1,2].map(i=>`<span class="welcome-butterfly butterfly-${i}">${butterfly}</span>`).join('')}${Array.from({length:7},(_,i)=>`<i class="welcome-pollen" style="--i:${i}"></i>`).join('')}</span><span class="welcome-open-label">${w.open}<span aria-hidden="true">↗</span></span><span class="welcome-hint">${w.hint}</span></button><p class="welcome-note">${w.welcome}</p><span class="visually-hidden welcome-status" role="status" aria-live="polite"></span></section>`;},
    init(root,lang,onOpen){
      cleanup(); cleanup=()=>{};
      const host=root.querySelector('.home-invitation'); if(!host)return;
      const button=host.querySelector('button'), film=host.querySelector('.welcome-invitation-film');
      const animation=new Image();animation.src='assets/welcome/invitation-slide.webp';
      const motion=matchMedia('(prefers-reduced-motion: reduce)');
      const timers=new Set(); let opening=false,finished=false,leaving=false;
      const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);};
      const cancel=()=>{timers.forEach(clearTimeout);timers.clear();};
      const finish=()=>{if(finished)return;finished=true;cancel();onOpen();};
      const leave=()=>{if(leaving||finished)return;leaving=true;host.classList.add('is-leaving');later(finish,850);};
      const change=()=>{if(opening&&motion.matches)finish();};
      button.addEventListener('click',()=>{
        if(opening)return;opening=true;button.disabled=true;
        host.classList.add('is-opening');host.querySelector('.welcome-status').textContent=words[lang].opening;
        if(motion.matches){finish();return;}
        // Let the real sleeve clear the envelope before its paper mechanism moves.
        later(()=>{film.src='assets/welcome/invitation-slide.webp';later(leave,4900);},3100);
        // A failed or stalled media request must never prevent entry to the site.
        later(leave,10000);
      });
      motion.addEventListener('change',change);
      cleanup=()=>{finished=true;cancel();motion.removeEventListener('change',change);};
    }
  };
})();
