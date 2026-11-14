/* Guest-facing hotel details. See assets/hotel/sources.md for the offer and sources. */
(() => {
  const copy = {
    en: {
      title:'A little more time together', intro:'Come for the wedding, stay for a few lovely days in Rome. Here’s a place to settle in and share the weekend with us.', recommended:'Our recommended hotel',
      welcome:'We’d love to have you nearby! Hotel Piccolo Borgo will be our meeting point for the wedding weekend, and Yago will be staying here too. A leisurely breakfast, a dip in the pool, and familiar faces along the way…', nearby:'Chiara’s home and Villa Demetra are each about 10 minutes away by car. The hotel is also very close to Ciampino Airport.', website:'Explore the hotel', maps:'Directions', photos:['The hotel grounds','A standard room','Breakfast at the hotel'], credit:'Photos courtesy of the hotel’s official website',
      rates:'Your stay, at a glance', dates:'Guest rates · 2–4 July 2027', room:'Room', night:'Per room / night', double:'Standard double / single occupancy', triple:'Standard triple', included:'Breakfast, VAT, parking, Wi-Fi and pool access are included.', tax:'The hotel’s offer lists a separate city tax of €6 per person, per night, payable in addition to the room rate.', check:'Check-in from 15:00 · Check-out by 11:00', early:'Earlier check-in may be possible if your room is ready.',
      booking:'Make yourself at home', bookText:'Book directly with the hotel by email or phone, quoting our wedding reference to request these rates. Include your dates, the number of guests and your preferred room type.', reference:'Booking reference', email:'Email the hotel', terms:'Rooms are subject to availability. Reception will confirm your reservation, payment and cancellation conditions, and any credit-card guarantee required. For extra nights or other room types, please ask the hotel directly.',
      bus:'From the first “I do” to the last dance', busIntro:'We’re arranging a wedding bus so you can enjoy the whole celebration with us. It will leave from the hotel, take you to the church and then to the villa, and bring you back to the hotel at night.', route:['Hotel Piccolo Borgo','Sant’Anselmo · ceremony','Villa Demetra · celebration','Back to the hotel · at night'], busNote:'Departure times, meeting points and return arrangements will be shared here closer to the wedding.',
      travel:'Finding your way here', metro:'Exploring Rome', metroText:'The hotel offers a free shuttle to and from Cinecittà metro station, on line A. Check the latest timetable and arrange your journey with reception; seats are not guaranteed.', timetable:'Hotel shuttle timetable', cia:'From Ciampino (CIA)', ciaText:'The airport is very close to the hotel. Pick-up and drop-off are available on request: the wedding offer quotes €10 per person, each way. Arrange your transfer with reception in advance.', fco:'From Fiumicino (FCO)', fcoText:'The hotel can arrange a taxi or private transfer; the offer quotes €75 per journey for a pre-booked private transfer. Confirm the price and vehicle capacity with reception. By public transport: take the Leonardo Express train to Roma Termini, then metro A towards Anagnina to Cinecittà, followed by the hotel shuttle.', travelNote:'Airport transfers and the metro shuttle are separate from our wedding bus. Confirm transfer availability and current prices with the hotel when booking.', source:'Hotel travel information', choice:'Staying somewhere else?', choiceText:'Of course, choose whatever feels right for you. If you’d like to use the wedding bus, plan to meet us at Hotel Piccolo Borgo; we’ll share the details here.'
    },
    es: {
      title:'Un poquito más de tiempo juntos', intro:'Venid por la boda y quedaos unos días para disfrutar de Roma. Un lugar donde instalaros y compartir el fin de semana con nosotros.', recommended:'Nuestro hotel recomendado',
      welcome:'¡Nos encantará teneros cerca! El Hotel Piccolo Borgo será nuestro punto de encuentro durante el fin de semana de la boda, y Yago también se alojará aquí. Un desayuno sin prisas, un baño en la piscina y muchas caras conocidas…', nearby:'La casa de Chiara y Villa Demetra están, cada una, a unos 10 minutos en coche. El hotel también está muy cerca del aeropuerto de Ciampino.', website:'Descubrir el hotel', maps:'Cómo llegar', photos:['El exterior del hotel','Una habitación estándar','El desayuno en el hotel'], credit:'Fotografías de la web oficial del hotel',
      rates:'Vuestra estancia, de un vistazo', dates:'Tarifas para invitados · 2–4 de julio de 2027', room:'Habitación', night:'Por habitación / noche', double:'Doble estándar / uso individual', triple:'Triple estándar', included:'Incluyen desayuno, IVA, aparcamiento, wifi y acceso a la piscina.', tax:'La oferta del hotel indica una tasa turística adicional de 6 € por persona y noche, que se paga aparte.', check:'Entrada desde las 15:00 · Salida hasta las 11:00', early:'Si la habitación está lista, podréis entrar antes.',
      booking:'Como en casa', bookText:'Reservad directamente por correo o teléfono, indicando nuestra referencia de boda para solicitar estas tarifas. Incluid las fechas, el número de personas y el tipo de habitación que preferís.', reference:'Referencia para la reserva', email:'Escribir al hotel', terms:'Las habitaciones están sujetas a disponibilidad. Recepción confirmará la reserva, las condiciones de pago y cancelación y la garantía con tarjeta que corresponda. Para otras habitaciones o noches adicionales, consultad directamente con el hotel.',
      bus:'Del «sí, quiero» al último baile', busIntro:'Estamos organizando un autobús para que podáis disfrutar de toda la celebración con nosotros. Saldrá del hotel hacia la iglesia, nos llevará después a la villa y os traerá de vuelta al hotel por la noche.', route:['Hotel Piccolo Borgo','Sant’Anselmo · ceremonia','Villa Demetra · celebración','Regreso al hotel · por la noche'], busNote:'Más cerca de la boda compartiremos aquí los horarios, los puntos de encuentro y los detalles del regreso.',
      travel:'Cómo llegar y moverse', metro:'Para descubrir Roma', metroText:'El hotel ofrece una lanzadera gratuita de ida y vuelta a la estación de metro Cinecittà, de la línea A. Consultad el horario actualizado y coordinad el trayecto con recepción; las plazas no están garantizadas.', timetable:'Horarios de la lanzadera del hotel', cia:'Desde Ciampino (CIA)', ciaText:'El aeropuerto está muy cerca del hotel. Hay recogida y traslado bajo petición: la oferta de la boda indica 10 € por persona y trayecto. Reservad con recepción con antelación.', fco:'Desde Fiumicino (FCO)', fcoText:'El hotel puede organizar un taxi o traslado privado; la oferta indica 75 € por trayecto para el traslado privado con reserva previa. Confirmad precio y capacidad con recepción. En transporte público: tren Leonardo Express hasta Roma Termini, metro A dirección Anagnina hasta Cinecittà y, desde allí, la lanzadera del hotel.', travelNote:'Los traslados al aeropuerto y la lanzadera al metro son servicios distintos de nuestro autobús de boda. Confirmad disponibilidad y precios actualizados con el hotel al reservar.', source:'Información de transporte del hotel', choice:'¿Preferís otro alojamiento?', choiceText:'Por supuesto, elegid lo que os venga mejor. Si queréis usar el autobús de la boda, contad con llegar al Hotel Piccolo Borgo como punto de encuentro; compartiremos los detalles aquí.'
    },
    it: {
      title:'Un po’ di tempo in più insieme', intro:'Venite per la festa, fermatevi per qualche giorno a Roma. Un posto dove sentirvi a casa e condividere con noi il weekend.', recommended:'L’hotel che vi consigliamo',
      welcome:'Ci piacerebbe avervi vicini! L’Hotel Piccolo Borgo sarà il nostro punto di ritrovo per il weekend del matrimonio, e anche Yago soggiornerà qui. Una colazione senza fretta, un tuffo in piscina e tanti volti amici…', nearby:'La casa di Chiara e Villa Demetra distano entrambe circa 10 minuti in auto. L’hotel è anche molto vicino all’aeroporto di Ciampino.', website:'Scoprite l’hotel', maps:'Come arrivare', photos:['Gli esterni dell’hotel','Una camera standard','La colazione in hotel'], credit:'Fotografie dal sito ufficiale dell’hotel',
      rates:'Il vostro soggiorno, in breve', dates:'Tariffe per gli invitati · 2–4 luglio 2027', room:'Camera', night:'Per camera / notte', double:'Standard doppia / uso singola', triple:'Tripla standard', included:'Sono inclusi colazione, IVA, parcheggio, Wi-Fi e accesso alla piscina.', tax:'Il preventivo dell’hotel indica una tassa di soggiorno di 6 € a persona a notte, da pagare a parte.', check:'Check-in dalle 15:00 · Check-out entro le 11:00', early:'Se la camera è pronta, sarà possibile entrare prima.',
      booking:'Sentitevi a casa', bookText:'Prenotate direttamente via email o telefono, indicando il nostro riferimento per richiedere le tariffe riservate. Specificate le date, il numero di ospiti e il tipo di camera desiderato.', reference:'Riferimento per la prenotazione', email:'Scrivete all’hotel', terms:'Le camere sono soggette a disponibilità. La reception confermerà la prenotazione, le condizioni di pagamento e cancellazione e l’eventuale carta di credito a garanzia. Per altre tipologie di camera o notti aggiuntive, contattate direttamente l’hotel.',
      bus:'Dal «sì, lo voglio» all’ultimo ballo', busIntro:'Stiamo organizzando un pullman per goderci insieme tutta la festa. Partirà dall’hotel per la chiesa, ci porterà poi alla villa e vi riaccompagnerà in hotel durante la notte.', route:['Hotel Piccolo Borgo','Sant’Anselmo · cerimonia','Villa Demetra · ricevimento','Rientro in hotel · di notte'], busNote:'Più avanti condivideremo qui gli orari, i punti di ritrovo e i dettagli del rientro.',
      travel:'Come arrivare e spostarsi', metro:'Alla scoperta di Roma', metroText:'L’hotel offre una navetta gratuita da e per la stazione di Cinecittà, sulla metro A. Consultate gli orari aggiornati e organizzate il tragitto con la reception; il posto non è garantito.', timetable:'Orari della navetta dell’hotel', cia:'Da Ciampino (CIA)', ciaText:'L’aeroporto è molto vicino all’hotel. Il trasferimento da e per l’aeroporto è disponibile su richiesta: il preventivo indica 10 € a persona a tratta. Organizzatelo in anticipo con la reception.', fco:'Da Fiumicino (FCO)', fcoText:'L’hotel può organizzare un taxi o un trasferimento privato; il preventivo indica 75 € a viaggio per il servizio NCC su prenotazione. Confermate prezzo e capienza con la reception. Con i mezzi pubblici: Leonardo Express fino a Roma Termini, metro A in direzione Anagnina fino a Cinecittà e poi navetta dell’hotel.', travelNote:'I trasferimenti aeroportuali e la navetta per la metro sono servizi separati dal pullman del matrimonio. Confermate disponibilità e tariffe aggiornate con l’hotel al momento della prenotazione.', source:'Informazioni sui trasporti dell’hotel', choice:'Preferite un’altra sistemazione?', choiceText:'Naturalmente, scegliete ciò che fa per voi. Se volete utilizzare il pullman del matrimonio, prevedete di raggiungerci all’Hotel Piccolo Borgo; condivideremo qui tutti i dettagli.'
    }
  };
  const additions = {
  "es": {
    "superior": "Doble superior",
    "quad": "Cuádruple",
    "joke": "Tenemos casi todo el pequeño borgo reservado para nosotros. Por un fin de semana, ¡lo de salir a saludar a los vecinos va a ser muy literal!",
    "photos": [
      "El borgo al caer la noche",
      "Una habitación estándar",
      "Desayunos sin prisa",
      "Un baño bajo las estrellas",
      "La habitación superior"
    ],
    "deadline": "Reservad hasta el 3 de mayo de 2027",
    "deadlineText": "Hasta esa fecha podéis beneficiaros de nuestras tarifas. Después, el hotel volverá a abrir las habitaciones al público general.",
    "payment": "Sin pago por adelantado",
    "cancel": "Podéis cancelar hasta 3 días antes de la llegada.",
    "terms": "Las habitaciones están sujetas a disponibilidad. El hotel solicita una tarjeta como garantía, sin pago por adelantado. Confirmad con recepción las condiciones de vuestra reserva y consultad por noches adicionales.",
    "pause": "Pausar autobús",
    "play": "Animar autobús",
    "mapTitle": "Todos nuestros caminos llevan a Roma",
    "mapIntro": "Nuestro pequeño punto de encuentro, los lugares de la boda y las conexiones para llegar sin perderse.",
    "mapNote": "Mapa orientativo: las líneas de metro están simplificadas y no muestran todas las paradas. La línea discontinua indica la conexión de la lanzadera, no su recorrido exacto. Confirmad con recepción el punto de recogida en Cinecittà.",
    "official": "Plano oficial del metro · ATAC",
    "overview": "Ver todo",
    "closeMap": "Hotel y boda",
    "shuttle": "Lanzadera gratuita",
    "unavailable": "No se ha podido cargar el mapa base. Podéis usar los enlaces de cada lugar.",
    "loading": "Cargando el mapa…",
    "directions": "Cómo llegar",
    "places": [
      "Hotel Piccolo Borgo",
      "Sant’Anselmo · iglesia",
      "Villa Demetra",
      "Ciampino · aeropuerto",
      "Fiumicino · aeropuerto",
      "Cinecittà · metro A"
    ]
  },
  "it": {
    "superior": "Doppia superior",
    "quad": "Quadrupla",
    "joke": "Abbiamo riservato quasi tutto il piccolo borgo per noi. Per un weekend, salutare i vicini sarà praticamente una riunione tra amici!",
    "photos": [
      "Il borgo al calar della sera",
      "Una camera standard",
      "Colazioni senza fretta",
      "Un tuffo sotto le stelle",
      "La camera superior"
    ],
    "deadline": "Prenotate entro il 3 maggio 2027",
    "deadlineText": "Fino a questa data potrete usufruire delle nostre tariffe. Dopo, l’hotel riaprirà le camere alle prenotazioni del pubblico.",
    "payment": "Nessun pagamento anticipato",
    "cancel": "Potete cancellare fino a 3 giorni prima dell’arrivo.",
    "terms": "Le camere sono soggette a disponibilità. È richiesta una carta di credito a garanzia, senza pagamento anticipato. Confermate con la reception le condizioni della prenotazione e le eventuali notti aggiuntive.",
    "pause": "Ferma il pullman",
    "play": "Anima il pullman",
    "mapTitle": "Tutte le nostre strade portano a Roma",
    "mapIntro": "Il nostro punto di ritrovo, i luoghi del matrimonio e i collegamenti per raggiungerci.",
    "mapNote": "Mappa orientativa: le linee metro sono semplificate e non mostrano tutte le fermate. La linea tratteggiata indica il collegamento della navetta, non il percorso esatto. Confermate con la reception il punto di ritrovo a Cinecittà.",
    "official": "Mappa ufficiale della metro · ATAC",
    "overview": "Mostra tutto",
    "closeMap": "Hotel e matrimonio",
    "shuttle": "Navetta gratuita",
    "unavailable": "La mappa di base non è disponibile. Potete usare i link dei singoli luoghi.",
    "loading": "Caricamento della mappa…",
    "directions": "Come arrivare",
    "places": [
      "Hotel Piccolo Borgo",
      "Sant’Anselmo · chiesa",
      "Villa Demetra",
      "Ciampino · aeroporto",
      "Fiumicino · aeroporto",
      "Cinecittà · metro A"
    ]
  },
  "en": {
    "superior": "Superior double",
    "quad": "Quadruple",
    "joke": "We’ve reserved almost the whole little borgo for ourselves. For one weekend, popping out to say hello to the neighbours will feel a lot like a reunion!",
    "photos": [
      "The borgo at dusk",
      "A standard room",
      "Unhurried breakfasts",
      "A dip under the stars",
      "The superior room"
    ],
    "deadline": "Book by 3 May 2027",
    "deadlineText": "Our guest rates are available until this date. Afterwards, the hotel will release the rooms for general booking.",
    "payment": "No advance payment",
    "cancel": "You can cancel up to 3 days before arrival.",
    "terms": "Rooms are subject to availability. The hotel requires a credit card as a guarantee, with no advance payment. Confirm your booking conditions and any extra nights with reception.",
    "pause": "Pause the bus",
    "play": "Animate the bus",
    "mapTitle": "All our roads lead to Rome",
    "mapIntro": "Our little meeting point, the wedding venues and the connections that bring us together.",
    "mapNote": "Orientation map: metro lines are simplified and do not show every station. The dashed line shows the shuttle connection, not its exact route. Confirm the Cinecittà pick-up point with reception.",
    "official": "Official metro map · ATAC",
    "overview": "Show everything",
    "closeMap": "Hotel and wedding",
    "shuttle": "Free hotel shuttle",
    "unavailable": "The base map could not load. You can use the links for each place.",
    "loading": "Loading the map…",
    "directions": "Directions",
    "places": [
      "Hotel Piccolo Borgo",
      "Sant’Anselmo · church",
      "Villa Demetra",
      "Ciampino · airport",
      "Fiumicino · airport",
      "Cinecittà · metro A"
    ]
  }
};
  const external = 'target="_blank" rel="noopener noreferrer"';
  window.WeddingAccommodation = { render(language, heading) {
    const w = {...(copy[language] || copy.en), ...(additions[language] || additions.en)};
    return `<section class="page accommodation-page">${heading(w.title,w.intro)}
      <section class="hotel-intro" aria-labelledby="hotel-title"><img class="hotel-hero" src="assets/hotel/borgo.webp" alt="${w.photos[0]}" width="1366" height="910" fetchpriority="high"><div class="hotel-copy"><p class="eyebrow">${w.recommended}</p><h2 id="hotel-title">Hotel Piccolo Borgo</h2><p>${w.welcome}</p><p class="hotel-joke">${w.joke}</p><p>${w.nearby}</p><p class="hotel-address">Via delle Capannelle, 134 · 00178 Roma</p><div class="hotel-actions"><a class="button" href="https://www.piccoloborgo.it/" ${external}>${w.website} ↗</a><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=Hotel+Piccolo+Borgo+Via+delle+Capannelle+134+Roma" ${external}>${w.maps} ↗</a></div></div></section>
      <div class="hotel-photos">${['pool','superior','room','breakfast'].map((name,i)=>`<figure><img src="assets/hotel/${name}.webp" alt="${w.photos[[3,4,1,2][i]]}" width="1366" height="910" loading="lazy"><figcaption>${w.photos[[3,4,1,2][i]]}</figcaption></figure>`).join('')}</div><p class="hotel-credit"><a href="https://www.piccoloborgo.it/en/" ${external}>${w.credit} ↗</a></p>
      <div class="hotel-booking-grid"><section aria-labelledby="hotel-rates"><p class="eyebrow">${w.dates}</p><h2 id="hotel-rates">${w.rates}</h2><table class="hotel-rates"><thead><tr><th scope="col">${w.room}</th><th scope="col">${w.night}</th></tr></thead><tbody><tr><th scope="row">${w.double}</th><td>€105</td></tr><tr><th scope="row">${w.superior}</th><td>€135</td></tr><tr><th scope="row">${w.triple}</th><td>€135</td></tr><tr><th scope="row">${w.quad}</th><td>€170</td></tr></tbody></table><div class="hotel-deadline"><strong>${w.deadline}</strong><p>${w.deadlineText}</p></div><p>${w.included}</p><p class="note">${w.tax}</p><p><strong>${w.check}</strong><br>${w.early}</p></section>
      <section class="hotel-book" aria-labelledby="hotel-book-title"><h2 id="hotel-book-title">${w.booking}</h2><p>${w.bookText}</p><ul class="hotel-promises"><li>${w.payment}</li><li>${w.cancel}</li></ul><p class="hotel-reference"><span>${w.reference}</span><strong>MATRIMONIO YAGO - CHIARA</strong></p><a class="button" href="mailto:reception@piccoloborgo.it?subject=MATRIMONIO%20YAGO%20-%20CHIARA">${w.email} ↗</a><p><a href="mailto:reception@piccoloborgo.it">reception@piccoloborgo.it</a><br><a href="tel:+390672907478">+39 06 72907478</a></p><p class="note">${w.terms}</p></section></div>
      <section class="wedding-bus" aria-labelledby="bus-title"><p class="eyebrow">03 · 07 · 2027</p><h2 id="bus-title">${w.bus}</h2><p>${w.busIntro}</p><div class="bus-journey"><div class="bus-road" aria-hidden="true"><div class="bus-carriage"><img src="assets/hotel/wedding-bus.svg" alt="" width="100" height="66"></div></div><ol class="hotel-route">${w.route.map((stop,i)=>`<li><span aria-hidden="true">0${i+1}</span>${stop}</li>`).join('')}</ol></div><button type="button" class="bus-toggle" aria-pressed="false">${w.pause}</button><p class="note">${w.busNote}</p></section>
      <section class="hotel-travel" aria-labelledby="hotel-travel-title"><h2 id="hotel-travel-title">${w.travel}</h2><div class="hotel-travel-grid"><article><h3>${w.cia}</h3><p>${w.ciaText}</p></article><article><h3>${w.fco}</h3><p>${w.fcoText}</p></article><article><h3>${w.metro}</h3><p>${w.metroText}</p><a class="text-link" href="https://www.piccoloborgo.it/data/file/orari-navetta.pdf" ${external}>${w.timetable} ↗</a></article></div><p class="note">${w.travelNote}</p><a class="text-link" href="https://www.piccoloborgo.it/location-contatti/" ${external}>${w.source} ↗</a></section>
      ${window.WeddingTravelMap.render(w)}<aside class="hotel-choice"><h3>${w.choice}</h3><p>${w.choiceText}</p></aside>
    </section>`;
  }, init(root,language) { window.WeddingTravelMap.init(root, {...copy[language],...additions[language]}); }};
})();
