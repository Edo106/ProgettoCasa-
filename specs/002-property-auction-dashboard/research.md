---
description: Source research and decisions for the auction dashboard
---

# Research: Property Auction Dashboard

**Date**: 2026-11-23

## Source Selection

Decision: Use the endpoint supplied by the user as the dashboard's source. The
user explicitly requested no further source verification during planning.

Rationale: A public search request succeeded without authentication and returned
paginated JSON containing fields relevant to auction listings.

Alternatives considered: A link-only experience would not meet filtering and
browsing requirements. BDAG has a different scope and access model.

The selected endpoint is:

<https://pvp.giustizia.it/ric-496b258c-986a1b71/ric-ms/ricerca/vendite?language=it&page=1&size=48&sort=dataOraVendita,asc&sort=citta,asc>

On 2026-11-23, GET returned HTTP 405. A POST with `{}` and no authentication
returned HTTP 200 and a paginated JSON response. That unfiltered request
reported 324,501 results, 6,761 pages, page number 1, and 48 records. These
figures change and are not a property-only count. The first-page indicator was
false for page number 1; the base index itself was not tested.

## Source Limitations

Decision: Record upstream capabilities and permissions as unverified, not as
claims established by successful access.

Rationale: The observed response provides no demonstrated snapshot token,
complete status coverage, property-only filter contract, stable pagination,
removal semantics, reuse permission, or rate limit. The official
[PVP guide](https://pvp.giustizia.it/pvp/it/guida.page) describes public search
and viewing; it does not establish those properties.

Alternatives considered: Assuming that page counts prove a complete consistent
snapshot was rejected. Counts and duplicate checks can detect some failures but
cannot detect all changes while records move between offset pages.

## Collection and Publication

Decision: Collect to an isolated snapshot, validate all expected pages and
identifiers, and publish via an atomic pointer only after successful traversal.
Retain the previous snapshot on failure. Mark results stale after 24 hours.

Rationale: Partial refreshes must not overwrite previously published data. The
snapshot protects dashboard readers against a half-written collection.

Alternatives considered: Updating live rows during traversal exposes partial
data and can remove records on a failed run. A single transaction around all
network requests would hold database resources for the duration of a long scan.
Neither approach guarantees a stable upstream snapshot.

## Scheduling and Persistence

Decision: Use the existing PostgreSQL and Prisma setup and a standalone sync
command invoked by an external daily scheduler. The production environment
and scheduler remain undecided.

Rationale: Request-driven refresh alone cannot ensure a daily attempt when no
one visits. Separate snapshot records preserve the existing `Listing` model
and its mandatory fields.

Alternatives considered: A second database or separate application introduces
unnecessary infrastructure; an in-process timer is unreliable across restarts
and multiple application instances.

## BDAG

Decision: Do not substitute BDAG for the selected endpoint.

Rationale: The Ministry's
[BDAG launch notice](https://pst.giustizia.it/PST/page/en/avvio_della_banca_date_asti_giudiziarie_bdag?contentId=NWS3570)
describes completed auctions for notices published from 28 October 2024. The
[BDAG manual](https://pst.giustizia.it/PST/resources/cms/documents/Manuale_Utente_Banca_Dati_Aste_Giudiziarie_v1.1_Delegato.pdf)
describes authorized access and CSV export, not the chosen public search flow.

Alternatives considered: BDAG does not establish coverage of all current
property notices.
