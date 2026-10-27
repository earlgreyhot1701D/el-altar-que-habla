export const sources = {
  inpi: {
    publisher: "INPI · Government of Mexico",
    name: {
      en: "The meaning of elements in a Day of the Dead offering",
      es: "¿Conoces el significado de los elementos de una ofrenda de Día de Muertos?"
    },
    description: {
      en: "Mexican Indigenous Peoples institute guidance on water, candles, copal, flowers, food and remembrance.",
      es: "Explicaciones del INPI sobre el agua, las velas, el copal, las flores, los alimentos y la memoria."
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
      en: "A concise institutional overview of altar objects and the importance of regional differences.",
      es: "Una descripción institucional de los elementos de las ofrendas y las variaciones regionales."
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
      en: "Cultural context, remembrance and the return of loved ones in Indigenous Mexican traditions.",
      es: "Contexto cultural, memoria y el regreso de los seres queridos en tradiciones indígenas de México."
    },
    url: "https://ich.unesco.org/en/RL/dia-de-muertos-the-indigenous-festivity-dedicated-to-the-dead-00054"
  },
  levels: {
    publisher: "Government of the State of Mexico",
    name: {
      en: "Day of the Dead: altars and levels",
      es: "Día de Muertos: altares y niveles"
    },
    description: {
      en: "Examples of two-, three-, and seven-level altars; not a rule for every region.",
      es: "Ejemplos de altares de dos, tres y siete niveles; no es una regla universal."
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
