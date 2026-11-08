# Backend API Spec — On the Road / Off the Road

> Frontend source: `app/demo/fleet.tsx` + `src/doc/const.ts`
> Deadline note: give these 4 APIs first — frontend can ship On/Off Road pages end-to-end.

Base URL: `/api/v1/fleet` | Auth: Bearer JWT (staff role) | Pagination: `?page=1&limit=20`

---

## Concepts (must match frontend logic)

- **On the Road** = `fleetStatus=active` + running with driver (`gigStatus` irrelevant, just `issue=null` + has `currentDriver`). Mock: `ONROAD[]` in `fleet.tsx:950+`
- **Off the Road** = `fleetStatus=active` but not running. `issue: workshop|compliance_hold|owner_paused|accident|other|null` + `gigStatus: active|ended`. Mock: `OFFROAD[]` in `fleet.tsx:1107`
- **Plan grace**: `PLAN_GRACE_DAYS` (`const.ts:74`): `Guaranteed 27K=Infinity`, `Secured 30K=5`, `Optimal 33K=3`
- **Cost split**: `offRoadCostSplit()` (`fleet.tsx:433`): `dailyDowntimeCost` from `PLAN_META` (`const.ts:44`), `fsDays = min(daysOff, grace)`, `ownerDays = max(0, daysOff-grace)`, `fsAbsorbed = fsDays*dailyRate`, `ownerBilled = ownerDays*dailyRate`
- **Driver risk**: only if `gigStatus=active && issue!=null`, tolerance 5 days (`DRIVER_TOLERANCE_DAYS=5`)
- **Renewal health**: aggregate `ntsaExpires + insExpires + tracker.subscriptionExpiresAt` → `expired > expiring_soon > expiring > all_valid` (`fleet.tsx:393`)

---

## 1) GET /fleet/on-road — List On the Road

List cars physically running. Used by `fl-on-road`.

**Query**
```
search? (reg/make/ownerName/phone)
plan? Guaranteed 27K|Secured 30K|Optimal 33K
paymentStatus? paid|pending|overdue
renewalHealth? all_valid|expiring|expiring_soon|expired
period? all|today|yesterday|7d|30d|this_month|last_month|month:YYYY-MM  (filter on activeSince)
page, limit, sort? activeSince|netCycle|nextPayoutDate
```

**Response 200**
```json
{
  "data": [{
    "id": "CO-A101",
    "reg": "KCA 778M",
    "make": "Toyota", "model": "Vitz", "year": 2018, "color": "White", "cc": 1300, "fuel": "Petrol",
    "owner": { "id": "OWN-O041", "name": "Brian Kiprono", "phone": "0723 445 119", "type": "individual" },
    "plan": "Secured 30K",
    "activeSince": "2025-11-04",
    "currentDriver": "James Mwangi", "driverSince": "2025-11-10", "driverPhone": "0712 345 678",
    "cycle": "monthly", "cycleStartedAt": "2026-04-01", "cycleDaysSoFar": 29, "cycleDaysTotal": 30,
    "grossCycle": 30100,
    "deductionsCycle": [{ "kind": "downtime|maintenance|compliance|tracker_sub", "label": "string", "amount": 1200 }],
    "netCycle": 28900,
    "paymentStatus": "paid|pending|overdue", "overdueDays": 5, "lastPayoutAt": "2026-04-04", "lastPayoutAmount": 30000, "nextPayoutDate": "2026-05-04",
    "whereIsCar": "with_owner|yard|with_workshop",
    "whereLastUpdatedAt": "2026-04-29T07:15:00Z", "whereLastUpdatedBy": "Auto · GPS", "whereLocationDetail": "On gig · Westlands",
    "renewalHealth": { "state": "all_valid|expiring|expiring_soon|expired|n_a", "earliest": { "kind": "insurance", "expiresAt": "2026-06-01", "days": 15 } }
  }],
  "meta": { "total": 42, "page": 1, "limit": 20 },
  "summary": { "totalOnRoad": 42, "byPlan": { "Guaranteed 27K": 10 }, "overduePayouts": 2 }
}
```

