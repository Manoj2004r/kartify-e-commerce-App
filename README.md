# Kartify — Handoff to DevOps

**From:** Development team
**To:** DevOps
**Purpose:** Everything you need to containerize and deploy this app. This
document intentionally does **not** include a Dockerfile or Kubernetes
manifests — that's your side of the fence. Ask the dev team if anything
below is unclear or missing.

---

## 1. What this app is

Kartify is a two-service web app: a React single-page app (frontend) talking
to a Node.js REST API (backend), backed by MongoDB.

```
Browser → [Frontend: React SPA]  --/api--> [Backend: Node/Express API] --> [MongoDB]
```

There is no server-side rendering. The frontend is a static build output
(HTML/CSS/JS) once compiled — it needs a web server to serve those static
files in production, not a Node process.

---

## 2. Repo layout

```
kartify/
├── backend/     ← Node.js API service
├── frontend/    ← React SPA
```

Each has its own `package.json`, its own dependencies, and should be built
into its **own separate image**. Don't combine them into one container.

---

## 3. Backend service

### Runtime
- **Language/runtime:** Node.js
- **Required version:** Node 18 or later (developed and tested on Node 20)
- **Package manager:** npm (a `package-lock.json` is committed — use `npm ci`,
  not `npm install`, for reproducible installs in the image)

### Entry point
- Start command: `node src/server.js`
- There's also `npm start` defined in `package.json` which runs the same thing
- The process listens on the port defined by the `PORT` environment variable
  (defaults to `5000` if unset)

### Build step
None. This is plain JavaScript (CommonJS), not TypeScript — no compile/build
step needed. Just install dependencies and run.

### Dependencies that must be installed
Everything under `"dependencies"` in `backend/package.json`. Nothing under
`"devDependencies"` (`nodemon`) is needed at runtime — that's dev-only for
hot-reload and should be excluded from the production image.

