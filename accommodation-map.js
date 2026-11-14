/* Geographic orientation, with deliberately simplified metro alignments.
   Network topology: ATAC's official metro map. See assets/hotel/sources.md. */
(() => {
  const points = [
    {id:'hotel',xy:[41.831043,12.574254],symbol:'♥'},
    {id:'church',xy:[41.882818,12.478637],symbol:'♥'},
    {id:'villa',xy:[41.7683288,12.557139],symbol:'♥'},
    {id:'cia',xy:[41.7994,12.5909],symbol:'✈'},
    {id:'fco',xy:[41.7946,12.2519],symbol:'✈'},
    {id:'metro',xy:[41.8487,12.5754],symbol:'M'}
  ];
  const termini=[41.9010,12.5010],colosseo=[41.8913,12.4914],sanGiovanni=[41.8853,12.5092],bologna=[41.9133,12.5200];
  const lines = [
    {name:'Metro A · Battistini ↔ Anagnina',color:'#c2662d',path:[[41.9063,12.4147],[41.8991,12.4302],[41.9035,12.4475],[41.9094,12.4578],[41.9115,12.4765],[41.9058,12.4822],[41.9039,12.4885],[41.9024,12.4956],termini,[41.8947,12.5041],sanGiovanni,[41.8815,12.5144],[41.8747,12.5267],[41.8695,12.5394],[41.8633,12.5483],[41.8567,12.5625],points[5].xy,[41.8429,12.5863]]},
    {name:'Metro B · Laurentina ↔ Rebibbia',color:'#396f9a',path:[[41.8269,12.4811],[41.8288,12.4707],[41.8335,12.4634],[41.8468,12.4637],[41.8565,12.4783],[41.8680,12.4832],[41.8757,12.4823],[41.8836,12.4880],colosseo,[41.8957,12.4936],termini,[41.9061,12.5051],[41.9089,12.5123],bologna,[41.9108,12.5302],[41.9200,12.5481],[41.9255,12.5557],[41.9294,12.5655],[41.9321,12.5731]]},
    {name:'Metro B1 · Bologna ↔ Jonio',color:'#396f9a',path:[bologna,[41.9230,12.5201],[41.9320,12.5189],[41.9458,12.5235],[41.9476,12.5277]]},
    {name:'Metro C · Colosseo ↔ Monte Compatri / Pantano',color:'#549165',path:[colosseo,[41.8814,12.5020],sanGiovanni,[41.8868,12.5166],[41.8891,12.5288],[41.8885,12.5419],[41.8803,12.5575],[41.8747,12.5679],[41.8693,12.5773],[41.8642,12.5878],[41.8640,12.6077],[41.8640,12.6328],[41.8620,12.6525],[41.8645,12.6800],[41.8657,12.7089]]}
  ];
  let cleanup=()=>{};
  const link=p=>`https://www.google.com/maps/search/?api=1&query=${p.xy.join(',')}`;
  window.WeddingTravelMap={
    render(w){return `<section class="hotel-map-section" aria-labelledby="hotel-map-title"><p class="eyebrow">Roma & dintorni</p><h2 id="hotel-map-title">${w.mapTitle}</h2><p>${w.mapIntro}</p><div class="hotel-map-toolbar"><button type="button" data-hotel-overview>${w.overview}</button><button type="button" data-hotel-local>${w.closeMap}</button></div><div id="hotel-map" class="hotel-map" role="region" aria-label="${w.mapTitle}"><p class="map-status">${w.loading}</p></div><div class="hotel-map-key"><span><i class="metro-a"></i>Metro A</span><span><i class="metro-b"></i>Metro B / B1</span><span><i class="metro-c"></i>Metro C</span><span><i class="shuttle-line"></i>${w.shuttle}</span></div><div class="hotel-map-places">${points.map((p,i)=>`<a href="${link(p)}" target="_blank" rel="noopener noreferrer">${p.symbol} ${w.places[i]} ↗</a>`).join('')}</div><p class="note">${w.mapNote}</p><a class="text-link" href="https://www.atac.roma.it/docs/default-source/mappe-tpl/mappa-metro-e-ferrovie-metropolitane.pdf" target="_blank" rel="noopener noreferrer">${w.official} ↗</a></section>`;},
    init(root,w){
      cleanup();cleanup=()=>{};
      const el=root.querySelector('#hotel-map');if(!el)return;
      const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
      const journey=root.querySelector('.bus-journey'),toggle=root.querySelector('.bus-toggle');
      let paused=reduce.matches;
      const setBus=()=>{journey.classList.toggle('bus-paused',paused);journey.classList.toggle('bus-user-motion',!paused);toggle.textContent=paused?w.play:w.pause;toggle.setAttribute('aria-pressed',String(paused));};
      setBus();toggle.addEventListener('click',()=>{paused=!paused;setBus();});
      const onMotion=()=>{paused=reduce.matches;setBus();};reduce.addEventListener('change',onMotion);
      let map,observer,sizeObserver;
      const fit=local=>map?.fitBounds((local?points.slice(0,3):points).map(p=>p.xy),{padding:[45,55],maxZoom:12,animate:!reduce.matches});
      const start=()=>{
        if(map)return;
        if(!window.L){el.querySelector('.map-status').textContent=w.unavailable;return;}
        el.replaceChildren();const L=window.L;
        map=L.map(el,{scrollWheelZoom:false,zoomControl:false,zoomAnimation:!reduce.matches,fadeAnimation:!reduce.matches});
        L.control.zoom({position:'topright'}).addTo(map);
        const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        let failures=0;tiles.on('tileerror',()=>{if(++failures<3||el.querySelector('.hotel-map-error'))return;const note=document.createElement('p');note.className='hotel-map-error';note.textContent=w.unavailable;el.append(note);});tiles.on('tileload',()=>el.querySelector('.hotel-map-error')?.remove());
        lines.forEach(line=>L.polyline(line.path,{color:line.color,weight:4,opacity:.85}).addTo(map).bindTooltip(line.name));
        L.polyline([points[0].xy,points[5].xy],{color:'#80628e',weight:4,dashArray:'7 7'}).addTo(map).bindTooltip(w.shuttle);
        [[termini,'Termini · A / B'],[colosseo,'Colosseo · B / C'],[sanGiovanni,'San Giovanni · A / C']].forEach(([xy,name])=>L.circleMarker(xy,{radius:4,color:'#555',weight:2,fillColor:'#fff',fillOpacity:1}).addTo(map).bindTooltip(name));
        points.forEach((p,i)=>{
          const icon=L.divIcon({className:'hotel-pin',html:`<span class="hotel-pin-${p.id}" aria-hidden="true">${p.symbol}</span>`,iconSize:[34,34],iconAnchor:[17,17]});
          L.marker(p.xy,{icon,title:w.places[i],alt:w.places[i],keyboard:true}).addTo(map).bindTooltip(w.places[i],{permanent:i<5,direction:i===0?'bottom':'top',offset:[0,i===0?16:-18],className:'hotel-map-label'}).bindPopup(`<strong>${w.places[i]}</strong><p><a href="${link(p)}" target="_blank" rel="noopener noreferrer">${w.directions} ↗</a></p>`);
        });
        fit(false);sizeObserver=new ResizeObserver(()=>map.invalidateSize({pan:false}));sizeObserver.observe(el);
      };
      if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start();observer.disconnect();}},{rootMargin:'200px'});observer.observe(el);}else start();
      root.querySelector('[data-hotel-overview]').addEventListener('click',()=>{start();fit(false);});
      root.querySelector('[data-hotel-local]').addEventListener('click',()=>{start();fit(true);});
      cleanup=()=>{observer?.disconnect();sizeObserver?.disconnect();map?.remove();reduce.removeEventListener('change',onMotion);};
    }
  };
})();
