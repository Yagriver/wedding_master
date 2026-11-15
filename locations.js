/* Venue galleries and a shared Rome map. All venue content is static. */
(() => {
  const words = {
    es: {photos:'Ver fotos', hide:'Cerrar fotos', gallery:'Fotografías del lugar', mapTitle:'Dos lugares, una celebración', mapIntro:'Del Aventino a Villa Demetra. Toca un corazón para descubrir dónde nos encontraremos.', overview:'Ver ambos lugares', unavailable:'El mapa no está disponible ahora. Puedes abrir las indicaciones de cada lugar.', loading:'Cargando el mapa…', close:'Cerrar', previous:'Foto anterior', next:'Foto siguiente', photo:'Foto', of:'de', credit:'Fotografías', church:['El interior','La entrada','El altar'], villa:['El jardín','El salón','Una celebración en la villa']},
    it: {photos:'Guarda le foto', hide:'Chiudi le foto', gallery:'Fotografie del luogo', mapTitle:'Due luoghi, una festa', mapIntro:'Dall’Aventino a Villa Demetra. Tocca un cuore per scoprire dove ci ritroveremo.', overview:'Mostra entrambi i luoghi', unavailable:'La mappa non è disponibile al momento. Puoi aprire le indicazioni per ogni luogo.', loading:'Caricamento della mappa…', close:'Chiudi', previous:'Foto precedente', next:'Foto successiva', photo:'Foto', of:'di', credit:'Fotografie', church:['L’interno','L’ingresso','L’altare'], villa:['Il giardino','La sala','Un ricevimento in villa']},
    en: {photos:'View photos', hide:'Close photos', gallery:'Venue photographs', mapTitle:'Two places, one celebration', mapIntro:'From the Aventine to Villa Demetra. Tap a heart to see where we’ll celebrate together.', overview:'Show both places', unavailable:'The map is unavailable right now. You can still open directions for each venue.', loading:'Loading the map…', close:'Close', previous:'Previous photo', next:'Next photo', photo:'Photo', of:'of', credit:'Photography', church:['The interior','The entrance','The altar'], villa:['The garden','The dining room','A celebration at the villa']}
  };
  const editorial = {
  "es": {
    "title": "Los lugares de nuestro día",
    "intro": "Dos escenarios para una misma historia: la calma del Aventino, un «sí, quiero» y una noche para celebrar juntos.",
    "church": [
      "El patio de Sant’Anselmo",
      "Entre arcos y columnas",
      "El camino hacia la iglesia"
    ],
    "villa": [
      "La entrada entre cipreses",
      "Una mesa bajo las luces",
      "Reflejos al atardecer"
    ],
    "chapters": [
      "Donde empieza nuestro para siempre",
      "Donde la noche se hace fiesta"
    ],
    "stories": [
      "En Sant’Anselmo, en lo alto del Aventino, nos encontraremos para vivir el momento más especial del día. Sus arcos, la luz y la serenidad de la iglesia serán el marco de nuestro «sí, quiero».",
      "Después nos espera Villa Demetra: luces de verano, brindis y una noche para reír y bailar con vosotros. El resto… preferimos que lo descubráis allí."
    ],
    "areas": [
      "Aventino · Roma",
      "Villa Demetra · Roma"
    ],
    "heroAlt": [
      "El altar de Sant’Anselmo preparado para una ceremonia",
      "Vista aérea nocturna de Villa Demetra, con la casa y los jardines iluminados"
    ],
    "detail": "Una mirada al lugar",
    "enlarge": "Ampliar fotografía",
    "address": "Dónde nos encontraremos",
    "bridge": "Del «sí, quiero» al último baile",
    "bridgeText": "La celebración continúa. Cambiamos de escenario, seguimos juntos.",
    "transport": "Venid a disfrutar; del trayecto nos encargamos nosotros.",
    "transportText": "Estamos organizando un autobús desde Hotel Piccolo Borgo a la iglesia, de la iglesia a la villa y de regreso al hotel por la noche. Compartiremos los horarios más adelante.",
    "transportLink": "Ver hotel y transportes",
    "poolNote": "La piscina forma parte del paisaje de la villa; durante la boda no estará habilitada para el baño."
  },
  "it": {
    "title": "I luoghi del nostro giorno",
    "intro": "Due scenari per un’unica storia: la quiete dell’Aventino, un «sì, lo voglio» e una notte da festeggiare insieme.",
    "church": [
      "Il cortile di Sant’Anselmo",
      "Tra archi e colonne",
      "Il viale verso la chiesa"
    ],
    "villa": [
      "L’ingresso tra i cipressi",
      "A tavola sotto le luci",
      "Riflessi al tramonto"
    ],
    "chapters": [
      "Dove comincia il nostro per sempre",
      "Dove la notte diventa festa"
    ],
    "stories": [
      "A Sant’Anselmo, in cima all’Aventino, ci ritroveremo per il momento più speciale della giornata. Gli archi, la luce e la serenità della chiesa faranno da cornice al nostro «sì, lo voglio».",
      "Poi ci aspetta Villa Demetra: luci d’estate, brindisi e una notte per ridere e ballare con voi. Il resto… preferiamo farvelo scoprire lì."
    ],
    "areas": [
      "Aventino · Roma",
      "Villa Demetra · Roma"
    ],
    "heroAlt": [
      "L’altare di Sant’Anselmo allestito per una cerimonia",
      "Veduta aerea notturna di Villa Demetra, con la casa e i giardini illuminati"
    ],
    "detail": "Uno sguardo al luogo",
    "enlarge": "Ingrandisci la fotografia",
    "address": "Dove ci incontreremo",
    "bridge": "Dal «sì, lo voglio» all’ultimo ballo",
    "bridgeText": "La festa continua. Cambia lo scenario, restiamo insieme.",
    "transport": "Voi pensate a festeggiare, al viaggio pensiamo noi.",
    "transportText": "Stiamo organizzando un pullman dall’Hotel Piccolo Borgo alla chiesa, dalla chiesa alla villa e di ritorno in hotel durante la notte. Condivideremo gli orari più avanti.",
    "transportLink": "Hotel e trasporti",
    "poolNote": "La piscina fa parte della cornice della villa; durante il matrimonio non sarà possibile fare il bagno."
  },
  "en": {
    "title": "The places of our day",
    "intro": "Two settings for one story: the quiet of the Aventine, an “I do”, and a night to celebrate together.",
    "church": [
      "The courtyard of Sant’Anselmo",
      "Among arches and columns",
      "The path to the church"
    ],
    "villa": [
      "The cypress-lined entrance",
      "A table beneath the lights",
      "Reflections at sunset"
    ],
    "chapters": [
      "Where our forever begins",
      "Where the evening becomes a celebration"
    ],
    "stories": [
      "We’ll meet at Sant’Anselmo, on the Aventine Hill, for the most special moment of the day. Its arches, light and peaceful atmosphere will be the setting for our “I do”.",
      "Then on to Villa Demetra: summer lights, toasts, and a night of laughter and dancing with you. The rest… we’ll let you discover when you get there."
    ],
    "areas": [
      "Aventine Hill · Rome",
      "Villa Demetra · Rome"
    ],
    "heroAlt": [
      "The altar of Sant’Anselmo prepared for a ceremony",
      "An aerial view of Villa Demetra at night, with the house and gardens illuminated"
    ],
    "detail": "A closer look",
    "enlarge": "Enlarge photograph",
    "address": "Where we’ll meet",
    "bridge": "From “I do” to the last dance",
    "bridgeText": "The celebration continues. A new setting, the same favourite people.",
    "transport": "Come and celebrate; we’ll take care of the journey.",
    "transportText": "We’re arranging a bus from Hotel Piccolo Borgo to the church, from the church to the villa, and back to the hotel at night. Timings will follow closer to the wedding.",
    "transportLink": "Hotel and transport",
    "poolNote": "The pool is part of the villa’s setting; it will not be open for swimming during the wedding."
  }
};
  const dimensions = {"church-hero":[1000,667],"church-1":[1000,667],"church-2":[1000,667],"church-3":[1000,667],"villa-hero":[1920,641],"villa-1":[1920,641],"villa-2":[1800,601],"villa-3":[1800,601]};
  const venues = [
    {id:'church', name:'Sant’Anselmo', fullName:'Pontificio Ateneo Sant’Anselmo', address:'Piazza dei Cavalieri di Malta, 5', postcode:'00153 Roma, Italia', coordinates:[41.882818,12.478637], hero:'assets/venues/curated/church-hero.webp', query:'Pontificio Ateneo Sant Anselmo Roma', source:'https://santanselmoaventino.it/galleria/', credit:'Studio Fotografico Colizzi · Sant’Anselmo'},
    {id:'villa', name:'Villa Demetra', fullName:'Villa Demetra', address:'Via Ardeatina 1330A', postcode:'00134 Roma, Italia', coordinates:[41.7683288,12.557139], hero:'assets/venues/curated/villa-overview-night.jpg', query:'Villa Demetra Ricevimenti Via Ardeatina 1330a Roma', source:'https://www.villademetraroma.it/wp/', credit:'Villa Demetra'}
  ];
  const directions = venue => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.query)}`;
  const photoPath = (id, index) => id === 'villa' && index === 0 ? 'assets/venues/curated/villa-entrance.jpg' : `assets/venues/curated/${id}-${index+1}${id === 'villa' ? '-v2' : ''}.webp`;
  let cleanup = () => {};

  window.WeddingLocations = {
    render(t, language, heading) {
      const w = {...words[language],...editorial[language]};
      return `<section class="page locations-page">${heading(w.title,w.intro)}
        <nav class="venue-jump-links" aria-label="${w.title}"><a href="#church-title" data-venue-jump="church-title">01 · Sant’Anselmo <span aria-hidden="true">↓</span></a><a href="#villa-title" data-venue-jump="villa-title">02 · Villa Demetra <span aria-hidden="true">↓</span></a></nav>
        ${venues.map((venue, index) => `${index ? `<div class="venue-interlude"><span aria-hidden="true">✧</span><p>${w.bridge}</p><small>${w.bridgeText}</small></div>` : ''}<section class="venue-section venue-editorial venue-editorial-${venue.id}" aria-labelledby="${venue.id}-title">
          <div class="venue-section-heading"><p class="eyebrow">0${index+1} · ${index ? t.reception : t.ceremony}</p><h2 id="${venue.id}-title" tabindex="-1">${venue.name}</h2><p class="venue-subtitle">${w.chapters[index]}</p></div>
          <figure class="venue-visual venue-feature"><img src="${venue.hero}" alt="${w.heroAlt[index]}" width="${dimensions[venue.id+'-hero'][0]}" height="${dimensions[venue.id+'-hero'][1]}" ${index ? 'loading="lazy"' : 'fetchpriority="high"'}><figcaption><span>${w.areas[index]}</span><span aria-hidden="true">0${index+1}</span></figcaption></figure>
          <div class="venue-copy venue-editorial-copy"><p class="venue-story">${w.stories[index]}</p><div class="venue-address-card"><p class="eyebrow">${w.address}</p><p class="address">${venue.address}<br>${venue.postcode}</p><a class="text-link" href="${directions(venue)}" target="_blank" rel="noopener noreferrer">${t.maps}</a></div></div>
          <section class="venue-curated-gallery" aria-label="${w.gallery} · ${venue.name}"><div class="venue-gallery-heading"><h3>${w.detail}</h3><span>${w.enlarge} ↗</span></div><div class="venue-gallery-grid">${w[venue.id].map((caption,i)=>`<button type="button" class="gallery-photo" data-venue="${venue.id}" data-photo="${i}" aria-label="${w.enlarge}: ${venue.name} · ${caption}"><img src="${photoPath(venue.id,i)}" alt="${caption}" loading="lazy" width="${dimensions[venue.id+'-'+(i+1)][0]}" height="${dimensions[venue.id+'-'+(i+1)][1]}"><span>${caption}<small aria-hidden="true">↗</small></span></button>`).join('')}</div>${index ? `<p class="venue-pool-note">${w.poolNote}</p>` : ''}<p class="photo-credit">${w.credit}: <a href="${venue.source}" target="_blank" rel="noopener noreferrer">${venue.credit}</a></p></section>
        </section>`).join('')}
        <aside class="venue-transport"><p class="eyebrow">Hotel Piccolo Borgo → Sant’Anselmo → Villa Demetra</p><h2>${w.transport}</h2><p>${w.transportText}</p><a class="text-link" href="#accommodation">${w.transportLink} →</a></aside>
        <section class="venue-map-section" aria-labelledby="venue-map-title"><div class="venue-map-heading"><p class="eyebrow">${t.city}</p><h2 id="venue-map-title">${w.mapTitle}</h2><p>${w.mapIntro}</p></div><div class="venue-map-frame"><div id="venue-map" class="venue-map" role="region" aria-label="${w.mapTitle}"><p class="map-status" role="status">${w.loading}</p></div></div>
          <div class="map-legend">${venues.map((v,i)=>`<button type="button" class="map-venue-button" data-map-venue="${v.id}"><span class="legend-heart ${i?'heart-villa':''}" aria-hidden="true">♥</span><span><small>${i?t.reception:t.ceremony}</small><strong>${v.name}</strong></span></button>`).join('')}<button class="map-overview" type="button">${w.overview}</button></div><p class="note">${t.timing}</p>
        </section>
        <dialog class="venue-lightbox" aria-label="${w.gallery}"><button type="button" class="lightbox-close" aria-label="${w.close}">×</button><div class="lightbox-image-wrap"><img alt=""></div><div class="lightbox-bottom"><button type="button" class="lightbox-previous" aria-label="${w.previous}">←</button><p aria-live="polite"></p><button type="button" class="lightbox-next" aria-label="${w.next}">→</button></div></dialog>
      </section>`;
    },
    init(root, language, t) {
      cleanup();
      cleanup = () => {};
      const mapElement = root.querySelector('#venue-map');
      if (!mapElement) return;
      const w = {...words[language],...editorial[language]};
      root.querySelectorAll('[data-venue-jump]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();const target=root.querySelector('#'+link.dataset.venueJump);target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});target.focus({preventScroll:true});}));
      const dialog = root.querySelector('.venue-lightbox');
      let currentVenue = venues[0], currentPhoto = 0, returnFocus;
      const updatePhoto = () => {
        const img = dialog.querySelector('img');
        img.src = photoPath(currentVenue.id,currentPhoto);
        img.alt = `${currentVenue.name} · ${w[currentVenue.id][currentPhoto]}`;
        dialog.querySelector('.lightbox-bottom p').textContent = `${img.alt} — ${currentPhoto+1} / 3`;
      };
      root.querySelectorAll('.gallery-photo').forEach(button => button.addEventListener('click', () => {
        currentVenue = venues.find(v=>v.id===button.dataset.venue);
        currentPhoto = Number(button.dataset.photo);
        returnFocus = button;
        updatePhoto();
        dialog.showModal();
      }));
      dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
      const advance = step => {currentPhoto=(currentPhoto+step+3)%3;updatePhoto();};
      dialog.querySelector('.lightbox-previous').addEventListener('click',()=>advance(-1));
      dialog.querySelector('.lightbox-next').addEventListener('click',()=>advance(1));
      dialog.addEventListener('keydown',event=>{
        if(event.key==='ArrowRight'){event.preventDefault();advance(1);}
        if(event.key==='ArrowLeft'){event.preventDefault();advance(-1);}
      });
      dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
      dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));

      let map, mapObserver, sizeObserver;
      const markers = {};
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      const overview = () => map?.fitBounds(venues.map(v=>v.coordinates), {padding:[55,65],maxZoom:12,animate:!reduced.matches});
      const startMap = () => {
        if(map) return;
        if(!window.L) { mapElement.querySelector('.map-status').textContent=w.unavailable; return; }
        mapElement.replaceChildren();
        map = L.map(mapElement,{scrollWheelZoom:false,zoomControl:false,fadeAnimation:!reduced.matches,zoomAnimation:!reduced.matches});
        L.control.zoom({position:'topright'}).addTo(map);
        const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        let failures=0;
        tiles.on('tileerror',()=>{
          if(++failures<3 || mapElement.querySelector('.map-tile-error'))return;
          const notice=document.createElement('p'); notice.className='map-tile-error';notice.textContent=w.unavailable;mapElement.append(notice);
        });
        tiles.on('tileload',()=>mapElement.querySelector('.map-tile-error')?.remove());
        venues.forEach((venue,i)=>{
          const icon=L.divIcon({className:'venue-heart-marker',html:`<span class="map-heart ${i?'heart-villa':''}" aria-hidden="true">♥</span>`,iconSize:[44,44],iconAnchor:[22,22],popupAnchor:[0,-24]});
          markers[venue.id]=L.marker(venue.coordinates,{icon,title:venue.name,alt:venue.name,keyboard:true}).addTo(map).bindTooltip(venue.name,{permanent:true,direction:'top',offset:[0,-24],className:'venue-map-label'}).bindPopup(`<strong>${venue.name}</strong><p>${venue.address}</p><a href="${directions(venue)}" target="_blank" rel="noopener noreferrer">${t.maps}</a>`);
        });
        overview();
        if('ResizeObserver' in window){sizeObserver=new ResizeObserver(()=>{map.invalidateSize({pan:false});});sizeObserver.observe(mapElement);}
      };
      if('IntersectionObserver' in window) {
        mapObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){startMap();mapObserver.disconnect();}},{threshold:.05});
        mapObserver.observe(mapElement);
      } else startMap();
      root.querySelectorAll('[data-map-venue]').forEach(button=>button.addEventListener('click',()=>{
        startMap();
        const venue=venues.find(v=>v.id===button.dataset.mapVenue);
        if(map){map.setView(venue.coordinates,14,{animate:!reduced.matches});markers[venue.id].openPopup();}
      }));
      root.querySelector('.map-overview').addEventListener('click',()=>{startMap();map?.closePopup();overview();});
      cleanup=()=>{mapObserver?.disconnect();sizeObserver?.disconnect();map?.remove();if(dialog.open)dialog.close();};
    }
  };
})();
