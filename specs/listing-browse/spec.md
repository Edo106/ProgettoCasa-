# Feature Specification: Real-Estate Listing Browse, Filter, and Detail

**Feature Branch**: `feature/login`

**Created**: 2026-11-15

**Status**: migrated

**Input**: Reverse-engineered from the existing public listing pages, UI components, and Prisma listing data model.

## User Scenarios & Testing

### User Story 1 - Browse available listings (Priority: P1)

A visitor opens the home page and browses available properties, with each result showing essential information and a link to its detail page.

**Why this priority**: The catalog is the primary purpose of the real-estate aggregator.

**Independent Test**: With listing records available in PostgreSQL, open `/` and verify the returned cards show listing information in newest-created-first order.

**Acceptance Scenarios**:

1. **Given** listings exist, **When** a visitor opens `/`, **Then** the page displays listing cards ordered by creation time descending.
2. **Given** a listing has no image URL, **When** its card is rendered, **Then** the local placeholder image is shown.
3. **Given** the listing query fails, **When** a visitor opens `/`, **Then** the page displays an error message rather than an empty-results message.
4. **Given** no listings match the current query, **When** the page renders, **Then** it displays a no-results message.

### User Story 2 - Filter listings (Priority: P2)

A visitor narrows the catalog by city, price range, minimum floor area, and minimum room count; chosen values remain visible in the filter form.

**Why this priority**: Filters help visitors find relevant properties in the public catalog.

**Independent Test**: Open `/` with one or more supported query parameters and verify the result set matches each accepted filter and the form reflects the supplied values.

**Acceptance Scenarios**:

1. **Given** listings exist in different cities, **When** a visitor submits a city filter, **Then** only listings whose city contains the submitted text are returned.
2. **Given** listings with varying prices, **When** a visitor supplies minimum and/or maximum price, **Then** results satisfy the supplied bounds.
3. **Given** listings with varying areas or room counts, **When** a visitor supplies minimum values, **Then** results meet each supplied lower bound.
4. **Given** a numeric filter value cannot be parsed as an integer, **When** the page processes the query, **Then** that filter is ignored; values with a parseable integer prefix may still be accepted, and the current UI does not display a validation message.
5. **Given** a visitor selects Reset, **When** navigation completes, **Then** the visitor returns to the unfiltered catalog.

### User Story 3 - View listing details (Priority: P3)

A visitor opens a listing from the catalog to review its full description, property details, and original source link.

**Why this priority**: Details provide information that does not fit on the catalog card and connect the visitor to the source listing.

**Independent Test**: Open `/annunci/{id}` for an existing listing and verify its details and source link are displayed; try a missing or invalid ID and verify not-found behavior.

**Acceptance Scenarios**:

1. **Given** a listing exists, **When** a visitor opens its detail URL, **Then** the page displays its title, location, price, area, rooms, bathrooms, property type, description, source name, and source link.
2. **Given** optional address, image, or bathroom data is absent, **When** details render, **Then** the address is omitted, the placeholder image is used, or bathrooms are shown as unavailable, respectively.
3. **Given** a listing ID is invalid or does not exist, **When** its detail URL is opened, **Then** the application renders not-found behavior.
4. **Given** the detail query raises a database error, **When** the page handles it, **Then** the error is logged and the request resolves through not-found behavior.

## Edge Cases

- Missing listing image uses `/placeholder-house.png`.
- Missing optional address and bathroom values are handled in the detail view.
- Invalid and unknown detail IDs resolve to not-found.
- Listing-index database failures show a dedicated error message.
- Detail-query database failures are currently indistinguishable from missing listings to the visitor.
- Numeric filters use `Number.parseInt`; wholly unparseable values are ignored, but partially parseable values (for example, `12abc`) are accepted as their integer prefix. No validation feedback is presented.
- If no listing matches the filters, the page displays its no-results state.

## Requirements

### Functional Requirements

- **FR-001**: The public home page MUST list available property records from the database.
- **FR-002**: The listing catalog MUST order records by creation time, newest first.
- **FR-003**: Each listing card MUST show its title, price in euros, city, floor area, room count, image, and a link to the detail page.
- **FR-004**: The catalog MUST support city substring filtering.
- **FR-005**: The catalog MUST support inclusive minimum and maximum price filters, a minimum floor-area filter, and a minimum room-count filter.
- **FR-006**: The filter form MUST preserve supplied values and provide a way to clear filters.
- **FR-007**: A listing detail page MUST show the listing's available property and source information.
- **FR-008**: A listing without an image MUST use the local placeholder; absent optional details MUST be displayed or omitted as appropriate.
- **FR-009**: Invalid or missing listing IDs MUST resolve to not-found behavior.
- **FR-010**: The catalog MUST distinguish a database-query failure from a valid empty result set.

### Key Entities

- **Listing**: Property advertisement with title, description, price, city, optional address, area, rooms, optional bathrooms, property type, optional image URL, source URL/name, and creation/update timestamps.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every rendered catalog result satisfies all accepted city and numeric filters in the request.
- **SC-002**: Catalog results are returned in descending `createdAt` order.
- **SC-003**: An existing listing detail page displays its persisted property details and original source link.
- **SC-004**: A missing or invalid listing ID resolves to not-found behavior.
- **SC-005**: A catalog database error produces the error state rather than the no-results state.

## Assumptions

- Listing records are provisioned in PostgreSQL; the current seed script supplies sample listings.
- Listing ingestion, creation, editing, and deletion are outside this migrated feature's scope.
- Authentication is not required to browse listings.
- Filter values are sent as URL query parameters by the form.
- There is no automated test framework or test suite for this feature in the repository.