---

## 2) GET /fleet/off-road — List Off the Road

List incapacitated cars. Must support the filters in the UI.

**Query**
```
search?
plan?
issue? workshop|compliance_hold|owner_paused|accident|other|null  (null = awaiting driver, no issue)
gigStatus? active|ended
paymentStatus?
renewalHealth?
daysOff_gte?, daysOff_lte?
period? (filter on offRoadSince)
page, limit, sort? daysOff|offRoadSince|netCycle
```

**Response 200**
```json
{
  "data": [{
    "id": "CO-O303",
    "reg": "KDK 778P",
    "make": "Honda", "model": "Fit", "year": 2019, "color": "Blue", "cc": 1300, "fuel": "Petrol",
    "owner": { "id": "OWN-O052", "name": "Sarah Wambui", "phone": "0701 992 110", "type": "individual" },
    "plan": "Optimal 33K",
    "activeSince": "2025-08-22",
    "cycle": "monthly", "cycleStartedAt": "2026-04-01", "cycleDaysSoFar": 29, "cycleDaysTotal": 30,
    "grossCycle": 22000, "deductionsCycle": [{ "kind": "downtime", "label": "Downtime past grace (9d)", "amount": 9900 }], "netCycle": 12100,
    "paymentStatus": "pending",
    "issue": "workshop", "issueLabel": "Workshop",
    "gigStatus": "active", "currentDriver": "Brian Otieno", "driverWaitingSince": "2026-04-17",
    "offRoadSince": "2026-04-17", "daysOff": 12,
    "lastDriver": "Brian Otieno", "lastDriverEndedAt": null,
    "recovery": { "eta": "2026-05-08", "note": "Front bumper + radiator replaced", "lastUpdate": "2026-04-28T14:00:00Z", "lastUpdateBy": "Joel M. (Ops)" },
    "whereIsCar": "with_workshop", "whereLocationDetail": "Karen Auto Services · Ngong Rd",
    "costSplit": { "grace": 3, "dailyRate": 1100, "fsDays": 3, "ownerDays": 9, "fsAbsorbed": 3300, "ownerBilled": 9900 },
    "driverRetention": { "state": "critical|at_risk|ok", "days": 12, "tolerance": 5, "label": "Driver likely lost" },
    "renewalHealth": { "state": "expired", "earliest": { "kind": "insurance", "expiresAt": "2026-04-15", "days": -2 } },
    "resolution": { "action": "resolve|rematch", "dest": "on-road|rematch", "destLabel": "On the Road|Rematch", "hint": "Driver collects · gig resumes" },
    "blockingDocs": [{ "kind": "insurance|ntsa", "label": "Insurance", "expiresAt": "2026-04-15", "state": "expired" }]
  }],
  "meta": { "total": 18, "page": 1, "limit": 20 },
  "summary": {
    "totalOffRoad": 18,
    "byIssue": { "workshop": 3, "compliance_hold": 2, "owner_paused": 1, "null": 12 },
    "byGig": { "active": 4, "ended": 14 },
    "totalOwnerBilled": 45200, "totalFsAbsorbed": 22100
  }
}
```
**Backend notes**
- `costSplit` must be computed server-side from `PLAN_META.dailyDowntimeCost` + `PLAN_GRACE_DAYS` — exactly as `offRoadCostSplit()` does.
- `driverRetention` null when `gigStatus!=active || issue==null`.
- `blockingDocs` = only `insurance` + `ntsa` when `state=expired` (tracker expiry never blocks — `fleet.tsx:358`).
- `resolution` via `offRoadResolution()` (`fleet.tsx:335`).

---

## 3) GET /fleet/:id/off-road-detail — Detail + computed fields

Used when clicking a row in Off the Road (and On the Road drill-down). Frontend currently derives these client-side — move to backend.

