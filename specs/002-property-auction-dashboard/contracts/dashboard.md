---
description: Dashboard and source synchronization contracts
---

# Contracts: Property Auction Dashboard

## Dashboard Route

`GET /aste` renders the public dashboard using the published snapshot. It
accepts these optional query parameters:

* `city`: Case-insensitive city substring after trimming
* `minPrice` and `maxPrice`: Inclusive nonnegative decimal euro amounts
* `fromDate` and `toDate`: Inclusive calendar dates in `YYYY-MM-DD` form
* `page`: Positive, one-based dashboard page number, default `1`
* `snapshot`: Snapshot identifier used to keep subsequent pages consistent

Dates refer to the Europe/Rome calendar day. Combined filters use logical AND.
Rows missing a field required by a selected filter are excluded. Reject invalid
numbers, dates, and reversed ranges with an inline error and do not apply the
invalid filter. Clearing filters resets the page and snapshot selection.

Each result displays available description, location, starting price, auction
date, status, and a link to the corresponding original source announcement.
Missing fields are explicitly unavailable. Order by auction date and source ID
with missing dates last; the source ID is the stable tie-breaker.

The route distinguishes these states:

* No completed snapshot: Results unavailable
* Complete snapshot with no records: Empty collection
* Filters with no matching records: No matches with a clear-filters action
* Failed or incomplete latest run: Warning plus the last complete update time
* Last complete update older than 24 hours: Stale-results warning
* Expired requested snapshot: Explicit prompt to reload the latest results

The dashboard offers source links and an informational notice that the portal
is authoritative. It does not expose a synchronization trigger.

## PVP Search Adapter

The adapter sends POST requests to the user-supplied endpoint:

<https://pvp.giustizia.it/ric-496b258c-986a1b71/ric-ms/ricerca/vendite>

The supplied request used `language=it`, `page=1`, `size=48`, repeated `sort`
parameters for `dataOraVendita,asc` and `citta,asc`, and an empty JSON object.
The implementation starts at page `0` and requests `size=1000`, reducing the
number of requests; the portal returned that page size during implementation.
The response contained `body.content`, `body.totalPages`, `body.totalElements`,
`body.number`, `body.numberOfElements`, `body.first`, `body.last`, and `error`.
No authentication was sent in the observed request.

The adapter must use the source's actual page numbering and property
classification; neither may be guessed from one observed page. Validate types
at the boundary, follow every expected page, reject upstream errors, duplicate
IDs, changed page counts or totals, missing pages, inconsistent page metadata,
unrecognized classifications, and unresolvable original notice links. Apply
bounded retries and backoff for transient failures; stop on persistent errors,
access denial, or rate limiting rather than bypassing restrictions.

These checks do not prove source coverage or prevent all offset-pagination
shifts. Successful traversal is not evidence that all PVP announcements were
included in one consistent upstream snapshot.

## Synchronization Command

The planned command `npx tsx scripts/sync-auctions.ts` runs one synchronization
attempt using `DATABASE_URL`. It is not available until implementation.

* Exit `0` only after a snapshot is successfully published.
* Exit nonzero on lease contention, source errors, invalid data, or publication
  failure; record a sanitized diagnostic and leave the last snapshot intact.
* Allow an external scheduler to invoke it at least once every 24 hours.
* Never expose secrets or full source records in logs.
