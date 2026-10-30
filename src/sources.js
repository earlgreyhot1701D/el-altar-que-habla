export const sources = {
  inpi: {
    publisher: "INPI · Government of Mexico",
    name: {
      en: "The meaning of elements in a Day of the Dead offering",
      es: "¿Conoces el significado de los elementos de una ofrenda de Día de Muertos?"
    },
    description: {
      en: "Official National Institute of Indigenous Peoples analysis on water, candles, copal, flowers, food and remembrance. Note: Protected by government anti-bot verification.",
      es: "Análisis del Instituto Nacional de los Pueblos Indígenas sobre el agua, las velas, el copal, las flores, los alimentos y la memoria. Nota: Protegido por verificación anti-bot oficial."
    },
    url: "https://www.gob.mx/inpi/articulos/conoces-el-significado-de-los-elementos-de-una-ofrenda-de-dia-de-muertos?_amp=true"
  },
  inah: {
    publisher: "INAH · Mexico",
    name: {
      en: "Offerings for the dead",
      es: "Ofrendas para los muertos"
    },
    description: {
      en: "Authoritative National Institute of Anthropology and History overview documenting traditional offerings, regional diversity, and family customs.",
      es: "Reseña oficial del Instituto Nacional de Antropología e Historia documentando los elementos tradicionales, la diversidad regional y las costumbres familiares."
    },
    url: "https://www.inah.gob.mx/foto-del-dia/ofrendas-para-los-muertos"
  },
  unesco: {
    publisher: "UNESCO · Intangible Cultural Heritage",
    name: {
      en: "Indigenous festivity dedicated to the dead",
      es: "Festividad indígena dedicada a los muertos"
    },
    description: {
      en: "UNESCO Intangible Cultural Heritage inscription (00054) recognizing Mexican commemorative rites, community remembrance, and seasonal harvest practices.",
      es: "Inscripción en el Patrimonio Cultural Inmaterial de la UNESCO (00054) reconociendo los ritos conmemorativos mexicanos, el recuerdo comunitario y las cosechas."
    },
    url: "https://ich.unesco.org/en/RL/dia-de-muertos-the-indigenous-festivity-dedicated-to-the-dead-00054"
  },
  alas: {
    publisher: "Secretaría de Cultura · Alas y Raíces",
    name: { en: "Interactive ofrenda", es: "Ofrenda interactiva" },
    description: { en: "An interactive ofrenda that includes sugar and chocolate skulls. Referenced here for the chocolate-skull note.", es: "Una ofrenda interactiva que incluye calaveras de azúcar y chocolate. Se cita aquí para la nota sobre las calaveras de chocolate." },
    url: "https://alasyraices.gob.mx/ofrenda-interactiva/"
  },
  monarch: {
    publisher: "UNESCO · Man and the Biosphere Programme",
    name: { en: "Monarch butterfly", es: "Mariposa Monarca" },
    description: { en: "UNESCO describes the association with remembrance in Purépecha tradition and arrival around Día de Muertos.", es: "La UNESCO describe la asociación con el recuerdo en la tradición purépecha y la llegada en torno al Día de Muertos." },
    url: "https://www.unesco.org/mab/50anniversary/es/mariposa-monarca"
  },
  levels: {
    publisher: "Government of the State of Mexico (Archival Notice)",
    name: {
      en: "Day of the Dead: altars and levels",
      es: "Día de Muertos: altares y niveles"
    },
    description: {
      en: "Regional state portal documentation on two-, three-, and seven-level altar tiers. Notice: Regional state server frequently experiences gateway timeouts.",
      es: "Documentación regional sobre altares de dos, tres y siete niveles. Aviso: El servidor estatal regional suele presentar tiempos de espera agotados."
    },
    url: "https://edomex.gob.mx/dia-de-muertos"
  }
};

export const itemSourceMap = {
  flowers: ["inah", "inpi", "unesco"],
  photo: ["inah"],
  candles: ["inah", "inpi"],
  bread: ["inah", "inpi"],
  paper: ["inah", "unesco"],
  copal: ["inpi", "inah"],
  water: ["inpi", "inah"]
};