**Response 200**
```json
{
  "car": { "...same as list item..." },
  "computed": {
    "costSplit": { "grace": 3, "dailyRate": 1100, "fsDays": 3, "ownerDays": 9, "fsAbsorbed": 3300, "ownerBilled": 9900 },
    "driverRetention": { "state": "critical", "days": 12, "tolerance": 5, "color": "#dc2626", "label": "Driver likely lost" },
    "renewalHealth": { "state": "expired", "items": [{ "kind": "ntsa", "label": "NTSA Inspection", "expiresAt": "2026-04-10", "expiry": { "state": "expired", "days": -7 } }] },
    "blockingDocs": [{ "kind": "insurance", "label": "Insurance", "expiresAt": "2026-04-15", "expiry": { "state": "expired", "days": -2 } }],
    "resolution": { "action": "resolve", "dest": "on-road", "label": "Resolve issue", "destLabel": "On the Road" },
    "rematchReasonIfResolved": "workshop_done|insurance_done|pause_ended|driver_quit"
  },
  "history": [{ "at": "2026-04-17T10:00:00Z", "by": "Joel M.", "action": "moved_off_road", "from": "on-road", "to": "workshop", "note": "Accident reported" }]
}
```

---

## 4) POST /fleet/:id/off-road-transition — Resolve / Rematch / Update

Single mutating endpoint for all Off-Road actions. Frontend calls `offRoadResolution()` to decide label, backend enforces.

**Request**
```json
{
  "action": "resolve_issue|send_to_rematch|update_recovery|pause|mark_workshop_done",
  "issueResolvedAt"?: "2026-05-08T10:00:00Z",
  "recovery"?: { "eta": "2026-05-10", "note": "Paint pending" },
  "whereIsCar"?: "yard|with_owner|with_workshop",
  "whereLocationDetail"?: "Bay A1"
}
```

**Rules**
- If `blockingDocs.length>0` (insurance/ntsa expired) → `409 { code: "BLOCKING_DOCS", blockingDocs }` unless `force=true` (manager override, audit-logged).
- `resolve_issue` when `gigStatus=active` → moves to `On the Road` (gig resumes). When `gigStatus=ended` → moves to `Rematch` with `rematchReason = rematchReasonForIssue(issue)` (`fleet.tsx:350`).
- `send_to_rematch` when `issue==null && gigStatus=ended` → moves to `Rematch` (`driver_quit`).
- All transitions audit-logged: `actor, timestamp, from, to, reason`.

**Response 200**
```json
{ "id": "CO-O303", "fleetStatus": "active", "roadStatus": "on-road|off-road|rematch", "issue": null, "gigStatus": "active", "rematchReason": "workshop_done", "offRoadSince": null, "daysOff": 0 }
```
**Errors**: `404 not_found`, `409 BLOCKING_DOCS`, `422 invalid_transition` (e.g. resolving a non-existent issue).

---

## Common enums (copy-paste for backend validation)

```ts
PLAN = "Guaranteed 27K" | "Secured 30K" | "Optimal 33K"
ISSUE = "workshop" | "compliance_hold" | "owner_paused" | "accident" | "other" | null
GIG = "active" | "ended"
PAYMENT = "paid" | "pending" | "overdue"
RENEWAL = "all_valid" | "expiring" | "expiring_soon" | "expired" | "n_a"
ROAD = "on-road" | "off-road"  // + rematch is a separate fleetStatus, not roadStatus
```

## What to deliver first

1. DB fields: `issue`, `gigStatus`, `offRoadSince`, `recovery{eta,note,lastUpdate,lastUpdateBy}`, `currentDriver/driverWaitingSince/lastDriver`, `whereIsCar/locationDetail`, `cycle{...deductions}`, `expiry docs`.
2. Seed with `OFFROAD`/`ONROAD` mocks so frontend can switch from mocks to real API by just changing fetch URL.
3. Auth + audit log on `POST /off-road-transition`.
