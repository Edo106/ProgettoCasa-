import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AuctionCard } from "../components/auction-card";

test("shows unavailable fields and links to the original announcement", () => {
  const html = renderToStaticMarkup(
    <AuctionCard auction={{
      id: "card-1",
      snapshotId: "snapshot-1",
      sourceId: "123",
      sourceUrl: "https://pvp.giustizia.it/pvp/it/detail_annuncio.page?idAnnuncio=123",
      description: null,
      city: null,
      province: null,
      address: null,
      startingPrice: null,
      auctionAt: null,
      status: null,
      propertyCategory: "IMMOBILE_RESIDENZIALE",
    }} />,
  );
  assert.match(html, /Descrizione non disponibile/);
  assert.match(html, /Prezzo non disponibile/);
  assert.match(html, /Data asta:.*Non disponibile/);
  assert.match(html, /idAnnuncio=123/);
});
