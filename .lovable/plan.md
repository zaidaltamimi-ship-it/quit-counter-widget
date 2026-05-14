# Soukromý trezor + granulární sdílení s přáteli

Zachová bezpečnostní příběh aplikace ("tvá data, tvůj trezor") a zároveň přidá viditelnou kontrolu nad tím, co kamarádi reálně vidí.

## 1. Databáze — sdílecí nastavení per addikce

Nová tabulka `addiction_sharing` (1:1 k `addictions`):

| Pole | Default | Co řídí |
|------|---------|---------|
| `share_type` | `true` | Typ závislosti (kouření, alkohol…) |
| `share_quit_date` | `true` | Datum quit / počet dní |
| `share_per_day` | `false` | Spotřeba/den |
| `share_savings` | `false` | Ušetřené peníze |
| `share_mood` | `false` | Nálada a craving |
| `share_health` | `false` | Zdravotní data (nikdy default!) |

Default = sdílí jen typ + dny. Citlivé věci jsou OFF.

Auto-vytvoření řádku triggerem při INSERT do `addictions`.

## 2. RLS aktualizace

Stávající policy `Users can view friend addictions` přepsat tak, aby pouštěla jen řádky, kde `share_type = true` (typ závislosti). Pro citlivá pole použít **view** `friend_visible_addictions` který vrací jen sdílená pole — `useFriends` bude číst z view, ne z tabulky.

Stejný princip pro `health_entries` a `mood_entries`: přidat policy "friend can read if share_health/share_mood = true".

## 3. UI — nastavení sdílení per addikce

V `AddictionDetail.tsx` přidat sekci **„Sdílení s přáteli"** se 6 toggly. Sekce má jasný popis: *"Vyber, co o této závislosti uvidí lidé v tvém kruhu. Vše ostatní zůstává jen tvé."*

## 4. UI — komunikace „trezoru"

- **FriendsTab**: krátká info-lišta nahoře — *"Tvůj kruh: lidé, které jsi sám pozval. Vidí jen to, co povolíš v každém trackeru."*
- **Pozvánka**: před odesláním modal *„Tento kamarád uvidí: typ + dny. Ne uvidí: zdravotní data, náladu, poznámky. Změnit můžeš kdykoliv."*
- **Landing/Onboarding**: doplnit v copy *"Soukromý trezor. Sdílíš jen co sám povolíš."* (drobně, ne křiklavě)

## Technická poznámka

- Migrace: tabulka + RLS + view + trigger pro auto-insert sharing rowu
- `useFriends.ts`: změnit zdroj z `addictions` na view
- `useAddictions.ts`: přidat `updateSharing(addictionId, settings)`
- Žádné breaking změny pro stávající kamarády (default sdílí typ + dny = stejné jako dnes pro tyhle 2 pole)

```text
┌─ AddictionDetail ───────────────┐
│  Cigarety · 47 dní              │
│  ...                            │
│  ┌─ Sdílení s přáteli ───────┐  │
│  │ ☑ Typ závislosti          │  │
│  │ ☑ Počet dní               │  │
│  │ ☐ Spotřeba/den            │  │
│  │ ☐ Ušetřeno                │  │
│  │ ☐ Nálada                  │  │
│  │ ☐ Zdravotní data          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

Začnu migrací DB, pak code změny v jedné dávce.