# PropNet - Immobilienverwaltung

## Über die App

PropNet ist eine Webanwendung zur Verwaltung von Immobilien und Kontakten. Die App wurde mit Next.js 15, TypeScript, Tailwind CSS und AG Grid entwickelt und bietet eine intuitive Benutzeroberfläche für die Verwaltung von Immobilienportfolios.

### Hauptfunktionen

- **Immobilienverwaltung**: Erstellen, bearbeiten und löschen von Immobilieneinträgen mit detaillierten Informationen wie Titel, Beschreibung und Adresse
- **Kontaktverwaltung**: Verwaltung von Kontakten (Mieter, Eigentümer, Dienstleister) mit vollständigen Kontaktdaten
- **Beziehungsverwaltung**: Verknüpfung von Immobilien mit Kontakten über ein Beziehungssystem
- **Adressautomatisierung**: Integration von Google Maps API für automatische Adressvorschläge
- **Datenvisualisierung**: Leistungsstarke Tabellen mit AG Grid für bessere Datenübersicht

### Technologie-Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI-Komponenten**: Material-UI (MUI)
- **Datenbank**: Supabase
- **Tabellen**: AG Grid Community
- **Karten**: Google Maps API
- **Benachrichtigungen**: Notistack

### Projektstruktur

```
app/
├── components/          # React-Komponenten
├── hooks/              # Custom React Hooks
├── immobilien/         # Immobilien-Seite
├── kontakt/            # Kontakte-Seite
├── links/              # Beziehungen-Seite
└── api/                # API-Routen

lib/
├── columnDefinitions.ts # Tabellen- und Formular-Definitionen
├── CellRenderers.ts    # AG Grid Zellen-Renderer
└── supabase.ts         # Supabase-Konfiguration
```

## Noch zu tun

entferne "unknown" types
integriere schemas in glabal type logic

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Build erstellen
npm run build

# Linting
npm run lint
```

Die App läuft standardmäßig auf `http://localhost:3000` und leitet automatisch zur Immobilien-Seite weiter.
