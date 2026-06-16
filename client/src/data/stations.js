export const stations = [
  { id:'s01', name:"Metan AZS №1 — Chilonzor",    lat:41.2995, lng:69.2401, district:"Chilonzor",       load:"free",   open:true  },
  { id:'s02', name:"Metan AZS №2 — Chilonzor",    lat:41.3050, lng:69.2280, district:"Chilonzor",       load:"medium", open:false },
  { id:'s03', name:"Metan AZS №3 — Yunusobod",    lat:41.3620, lng:69.3310, district:"Yunusobod",       load:"busy",   open:true  },
  { id:'s04', name:"Metan AZS №4 — Yunusobod",    lat:41.3700, lng:69.3450, district:"Yunusobod",       load:"free",   open:true  },
  { id:'s05', name:"Metan AZS №5 — Mirzo Ulug'bek", lat:41.3310, lng:69.3680, district:"Mirzo Ulug'bek", load:"medium", open:true  },
  { id:'s06', name:"Metan AZS №6 — Mirzo Ulug'bek", lat:41.3180, lng:69.3820, district:"Mirzo Ulug'bek", load:"busy",   open:false },
  { id:'s07', name:"Metan AZS №7 — Shayxontohur", lat:41.3230, lng:69.2760, district:"Shayxontohur",   load:"free",   open:true  },
  { id:'s08', name:"Metan AZS №8 — Shayxontohur", lat:41.3350, lng:69.2640, district:"Shayxontohur",   load:"medium", open:false },
  { id:'s09', name:"Metan AZS №9 — Uchtepa",      lat:41.3080, lng:69.2150, district:"Uchtepa",        load:"busy",   open:true  },
  { id:'s10', name:"Metan AZS №10 — Uchtepa",     lat:41.3150, lng:69.2050, district:"Uchtepa",        load:"free",   open:true  },
  { id:'s11', name:"Metan AZS №11 — Yakkasaroy",  lat:41.2880, lng:69.2720, district:"Yakkasaroy",     load:"medium", open:true  },
  { id:'s12', name:"Metan AZS №12 — Yakkasaroy",  lat:41.2820, lng:69.2850, district:"Yakkasaroy",     load:"free",   open:false },
  { id:'s13', name:"Metan AZS №13 — Bektemir",    lat:41.2650, lng:69.3550, district:"Bektemir",       load:"busy",   open:true  },
  { id:'s14', name:"Metan AZS №14 — Sergeli",     lat:41.2480, lng:69.2980, district:"Sergeli",        load:"free",   open:true  },
  { id:'s15', name:"Metan AZS №15 — Sergeli",     lat:41.2380, lng:69.3100, district:"Sergeli",        load:"medium", open:false },
  { id:'s16', name:"Metan AZS №16 — Olmazor",     lat:41.3450, lng:69.2520, district:"Olmazor",        load:"free",   open:true  },
  { id:'s17', name:"Metan AZS №17 — Olmazor",     lat:41.3520, lng:69.2400, district:"Olmazor",        load:"busy",   open:true  },
  { id:'s18', name:"Metan AZS №18 — Yashnobod",   lat:41.2960, lng:69.3280, district:"Yashnobod",      load:"medium", open:true  },
];

export const LOAD_CONFIG = {
  free:   { color:"#22c55e", label:"🟢 Navbat yo'q",    bg:"rgba(34,197,94,0.12)",  border:"rgba(34,197,94,0.4)"  },
  medium: { color:"#f59e0b", label:"🟡 O'rtacha navbat", bg:"rgba(245,158,11,0.12)", border:"rgba(245,158,11,0.4)" },
  busy:   { color:"#ef4444", label:"🔴 Katta navbat",   bg:"rgba(239,68,68,0.10)",  border:"rgba(239,68,68,0.35)" },
};

export function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
