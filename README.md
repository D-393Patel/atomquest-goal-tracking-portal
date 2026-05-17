# AtomQuest Goal Setting & Tracking Portal

This is a demo-ready browser app for AtomQuest Hackathon 1.0. It implements the required employee, manager, and admin journeys without external dependencies, so it can run locally from this folder.

## Run

Use any static file server from this directory:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/index.html
```

The current local server is already started on port `4173`.

## Demo Credentials

```text
Employee: employee@test.com / 123456
Manager:  manager@test.com  / 123456
Admin:    admin@test.com    / 123456
```

The login page also has quick role-switch buttons for demo speed.

## Implemented Features

- Employee goal creation with max 8 goals, minimum 10% weightage, and total 100% validation.
- Manager approval workflow with inline target and weightage editing.
- Goal locking after approval.
- Admin unlock exception handling.
- Shared goal push from Manager/Admin to multiple employees.
- Quarterly achievement updates with score calculation.
- Manager check-in comments.
- Active cycle controls.
- Completion dashboard and analytics.
- Audit logs for governance-significant changes.
- CSV export for achievement reporting.
- Architecture diagram in `architecture.svg`.

## Files

```text
index.html          App entry point
styles.css          Responsive dashboard styling
app.js              Portal data, workflows, rendering, and business rules
architecture.svg    Architecture diagram for submission/presentation
README.md           Run and demo notes
```

## Notes For Production

For a production version, move the current localStorage data model into:

```text
Next.js API routes
Prisma ORM
PostgreSQL
Auth.js or Microsoft Entra ID
```

The app structure and workflows are intentionally aligned to that future backend model.
