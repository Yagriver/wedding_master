(() => {
  const words = {
    es: {nav:'Luna de miel', title:'El próximo capítulo', intro:'El mejor regalo es compartir este día con vosotros.', open:'Una carta para vosotros', hint:'Toca el sobre para abrirla', close:'Cerrar la carta', greeting:'Querida familia, queridos amigos:', body:'Lo que más ilusión nos hace es teneros a nuestro lado el día de nuestra boda. Vuestra presencia es nuestro regalo más bonito.', gift:'Si además os apetece hacernos un regalo, podéis ayudarnos a llenar nuestra luna de miel de recuerdos: nuevos lugares, pequeños descubrimientos y aventuras juntos.', thanks:'Gracias por formar parte de nuestra historia.', love:'Con todo nuestro cariño,', details:'Para nuestra luna de miel', holder:'Titular de la cuenta', copy:'Copiar IBAN', copied:'IBAN copiado', fallback:'Puedes seleccionar el IBAN y copiarlo manualmente.', placeholder:'Vista previa: añadiremos aquí el titular y el IBAN.', alt:'Chiara y Yago besándose en un puente de piedra, entre montañas verdes.', caption:'Y tantos lugares por descubrir juntos.'},
    it: {nav:'Luna di miele', title:'Il prossimo capitolo', intro:'Il regalo più bello è condividere questo giorno con voi.', open:'Una lettera per voi', hint:'Toccate la busta per aprirla', close:'Chiudi la lettera', greeting:'Cari familiari, cari amici,', body:'La gioia più grande sarà avervi al nostro fianco il giorno del matrimonio. La vostra presenza è il nostro regalo più bello.', gift:'Se desiderate farci anche un pensiero, potete aiutarci a riempire la nostra luna di miele di ricordi: nuovi luoghi, piccole scoperte e avventure insieme.', thanks:'Grazie per far parte della nostra storia.', love:'Con tutto il nostro affetto,', details:'Per la nostra luna di miele', holder:'Intestatario del conto', copy:'Copia IBAN', copied:'IBAN copiato', fallback:'Potete selezionare l’IBAN e copiarlo manualmente.', placeholder:'Anteprima: qui aggiungeremo l’intestatario e l’IBAN.', alt:'Chiara e Yago si baciano su un ponte di pietra, tra montagne verdi.', caption:'E tanti luoghi ancora da scoprire insieme.'},
    en: {nav:'Honeymoon', title:'Our next chapter', intro:'Sharing this day with you is the greatest gift.', open:'A letter for you', hint:'Tap the envelope to open it', close:'Close the letter', greeting:'Dear family and friends,', body:'What we look forward to most is having you beside us on our wedding day. Your presence is the loveliest gift we could ask for.', gift:'If you would also like to give us a gift, you can help fill our honeymoon with memories: new places, little discoveries and adventures together.', thanks:'Thank you for being part of our story.', love:'With all our love,', details:'For our honeymoon', holder:'Account holder', copy:'Copy IBAN', copied:'IBAN copied', fallback:'You can select the IBAN and copy it manually.', placeholder:'Preview: the account holder and IBAN will appear here.', alt:'Chiara and Yago kissing on a stone bridge surrounded by green mountains.', caption:'And so many places still to discover together.'}
  };
  const filmWords = {es:{filmTitle:'Nuestra invitación, en movimiento',filmIntro:'Un pequeño recuerdo de cómo empieza esta historia.'},it:{filmTitle:'Il nostro invito prende vita',filmIntro:'Un piccolo ricordo di come inizia questa storia.'},en:{filmTitle:'Our invitation comes to life',filmIntro:'A little keepsake of where this story begins.'}};
  let cleanup = () => {};
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.WeddingHoneymoon = {
    nav: language => words[language].nav,
    render(language,heading) {
      const w={...words[language],...filmWords[language]}, account=window.HONEYMOON_ACCOUNT || {};
      const iban=String(account.iban || '').replace(/\s/g,'').toUpperCase();
      const ready=Boolean(iban && account.holder);
      return `<section class="page honeymoon-page">${heading(w.title,w.intro)}<div class="honeymoon-layout">
<div class="honeymoon-letter"><div class="letter-envelope"><span class="photo-envelope-stage"><span class="photo-envelope-scene"><span class="photo-shell-back"><img class="photo-envelope-back" src="assets/honeymoon/envelope-open-paper.webp" alt=""><span class="photo-envelope-lid"><img src="assets/honeymoon/envelope-open-paper.webp" alt=""></span></span><div id="honeymoon-letter" class="live-letter-window" inert><article class="letter-paper"><div class="letter-artwork"><div class="letter-couple"><img src="assets/honeymoon/invitation-garden-watercolor.webp" alt="" width="1600" height="533"></div><div class="letter-date">ROMA <span>·</span> 03 LUGLIO 2027</div></div><p class="letter-greeting">${w.greeting}</p><p>${w.body}</p><p>${w.gift}</p><p>${w.thanks}</p><p class="letter-signoff">${w.love}<span>Chiara &amp; Yago</span></p>
            <section class="honeymoon-bank" aria-labelledby="honeymoon-bank-title"><p class="eyebrow">Chiara &amp; Yago</p><h2 id="honeymoon-bank-title">${w.details}</h2><div class="honeymoon-bank-content">${ready?`<dl><dt>${w.holder}</dt><dd>${escape(account.holder)}</dd><dt>IBAN</dt><dd class="honeymoon-iban" tabindex="0">${escape(iban.match(/.{1,4}/g).join(' '))}</dd></dl><button class="button secondary copy-honeymoon-iban" type="button">${w.copy}</button><p class="copy-feedback" role="status" aria-live="polite"></p>`:`<dl class="honeymoon-placeholder-details"><dt>${w.holder}</dt><dd>—</dd><dt>IBAN</dt><dd class="honeymoon-iban">•••• •••• •••• •••• •••• ••••</dd></dl><p class="honeymoon-placeholder">${w.placeholder}</p>`}</div></section>
          </article></div><span class="photo-shell-front"><img class="photo-envelope-pocket" src="assets/honeymoon/envelope-open-paper.webp" alt=""><img class="photo-whole-ribbon" src="assets/honeymoon/silk-flowers.webp" alt=""><span class="photo-original-seal"><img src="assets/honeymoon/envelope-cutout.webp" alt=""></span></span><img class="photo-envelope-closed" src="assets/honeymoon/envelope-cutout.webp" alt="" width="1588" height="990"></span></span><button type="button" class="envelope-trigger" aria-expanded="false" aria-controls="honeymoon-letter honeymoon-reveal"><span class="envelope-open-label">${w.open}</span><span class="envelope-close-label">${w.close}</span><span class="envelope-hint">${w.hint}</span></button><div id="honeymoon-reveal" class="honeymoon-reveal" hidden><section class="invitation-keepsake" aria-labelledby="invitation-film-title"><div class="keepsake-heading"><span aria-hidden="true">✧</span><h2 id="invitation-film-title">${w.filmTitle}</h2><p>${w.filmIntro}</p></div><figure class="invitation-film"><video muted playsinline controls preload="none" poster="assets/honeymoon/invitation-poster.jpg" aria-label="Chiara &amp; Yago · 03.07.2027"><source src="assets/honeymoon/invitation.mp4" type="video/mp4"></video><figcaption>Chiara &amp; Yago <span>03 · 07 · 2027</span></figcaption></figure></section></div></div></div>
      </div></section>`;
    },
    init(root,language) {
      cleanup(); cleanup=()=>{};
      const envelope=root.querySelector('.letter-envelope');
      if(!envelope)return;
      const trigger=envelope.querySelector('.envelope-trigger');
      const reveal=envelope.querySelector('.honeymoon-reveal');
      const film=envelope.querySelector('video');
      const paper=envelope.querySelector('.letter-paper');
      const paperWindow=envelope.querySelector('.live-letter-window');
      const stage=envelope.querySelector('.photo-envelope-stage');
      const measure=()=>{if(paper)envelope.style.setProperty('--live-letter-height',paper.offsetHeight+'px');};
      measure();
      const observer=typeof ResizeObserver!=='undefined'&&paper?new ResizeObserver(measure):null;
      observer?.observe(paper);
      stage?.addEventListener('click',()=>{if(!opened)trigger.click();});
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      let timer,opened=false;
      const show=()=>{reveal.hidden=false;envelope.classList.add('letter-revealed');};
      trigger.addEventListener('click',()=>{
        measure();
        opened=!opened;if(paperWindow)paperWindow.inert=!opened;clearTimeout(timer);trigger.setAttribute('aria-expanded',String(opened));envelope.classList.toggle('is-open',opened);
        if(opened){if(reduced.matches)show();else timer=setTimeout(show,4100);}
        else{film.pause();film.currentTime=0;reveal.hidden=true;envelope.classList.remove('letter-revealed');}
      });
      const changeMotion=()=>{if(reduced.matches){clearTimeout(timer);film.pause();if(opened){reveal.hidden=false;envelope.classList.add('letter-revealed');}}};
      reduced.addEventListener('change',changeMotion);
      const button=root.querySelector('.copy-honeymoon-iban');
      button?.addEventListener('click',async()=>{
        const message=root.querySelector('.copy-feedback');
        try {await navigator.clipboard.writeText(String(window.HONEYMOON_ACCOUNT.iban).replace(/\s/g,'').toUpperCase());message.textContent=words[language].copied;}
        catch {message.textContent=words[language].fallback;}
      });
      cleanup=()=>{observer?.disconnect();clearTimeout(timer);film.pause();reduced.removeEventListener('change',changeMotion);};
    }
  };
})();





