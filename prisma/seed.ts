import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const listings = [
  {
    title: "Bilocale ristrutturato in zona Navigli",
    description:
      "Bilocale luminoso al terzo piano con balcone, vicino a metropolitana e servizi principali.",
    price: 285000,
    city: "Milano",
    address: "Via Vigevano 22",
    squareMeters: 58,
    rooms: 2,
    bathrooms: 1,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/milano-navigli-001",
    sourceName: "Immobiliare.it",
  },
  {
    title: "Trilocale con terrazzo panoramico",
    description:
      "Appartamento in stabile recente con terrazzo vivibile, doppi servizi e posto auto coperto.",
    price: 365000,
    city: "Torino",
    address: "Corso Francia 110",
    squareMeters: 95,
    rooms: 3,
    bathrooms: 2,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.casa.it/annuncio/torino-francia-002",
    sourceName: "Casa.it",
  },
  {
    title: "Attico vista centro storico",
    description:
      "Attico elegante con ampie vetrate, cucina abitabile e vista aperta sul centro città.",
    price: 590000,
    city: "Bologna",
    address: "Via Indipendenza 61",
    squareMeters: 140,
    rooms: 4,
    bathrooms: 2,
    propertyType: "Attico",
    imageUrl: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.idealista.it/annuncio/bologna-attico-003",
    sourceName: "Idealista",
  },
  {
    title: "Villa bifamiliare con giardino",
    description:
      "Soluzione indipendente su due livelli, giardino privato e taverna, ideale per famiglie.",
    price: 720000,
    city: "Firenze",
    address: "Via Bolognese 180",
    squareMeters: 210,
    rooms: 6,
    bathrooms: 3,
    propertyType: "Villa",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/firenze-villa-004",
    sourceName: "Immobiliare.it",
  },
  {
    title: "Quadrilocale in palazzo d'epoca",
    description:
      "Ampia metratura con soffitti alti, finiture originali e doppia esposizione.",
    price: 430000,
    city: "Genova",
    address: "Via XX Settembre 75",
    squareMeters: 130,
    rooms: 4,
    bathrooms: 2,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.casa.it/annuncio/genova-epoca-005",
    sourceName: "Casa.it",
  },
  {
    title: "Monolocale investimento vicino università",
    description:
      "Monolocale arredato, ottimo rendimento locativo, a pochi minuti dal polo universitario.",
    price: 118000,
    city: "Padova",
    address: "Via Venezia 34",
    squareMeters: 32,
    rooms: 1,
    bathrooms: 1,
    propertyType: "Monolocale",
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.idealista.it/annuncio/padova-monolocale-006",
    sourceName: "Idealista",
  },
  {
    title: "Casa indipendente con corte privata",
    description:
      "Abitazione indipendente rinnovata con corte interna e deposito attrezzi.",
    price: 265000,
    city: "Bari",
    address: "Via Fanelli 12",
    squareMeters: 120,
    rooms: 4,
    bathrooms: 2,
    propertyType: "Casa indipendente",
    imageUrl: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/bari-casa-007",
    sourceName: "Immobiliare.it",
  },
  {
    title: "Trilocale moderno con box auto",
    description:
      "Appartamento recente in classe energetica A, box auto singolo e cantina.",
    price: 245000,
    city: "Verona",
    address: "Via Albere 19",
    squareMeters: 88,
    rooms: 3,
    bathrooms: 2,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.casa.it/annuncio/verona-trilocale-008",
    sourceName: "Casa.it",
  },
  {
    title: "Rustico con vista colline",
    description:
      "Rustico in pietra con terreno circostante, perfetto per chi cerca tranquillità.",
    price: 315000,
    city: "Perugia",
    address: "Località San Marco 8",
    squareMeters: 175,
    rooms: 5,
    bathrooms: 2,
    propertyType: "Rustico",
    imageUrl: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.idealista.it/annuncio/perugia-rustico-009",
    sourceName: "Idealista",
  },
  {
    title: "Villa a schiera con taverna",
    description:
      "Villetta su tre livelli con giardino frontale, taverna e posto auto doppio.",
    price: 338000,
    city: "Parma",
    address: "Via Langhirano 56",
    squareMeters: 160,
    rooms: 5,
    bathrooms: 3,
    propertyType: "Villa a schiera",
    imageUrl: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/parma-villaschiera-010",
    sourceName: "Immobiliare.it",
  },
  {
    title: "Bilocale fronte mare",
    description:
      "Bilocale con terrazza vista mare, ideale come seconda casa o investimento turistico.",
    price: 299000,
    city: "Cagliari",
    address: "Lungomare Poetto 4",
    squareMeters: 62,
    rooms: 2,
    bathrooms: 1,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.casa.it/annuncio/cagliari-mare-011",
    sourceName: "Casa.it",
  },
  {
    title: "Pentavani ristrutturato con balconi",
    description:
      "Ampio pentavani in zona servita con tre balconi e cucina abitabile.",
    price: 215000,
    city: "Catania",
    address: "Viale Mario Rapisardi 250",
    squareMeters: 145,
    rooms: 5,
    bathrooms: 2,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.idealista.it/annuncio/catania-pentavani-012",
    sourceName: "Idealista",
  },
  {
    title: "Loft open space in ex area industriale",
    description:
      "Loft di design con soppalco, grandi finestre e finiture contemporanee.",
    price: 410000,
    city: "Milano",
    address: "Via Tortona 18",
    squareMeters: 105,
    rooms: 3,
    bathrooms: 2,
    propertyType: "Loft",
    imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/milano-loft-013",
    sourceName: "Immobiliare.it",
  },
  {
    title: "Trilocale centrale vicino stazione",
    description:
      "Soluzione pronta da abitare, piano alto con ascensore e ottima luminosità.",
    price: 198000,
    city: "Napoli",
    address: "Via Toledo 210",
    squareMeters: 84,
    rooms: 3,
    bathrooms: 1,
    propertyType: "Appartamento",
    imageUrl: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.casa.it/annuncio/napoli-trilocale-014",
    sourceName: "Casa.it",
  },
  {
    title: "Casale con dependance e terreno",
    description:
      "Casale ristrutturato con dependance indipendente e terreno agricolo recintato.",
    price: 540000,
    city: "Siena",
    address: "Strada del Petriccio 11",
    squareMeters: 240,
    rooms: 7,
    bathrooms: 3,
    propertyType: "Casale",
    imageUrl: "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
    sourceUrl: "https://www.immobiliare.it/annuncio/siena-casale-015",
    sourceName: "Inserimento manuale",
  },
];

async function main() {
  await prisma.listing.deleteMany();
  await prisma.listing.createMany({ data: listings });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
