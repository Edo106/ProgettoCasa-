---
description: Requirements for a property auction announcement dashboard
---

# Feature Specification: Property Auction Dashboard

**Feature Branch**: `feat/Aste`

**Created**: 2026-11-23

**Status**: Draft

**Input**: Dashboard for property auction announcements from the Italian Ministry
of Justice's [public sales portal](https://pvp.giustizia.it/pvp/it/detail_annuncio.page?idAnnuncio=4630992).
The linked announcement is an example, not the only announcement in scope.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse auction announcements (Priority: P1)

A visitor opens the dashboard to discover property auction announcements
published on the public sales portal, without needing to know an announcement ID.

**Why this priority**: Discovering announcements is the core purpose of the dashboard.

**Independent Test**: Open the dashboard with a known set of portal announcements
and verify that each available property auction announcement can be reached.

**Acceptance Scenarios**:

1. **Given** available property auction announcements, **When** a visitor opens
   the dashboard, **Then** the visitor sees a browsable list with the available
   location, property description, auction date, starting price, and status for
   each announcement.
2. **Given** more announcements than fit in one view, **When** a visitor moves
   through the results, **Then** all available results can be reached without
   duplicate entries for the same source announcement.
3. **Given** no property auction announcements are available, **When** a visitor
   opens the dashboard, **Then** an empty-state message is shown rather than a
   misleading populated list.
4. **Given** a failed or incomplete update, **When** a visitor opens the
   dashboard, **Then** a warning and the last complete update time are shown,
   or an unavailable message is shown if no complete update exists.
5. **Given** a mobile or desktop screen, **When** a visitor browses the
   dashboard, **Then** the results and controls remain readable and usable without
   horizontal page scrolling.

### User Story 2 - Find relevant announcements (Priority: P2)

A visitor narrows the dashboard to announcements matching their preferred
location, price range, or auction date.

**Why this priority**: Filtering makes a potentially large national collection
useful to an individual visitor.

**Independent Test**: Apply and clear each filter against announcements with
known values and verify the resulting list.

**Acceptance Scenarios**:

1. **Given** announcements with different cities, starting prices, and auction
   dates, **When** a visitor applies one or more filters, **Then** only
   announcements matching all selected filters are shown.
2. **Given** filters that match no announcements, **When** results are shown,
   **Then** the visitor sees a no-results message and can clear the filters.
3. **Given** active filters, **When** the visitor clears them, **Then** the
   complete available list is restored.
4. **Given** a minimum price above the maximum or a start date after the end
   date, **When** the visitor applies the filters, **Then** the dashboard
   identifies the invalid range and does not apply it.

### User Story 3 - Verify an announcement at its source (Priority: P3)

A visitor opens the original announcement to verify its authoritative details
and access any additional information provided by the portal.

**Why this priority**: Auction details can change and the source remains
authoritative for decisions and participation.

**Independent Test**: Select an announcement from the dashboard and verify that
its source link points to the corresponding portal announcement.

**Acceptance Scenarios**:

1. **Given** an announcement in the dashboard, **When** a visitor selects its
   source link, **Then** the matching original announcement opens.
2. **Given** details missing from the source, **When** the announcement is shown,
   **Then** missing values are identified as unavailable and are not invented.

### Edge Cases

* If the source is unavailable, the dashboard shows a clear warning and the
  time of the last successful complete update; it does not claim that the
  results are current.
* If no complete update has succeeded, the dashboard explains that results
  are unavailable rather than displaying an empty-state message.
* If an update is incomplete, the dashboard retains the last complete results,
  warns that the latest update failed, and does not present partial results as
  a complete collection.
* If an announcement is removed from the source, it is removed from the
  dashboard after the next successful complete update.
* If an announcement has missing filter values, it remains visible without
  filters but is excluded from a filter that requires the missing value.
* If the last complete update is more than 24 hours old, results are marked
  stale even if no update failure has been reported.
* If the source changes the status, date, price, or other details of an
  announcement, the next successful complete update reflects the change.

## Requirements *(mandatory)*

### Functional Requirements

* FR-001: The dashboard MUST include all property auction announcements
  currently available through the source portal, including announcements with
  past dates or non-active statuses when the portal still makes them available.
* FR-002: The dashboard MUST allow visitors to browse every available
  announcement, without requiring an announcement ID.
* FR-003: Each announcement MUST display its available property description,
  location, starting price, auction date, and status, identifying missing values
  as unavailable.
* FR-004: Each announcement MUST provide a link to its corresponding original
  source announcement.
* FR-005: Visitors MUST be able to filter by city, inclusive minimum and maximum
  starting price, and inclusive start and end auction dates, combine these
  filters, and clear them. Invalid ranges MUST be identified and not applied.
* FR-006: The dashboard MUST show distinct messages for an empty collection,
  no filter matches, and unavailable results.
* FR-007: The dashboard MUST refresh the source collection at least once every
  24 hours and display the time of its last successful complete update.
* FR-008: The dashboard MUST show an update-failure warning when the latest
  refresh fails or is incomplete, retaining the last successful complete
  collection if one exists. Results older than 24 hours MUST be marked stale.
* FR-009: A successful complete refresh MUST reflect source additions, changes,
  and removals, and show each source announcement only once.
* FR-010: Results and controls MUST remain readable and usable without horizontal
  page scrolling at viewport widths of 320 and 1440 pixels.
* FR-011: The dashboard MUST present source information as informational and
  direct visitors to the source for authoritative details and participation.

## Project Impact *(complete when applicable)*

* User-facing screens: Add an auction dashboard accessible from the existing
  application navigation, without replacing the existing listing experience.
* Shared UI: The dashboard may reuse existing listing and filtering patterns.
* Application services: A source-collection capability is needed; its design
  belongs in the plan.
* API behavior: Any changes required to serve auction results are to be
  determined during planning.
* Persisted data: Announcements and update status may require persistence.
  Whether the existing data model changes is to be determined during planning.
* External integrations: The public sales portal is the announcement source.

### Key Entities *(include if feature involves data)*

* Auction announcement: A source-identified property auction notice with a
  source link, property information, location, price, date, and status.
* Collection update: The outcome and completion time of an attempt to update
  the dashboard's announcement collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

* SC-001: In a controlled comparison with a known complete source collection,
  100% of available property auction announcements are reachable on the
  dashboard, with no duplicate source announcements.
* SC-002: At least 90% of participants in a usability test find an
  announcement matching specified location and price criteria and open its
  source page within two minutes.
* SC-003: In a representative test of dashboard visits, 95% of initial result
  views and filter changes display their outcome within three seconds.
* SC-004: In tests of successful, failed, and incomplete updates, 100% of
  dashboard states correctly distinguish current results, stale results, and
  unavailable results.

## Assumptions

* The linked page is an example from the public sales portal. The intended scope
  is property auction announcements across the portal, not one announcement
  or a single geographic area.
* Only announcements the portal currently makes available are in scope.
  Recovering deleted or inaccessible historical records is excluded.
* Source access and reuse must comply with the portal's applicable terms,
  access restrictions, and legal requirements. Availability, complete
  enumeration, and permitted reuse must be confirmed during planning.
* The portal is authoritative; bidding, registration, notifications,
  favorites, and auction outcome prediction are outside this feature.
* Visitors use the application's existing access rules. No new account or
  permission model is required for browsing.
* A daily refresh is the default expectation; the displayed update time and
  warning make source delays visible.
