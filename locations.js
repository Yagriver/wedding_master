/* Venue galleries and a shared Rome map. All venue content is static. */
(() => {
  const words = {
    es: {photos:'Ver fotos', hide:'Cerrar fotos', gallery:'Fotografías del lugar', mapTitle:'Dos lugares, una celebración', mapIntro:'Del Aventino a Villa Demetra. Toca un corazón para descubrir dónde nos encontraremos.', overview:'Ver ambos lugares', unavailable:'El mapa no está disponible ahora. Puedes abrir las indicaciones de cada lugar.', loading:'Cargando el mapa…', close:'Cerrar', previous:'Foto anterior', next:'Foto siguiente', photo:'Foto', of:'de', credit:'Fotografías', church:['El interior','La entrada','El altar'], villa:['El jardín','El salón','Una celebración en la villa']},
    it: {photos:'Guarda le foto', hide:'Chiudi le foto', gallery:'Fotografie del luogo', mapTitle:'Due luoghi, una festa', mapIntro:'Dall’Aventino a Villa Demetra. Tocca un cuore per scoprire dove ci ritroveremo.', overview:'Mostra entrambi i luoghi', unavailable:'La mappa non è disponibile al momento. Puoi aprire le indicazioni per ogni luogo.', loading:'Caricamento della mappa…', close:'Chiudi', previous:'Foto precedente', next:'Foto successiva', photo:'Foto', of:'di', credit:'Fotografie', church:['L’interno','L’ingresso','L’altare'], villa:['Il giardino','La sala','Un ricevimento in villa']},
    en: {photos:'View photos', hide:'Close photos', gallery:'Venue photographs', mapTitle:'Two places, one celebration', mapIntro:'From the Aventine to Villa Demetra. Tap a heart to see where we’ll celebrate together.', overview:'Show both places', unavailable:'The map is unavailable right now. You can still open directions for each venue.', loading:'Loading the map…', close:'Close', previous:'Previous photo', next:'Next photo', photo:'Photo', of:'of', credit:'Photography', church:['The interior','The entrance','The altar'], villa:['The garden','The dining room','A celebration at the villa']}
  };
  const venues = [
    {id:'church', name:'Sant’Anselmo', fullName:'Pontificio Ateneo Sant’Anselmo', address:'Piazza dei Cavalieri di Malta, 5', postcode:'00153 Roma, Italia', coordinates:[41.882818,12.478637], hero:'assets/church.jpg', query:'Pontificio Ateneo Sant Anselmo Roma', source:'https://santanselmoaventino.it/galleria/', credit:'Studio Fotografico Colizzi · Sant’Anselmo'},
    {id:'villa', name:'Villa Demetra', fullName:'Villa Demetra', address:'Via Ardeatina 1330A', postcode:'00134 Roma, Italia', coordinates:[41.7683288,12.557139], hero:'assets/villa.jpg', query:'Villa Demetra Ricevimenti Via Ardeatina 1330a Roma', source:'https://www.villademetraroma.it/wp/', credit:'Villa Demetra'}
  ];
  const directions = venue => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.query)}`;
  const photoPath = (id, index) => `assets/venues/${id}-${index+1}.webp`;
  let cleanup = () => {};

  window.WeddingLocations = {
    render(t, language, heading) {
      const w = words[language];
      return `<section class="page locations-page">${heading(t.locationsTitle,t.locationsIntro)}
        ${venues.map((venue, index) => `<section class="venue-section" aria-labelledby="${venue.id}-title">
          <article class="venue ${index ? 'venue-reversed' : ''}">
            <div class="venue-visual"><img src="${venue.hero}" alt="${venue.fullName}" width="800" height="600" ${index ? 'loading="lazy"' : ''}></div>
            <div class="venue-copy"><p class="eyebrow">0${index+1} · ${index ? t.reception : t.ceremony}</p><h2 id="${venue.id}-title">${venue.fullName}</h2><p>${index ? t.villaText : t.churchText}</p><p class="address">${venue.address}<br>${venue.postcode}</p><a class="button secondary" href="${directions(venue)}" target="_blank" rel="noopener noreferrer">${t.maps}</a></div>
          </article>
          <details class="venue-gallery"><summary><span class="gallery-label-open">${w.photos}</span><span class="gallery-label-close">${w.hide}</span><span class="gallery-count">03</span><span class="gallery-plus" aria-hidden="true">+</span></summary>
            <div class="gallery-content"><div class="venue-gallery-grid" aria-label="${w.gallery} · ${venue.name}">${w[venue.id].map((caption,i)=>`<button type="button" class="gallery-photo" data-venue="${venue.id}" data-photo="${i}" aria-label="${venue.name} · ${caption}"><img src="${photoPath(venue.id,i)}" alt="${venue.name} · ${caption}" loading="lazy" width="1000" height="750"><span>${caption}</span></button>`).join('')}</div><p class="photo-credit">${w.credit}: <a href="${venue.source}" target="_blank" rel="noopener noreferrer">${venue.credit}</a></p></div>
          </details>
        </section>`).join('')}
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
      const w = words[language];
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
