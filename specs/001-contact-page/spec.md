# Feature Specification: Sezione Contatti

**Feature Branch**: `feature/login`

**Created**: 2026-11-15

**Status**: Draft

**Input**: Richiesta utente: aggiungere una sezione contatti al sito e confrontare le scelte migliori.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Trovare i recapiti del sito (Priority: P1)

Un visitatore vuole contattare il gestore del sito e cerca un recapito affidabile senza dover esplorare gli annunci.

**Why this priority**: Rendere facile trovare un contatto aumenta la fiducia nel servizio e offre un punto di riferimento chiaro ai visitatori.

**Independent Test**: Da una pagina qualsiasi del sito, il visitatore può raggiungere la pagina Contatti tramite il footer e individuare l'indirizzo email pubblico.

**Acceptance Scenarios**:

1. **Given** un visitatore si trova su una pagina del sito, **When** apre il link Contatti nel footer, **Then** raggiunge una pagina dedicata ai recapiti.
2. **Given** è configurato un indirizzo email pubblico, **When** il visitatore apre la pagina Contatti, **Then** vede l'indirizzo in forma leggibile e può selezionarlo per avviare un messaggio email.
3. **Given** l'indirizzo email pubblico non è configurato, **When** il visitatore apre la pagina Contatti, **Then** riceve un'indicazione chiara che il recapito non è temporaneamente disponibile e non vede un link email non valido.
4. **Given** il visitatore usa uno schermo piccolo o naviga da tastiera, **When** raggiunge Contatti dal footer, **Then** riesce a trovare e leggere il recapito senza contenuti tagliati o controlli inaccessibili.

### User Story 2 - Contattare il gestore via email (Priority: P2)

Un visitatore seleziona l'indirizzo email per avviare un messaggio nel proprio programma di posta.

**Why this priority**: Un recapito cliccabile riduce i passaggi necessari per contattare il gestore, lasciando al visitatore il controllo del messaggio e del suo invio.

**Independent Test**: Selezionando l'indirizzo, il visitatore avvia la composizione di un messaggio destinato all'indirizzo pubblico configurato.

**Acceptance Scenarios**:

1. **Given** l'indirizzo è configurato e il visitatore seleziona il recapito, **When** il dispositivo gestisce i link email, **Then** apre la composizione di un messaggio indirizzato al recapito mostrato.
2. **Given** l'indirizzo mostrato è cambiato nella configurazione, **When** il visitatore apre la pagina o seleziona il recapito, **Then** sia il testo visibile sia la destinazione del link riflettono il valore corrente.
3. **Given** il dispositivo non ha un'applicazione email configurata, **When** il visitatore apre la pagina, **Then** può comunque selezionare e copiare il testo dell'indirizzo.
4. **Given** il visitatore apre la pagina Contatti, **When** consulta le opzioni disponibili, **Then** trova solo il recapito email e nessun modulo per l'invio di messaggi.

## Edge Cases

- Il recapito non è configurato: mostrare un messaggio informativo, senza indirizzi dimostrativi o link non validi.
- Un dispositivo potrebbe non avere un'applicazione email configurata; il visitatore deve comunque poter leggere e copiare l'indirizzo.
- La pagina e il collegamento nel footer devono rimanere utilizzabili su schermi piccoli e con navigazione da tastiera.
- La funzione non deve promettere l'invio di messaggi o una risposta entro tempi non concordati.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Il sito MUST offrire una pagina dedicata ai recapiti, raggiungibile da un collegamento Contatti presente nel footer.
- **FR-002**: La pagina MUST mostrare l'indirizzo email pubblico in forma leggibile e selezionabile per avviare un messaggio.
- **FR-003**: L'indirizzo email pubblico MUST essere configurabile senza modificare il contenuto della pagina.
- **FR-004**: Il testo dell'indirizzo e la destinazione del collegamento email MUST corrispondere allo stesso valore configurato.
- **FR-005**: Se non è configurato un indirizzo email, la pagina MUST indicare che il recapito non è disponibile e MUST omettere il collegamento email.
- **FR-006**: La pagina MUST consentire la lettura e la copia del recapito anche quando il visitatore non dispone di un'applicazione email configurata.
- **FR-007**: La pagina e il collegamento Contatti MUST essere fruibili su dispositivi mobili e tramite navigazione da tastiera.
- **FR-008**: La funzione MUST limitarsi a pubblicare un recapito; non deve raccogliere o inviare messaggi per conto del visitatore.

## Project Impact *(complete when applicable)*

- **User-facing routes or screens**: Una pagina dedicata ai recapiti pubblici.
- **Shared UI**: Collegamento Contatti nel footer del sito.
- **Application services**: Nessun servizio di invio messaggi richiesto.
- **API behavior**: Nessuna nuova API richiesta.
- **Persisted data**: Nessun dato di contatto o messaggio da salvare nel database.
- **External integrations**: Il programma email del visitatore può gestire il collegamento; nessuna integrazione di invio server-side richiesta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Da ogni pagina con il footer visibile, i visitatori possono raggiungere la pagina Contatti con un solo clic o attivazione da tastiera.
- **SC-002**: Nel 100% delle configurazioni con indirizzo impostato, la pagina mostra lo stesso indirizzo leggibile e come destinatario del collegamento email.
- **SC-003**: Nel 100% delle configurazioni senza indirizzo, la pagina comunica l'indisponibilità e non presenta link email vuoti o dimostrativi.
- **SC-004**: In una prova di usabilità, almeno 9 visitatori su 10 riescono a individuare e copiare l'indirizzo email entro 30 secondi.

## Assumptions

- La scelta iniziale è una pagina Contatti dedicata, raggiungibile dal footer.
- La sola modalità di contatto richiesta è l'email; non sono inclusi modulo, telefono, indirizzo fisico o social.
- L'indirizzo pubblico verrà fornito tramite configurazione dell'ambiente; nessun indirizzo viene presunto o inserito come esempio visibile.
- Il visitatore compone e invia il messaggio nel proprio programma email; il sito non raccoglie contenuti né promette tempi di risposta.
- Non è necessaria alcuna modifica al database.
