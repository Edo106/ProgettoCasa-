import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchAuctionPage } from "../lib/pvp-auction-client";

function response(content: unknown[], overrides: Record<string, unknown> = {}) {
  return new Response(
    JSON.stringify({
      error: null,
      body: {
        content,
        number: 0,
        size: 1000,
        totalPages: 1,
        totalElements: content.length,
        numberOfElements: content.length,
        first: true,
        last: true,
        ...overrides,
      },
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

const property = {
  id: 123,
  tipoLotto: "IMMOBILI",
  categoriaLotto: "IMMOBILE_RESIDENZIALE",
  descLotto: "Appartamento",
  indirizzo: { descComune: "Roma", descProvincia: "Roma", via: null },
  prezzoBaseAsta: 100000.5,
  dataOraVendita: "2026-07-01T10:00",
  esito: null,
};

test("maps property results and skips known non-property lots", async () => {
  const page = await fetchAuctionPage(0, async () =>
    response([property, { id: 124, tipoLotto: "MOBILI" }]),
  );
  assert.equal(page.sourceIds.length, 2);
  assert.equal(page.records.length, 1);
  assert.equal(page.records[0].sourceUrl, "https://pvp.giustizia.it/pvp/it/detail_annuncio.page?idAnnuncio=123");
  const auctionAt = page.records[0].auctionAt;
  assert.ok(auctionAt instanceof Date);
  assert.equal(auctionAt.toISOString(), "2026-07-01T08:00:00.000Z");
  assert.equal(page.records[0].status, null);
});

test("rejects malformed, unknown, and inconsistent source results", async () => {
  await assert.rejects(
    fetchAuctionPage(0, async () => response([{ ...property, tipoLotto: "UNKNOWN" }])),
    /classification/i,
  );
  await assert.rejects(
    fetchAuctionPage(0, async () => response([{ ...property, prezzoBaseAsta: -1 }])),
    /price/i,
  );
  await assert.rejects(
    fetchAuctionPage(0, async () => response([property], { number: 1 })),
    /page/i,
  );
});

test("stops on rate limits without retrying", async () => {
  let calls = 0;
  await assert.rejects(
    fetchAuctionPage(0, async () => {
      calls++;
      return new Response(null, { status: 429 });
    }),
    /rate limit/i,
  );
  assert.equal(calls, 1);
});