### Environment variables it expects

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | No | `5000` | Port the HTTP server binds to |
| `NODE_ENV` | No | `development` | Set to `production` in deployed environments |
| `MONGO_URI` | **Yes** | `mongodb://localhost:27017/kartify` | Full MongoDB connection string. In containers this must point at the Mongo service's hostname, not `localhost` |
| `JWT_SECRET` | **Yes** | none | Used to sign auth tokens. Must be a long random string. **This is a secret — do not bake it into the image or commit it to git.** |
| `JWT_EXPIRES_IN` | No | `7d` | Token lifetime |
| `CLIENT_URL` | No | none | Used for CORS — should be set to the public URL of the frontend |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX` | No | `300` | Max requests per window |

A committed `backend/.env.example` file lists these too, but note it's an
*example* file with placeholder values, not something to copy into the
image — real values should come from your secrets mechanism at deploy time.

### Network
- Listens on **one port**: `5000` (via `PORT`)
- Needs outbound network access to MongoDB (`MONGO_URI` host/port)
- No other outbound calls at runtime

### Health checks
Two HTTP endpoints exist specifically for orchestration probes:

| Endpoint | Purpose | Returns 200 when |
|---|---|---|
| `GET /health/live` | Liveness | The process is up and responding at all |
| `GET /health/ready` | Readiness | The process is up **and** the MongoDB connection is established |

Use `/health/live` for a liveness probe and `/health/ready` for a readiness
probe if your orchestrator distinguishes the two.

### Graceful shutdown
The process listens for `SIGTERM` and `SIGINT`, stops accepting new
connections, finishes in-flight requests, then exits. Give it a reasonable
grace period (10+ seconds) before a hard kill in your orchestration config.

### Filesystem
- Stateless — writes nothing to local disk at runtime
- No volumes needed for the backend itself (only MongoDB needs persistent
  storage)

### One-time setup task
There's a seed script (`npm run seed`, runs `src/seed/seed.js`) that loads
demo product data and two demo user accounts into MongoDB. This is **not**
part of normal startup — it's a manual/one-off task, not something the
container's default command should run automatically. How you expose this
(a separate Job, an exec-into-pod command, etc.) is up to you.

### Security notes for the image
- The app does not need root privileges at runtime — it only binds to a port
  and talks to MongoDB
- No native/compiled dependencies requiring build tools (no node-gyp, no
  Python) — a minimal Node base image should work fine

---

## 4. Frontend service

### Runtime (build time)
- **Language/runtime:** Node.js 18+ (only needed to *build* the app — not to
  run it)
- **Build tool:** Vite
- **Package manager:** npm (`package-lock.json` committed — use `npm ci`)

### Build step
This app **must be compiled** before it can be served. The build command is:

```
npm run build
```

This produces a static output folder: `frontend/dist/`. That folder contains
plain HTML/CSS/JS — no Node process is needed to serve it.

### What serves it in production
The compiled `dist/` folder needs to be served by a static web server. The
dev team has not specified which one — pick whatever your standard is
(nginx, Caddy, a static-hosting CDN, etc.). Whatever you choose needs to:

1. Serve `dist/index.html` for **any unmatched route** (this is a
   single-page app using client-side routing — a request to, say,
   `/product/some-item` must still return `index.html`, not a 404)
2. Proxy or otherwise forward requests to `/api/*` through to the backend
   service (the frontend code calls relative paths like `/api/products` in
   production — see note below)
3. Serve on port `80` (or whatever convention you use — just needs to be
   documented back to the dev team)

### Build-time configuration
One build-time variable matters:

| Variable | Required | Default | Notes |
|---|---|---|---|
| `VITE_API_URL` | No | `/api` | The base URL the frontend calls for API requests. **This gets baked into the compiled JS at build time** — it cannot be changed after the image is built without rebuilding. If left as `/api` (the default), the web server in front of the static files must reverse-proxy `/api/*` to the backend service — see point 2 above. |

There are no runtime environment variables for the frontend — once it's
built, it's just static files.

### Dependencies
Everything under `"dependencies"` **and** `"devDependencies"` in
`frontend/package.json` is needed at build time (Vite, Tailwind, etc. are
devDependencies but required to produce the build). None of them are needed
in the final runtime image if you do a multi-stage build — only the
contents of `dist/` need to ship in the final image.

### Health check
No custom health endpoint — a plain `GET /` returning `200` is sufficient
proof the static server is up.

---

## 5. Database

- **Engine:** MongoDB (developed/tested against MongoDB 7)
- The backend is the only thing that talks to it directly
- Needs **persistent storage** — data must survive container/pod restarts
- No special MongoDB configuration is required (no replica set, no auth
  currently enforced at the DB layer — if you want to add DB-level auth,
  coordinate the credentials with the `MONGO_URI` the backend receives)
- Default port: `27017`

---

## 6. Inter-service communication

| From | To | Protocol | Notes |
|---|---|---|---|
| Frontend (browser) | Backend | HTTPS/HTTP, path `/api/*` | Frontend calls relative `/api/...` paths in production — something in front (reverse proxy / ingress) must route these to the backend service |
| Backend | MongoDB | MongoDB wire protocol, port 27017 | Connection string via `MONGO_URI` |

There is no direct network path needed between the frontend build/serve
layer and MongoDB.

---

## 7. What DevOps needs to produce

Based on the above, you'll need to write:

1. A **Dockerfile for the backend** — installs prod dependencies, runs
   `node src/server.js`, exposes port 5000, ideally runs as non-root
2. A **Dockerfile for the frontend** — multi-stage: build with Node/Vite,
   then serve the static `dist/` output with a lightweight web server,
   including SPA fallback routing and an `/api` reverse-proxy rule
3. Wherever secrets (`JWT_SECRET`, `MONGO_URI` if it contains credentials)
   are injected — not baked into either image
4. Whatever orchestration layer you're targeting (compose file, Kubernetes
   manifests, etc.) — wire the two services + MongoDB together, using the
   health endpoints above for probes

## 8. Questions to bring back to the dev team

- Confirm which Node LTS version to pin in the images
- Confirm expected resource footprint (CPU/memory) under load, if load
  testing hasn't happened yet
- Confirm whether MongoDB should be a managed/external service in production
  or self-hosted in the same environment
- Confirm log format expectations (the backend currently logs via `morgan`
  to stdout — fine for container log collection as-is, but confirm)
