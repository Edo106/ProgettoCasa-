---
description: Data model for auction snapshots and synchronization
---

# Data Model: Property Auction Dashboard

## Auction Snapshot

An immutable collection of property announcements produced by one completed
source traversal.

* `id`: Unique internal identifier
* `collectionId`: Identifies the collection owning this snapshot
* `createdAt`: Start time of the collection
* `completedAt`: Completion time; absent until traversal succeeds
* `retiredAt`: Time the snapshot was replaced, nullable while active
* `sourceRecordCount`: Total upstream records observed for the traversal
* `propertyRecordCount`: Number of normalized property announcements
* `state`: `collecting`, `complete`, or `failed`

Only a completed snapshot can be published. A complete snapshot may contain
zero property records; an incomplete or failed one must never be published.

## Auction Announcement

Each row belongs to one snapshot and represents one source announcement.

* `snapshotId`: Owning snapshot
* `sourceId`: Source announcement identifier, unique within a snapshot
* `sourceUrl`: Verified corresponding original announcement URL
* `description`: Property description, nullable
* `city`, `province`, and `address`: Location fields, nullable
* `startingPrice`: Nonnegative decimal amount in euros, nullable
* `auctionAt`: Sale date and time as an instant when supplied and interpretable,
  nullable
* `status`: Source status or outcome, nullable
* `propertyCategory`: Source classification used to identify a property

Add a unique constraint on `(snapshotId, sourceId)` and indexes supporting
snapshot-scoped city, price, date, and deterministic pagination queries.
Values absent from the source remain null. Never fabricate a source URL from
an identifier whose meaning is not established by the adapter.

## Synchronization Run

An attempt to collect and publish one snapshot.

* `id` and `snapshotId`: Run identity and target snapshot
* `startedAt` and `finishedAt`: Attempt timestamps
* `state`: `running`, `succeeded`, or `failed`
* `errorSummary`: Sanitized failure reason, nullable
* `leaseOwner`, `leaseExpiresAt`, and `fencingToken`: Exclusive-run control
* `pagesProcessed` and `recordsProcessed`: Progress for operational diagnosis

Only one live run may publish at a time. Use an atomic database lease with
expiry and a monotonically increasing fencing token: an expired or superseded
worker cannot publish even if it resumes. A later run may reclaim an expired
lease and records the abandoned run as failed.

## Published Collection State

A singleton record points to the current complete snapshot and records the
latest attempt outcome and last complete update time.

* `activeSnapshotId`: Nullable pointer to a completed snapshot
* `lastSuccessfulAt`: Nullable completion time
* `latestRunId` and `latestRunState`: Latest attempt and outcome

In one database transaction, validate the run's active lease and fencing token,
mark its snapshot complete, update the pointer and timestamps, and mark the run
succeeded. Failed runs leave the pointer unchanged. An expired lease cannot
commit publication.

## Lifecycle and Retention

1. A scheduler starts a run and acquires the lease.
2. The worker collects pages into an isolated snapshot and checks pagination,
   record identities, classification, and required mappings.
3. If checks pass, the worker publishes the snapshot atomically. Otherwise it
   marks the run and snapshot failed and leaves the previous snapshot active.
4. Dashboard pagination retains the snapshot identifier for a browsing session.
   Keep prior complete snapshots for at least 24 hours after replacement;
   expired snapshot links show an explicit refresh-results message.
5. Cleanup removes failed and expired snapshots only when they are neither
   active nor needed by an unexpired browsing session.

Publishing a locally complete traversal does not prove a stable upstream
snapshot: offset pagination may shift while records change.
