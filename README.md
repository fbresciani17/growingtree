# 🌳 GrowingTree — Albero Genealogico Familiare

**GrowingTree** è un'applicazione web moderna e reattiva pensata per visualizzare, esplorare e aggiornare l'albero genealogico della famiglia in modo collaborativo e in tempo reale.

L'albero genealogico ha come radici principali **Teresa Vavassori** e **Giovanni Bresciani** e consente di navigare facilmente tra generazioni, matrimoni e discendenze senza bisogno di registrazione o login complessi.

---

## 🌟 Caratteristiche Principali

- **Visualizzazione ad Albero Interattiva**:
  - Zoom fluido (rotellina del mouse, pulsanti dedicati o pinch-to-zoom su smartphone).
  - Panoramica libera (trascinamento canvas).
  - Collegamenti grafici eleganti tra coniugi e generazioni (SVG dinamici).
  - Centratura rapida sui capostipiti o adattamento automatico allo schermo.
- **Vista Elenco Alternativa**:
  - Tabella e schede riassuntive ordinate per anno di nascita o cognome.
  - Filtri istantanei per persone viventi o in memoria.
  - Pulsante per localizzare immediatamente un parente sull'albero.
- **Scheda Dettagliata & Pannello Laterale**:
  - Dati anagrafici completi: data e luogo di nascita, decesso, età o durata della vita, note biografiche e memorie di famiglia.
  - Navigazione rapida ai profili di genitori, partner e figli.
- **Modalità Modifica Protetta da Codice Famiglia**:
  - Visualizzazione libera per tutti i parenti.
  - Aggiunta di nuovi figli, partner, genitori e modifica dei dati abilitate solo inserendo il codice segreto di famiglia (`VITE_FAMILY_CODE`).
- **Sincronizzazione Realtime con Supabase**:
  - Le modifiche effettuate da qualsiasi membro della famiglia compaiono istantaneamente sugli schermi di tutti gli altri dispositivi connessi.
- **Deploy Automatico su GitHub Pages**:
  - Workflow GitHub Actions già configurato e pronto all'uso.

---

## 🛠️ Stack Tecnologico

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Google Fonts (Plus Jakarta Sans & Lora)
- **Database & Realtime**: Supabase (@supabase/supabase-js)
- **Hosting & CI/CD**: GitHub Pages + GitHub Actions

---

## 📋 Struttura del Database Supabase

L'app utilizza le seguenti due tabelle esistenti nello schema `public`:

### Tabella `public.people`
| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | `uuid` (Primary Key) | Identificativo univoco |
| `first_name` | `text` | Nome di battesimo |
| `last_name` | `text` | Cognome |
| `birth_date` | `date` | Data di nascita (YYYY-MM-DD) |
| `birth_place` | `text` | Luogo di nascita |
| `death_date` | `date` | Data di decesso (se applicabile) |
| `death_place` | `text` | Luogo di decesso |
| `notes` | `text` | Note biografiche e memorie |
| `created_at` | `timestamptz` | Data di creazione |
| `updated_at` | `timestamptz` | Data di ultimo aggiornamento |

### Tabella `public.relationships`
| Colonna | Tipo | Descrizione |
|---|---|---|
| `id` | `uuid` (Primary Key) | Identificativo univoco |
| `person_id` | `uuid` (FK &rarr; people.id) | Persona di origine |
| `related_person_id` | `uuid` (FK &rarr; people.id) | Persona di destinazione |
| `relationship_type` | `text` | Valori ammessi: `'parent'` oppure `'partner'` |
| `created_at` | `timestamptz` | Data di creazione |

> **Regole Relazionali:**
> - Per un figlio: relazione `'parent'` da genitore a figlio (`person_id` = genitore, `related_person_id` = figlio).
> - Se entrambi i genitori sono noti: due record `'parent'` verso lo stesso figlio.
> - Per un partner/coniuge: relazione `'partner'` tra le due persone.
> - Se una persona viene eliminata, le relazioni collegate vengono rimosse automaticamente.

---

## 🚀 Guida all'Installazione Locale

### 1. Clona il repository
```bash
git clone https://github.com/fbresciani17/growingtree.git
cd growingtree
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
Copia il file di esempio `.env.example` in un nuovo file `.env`:
```bash
cp .env.example .env
```

Apri `.env` e inserisci i parametri del tuo progetto Supabase e il codice di famiglia desiderato:

```env
# URL del tuo progetto Supabase
VITE_SUPABASE_URL=https://tuo-progetto.supabase.co

# Chiave pubblica / anon di Supabase (NON usare la Secret Key!)
VITE_SUPABASE_PUBLISHABLE_KEY=tua-chiave-anon-pubblica

# Codice segreto per abilitare le modifiche sull'albero
VITE_FAMILY_CODE=1234
```

### 4. Avvia l'applicazione in locale
```bash
npm run dev
```
L'app sarà accessibile su `http://localhost:5173/growingtree/`.

---

## 📦 Creazione della Build di Produzione

Per compilare il codice TypeScript e generare i file statici ottimizzati nella cartella `dist/`:

```bash
npm run build
```

Per testare localmente la build di produzione:
```bash
npm run preview
```

---

## 🌐 Deploy su GitHub Pages

Il repository include già il file di configurazione [deploy.yml](file:///.github/workflows/deploy.yml) per GitHub Actions.

### Passaggi per il Deploy:

1. **Abilita GitHub Pages nel repository**:
   - Vai su GitHub &rarr; **Settings** &rarr; **Pages**.
   - Sotto **Build and deployment &rarr; Source**, seleziona **GitHub Actions**.

2. **Configura i GitHub Secrets**:
   - Vai su **Settings** &rarr; **Secrets and variables** &rarr; **Actions**.
   - Clicca su **New repository secret** e aggiungi:
     - `VITE_SUPABASE_URL`: l'URL del tuo progetto Supabase.
     - `VITE_SUPABASE_PUBLISHABLE_KEY`: la chiave anonima pubblica di Supabase.
     - `VITE_FAMILY_CODE`: il codice segreto di famiglia per sbloccare la modalità di modifica.

3. **Esegui il Push su GitHub**:
   - Ogni volta che farai `git push origin main`, GitHub Actions eseguirà automaticamente la build e pubblicherà la web app su:
     `https://fbresciani17.github.io/growingtree/`

---

## 🔒 Sicurezza & Privacy

- **Nessuna Secret Key nel Frontend**: L'applicazione utilizza unicamente la chiave anonima pubblica `VITE_SUPABASE_PUBLISHABLE_KEY`. La `service_role` o `secret_key` di Supabase non è inclusa né richiesta.
- **Protezione con Codice Famiglia**: Solo chi possiede il `VITE_FAMILY_CODE` può inserire o modificare dati. Gli altri visitatori possono solo consultare l'albero in modalità lettura.
