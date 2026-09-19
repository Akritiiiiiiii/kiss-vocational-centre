# KISS Vocational Centre: training, production and distribution

A student design prototype for a software design problem statement. It follows one chain from start to finish:

**Training → Production → Store → Distribution**

Trainees register in one vocational program and log production shifts. Their work fills a store. The store sends goods to schools. A forecast tells the centre how much to make next month.

> This is **not an official KISS website**. All names, stock levels and school figures are made-up sample data.

It is a static site: plain HTML, CSS and JavaScript. No build step, no dependencies, no third-party requests. Fonts are self-hosted.

---

## What it does

The site has four views, switched from the top navigation.

| View | What you can do |
|---|---|
| **Overview** | See the four stages at a glance, the products running low, stock cover in days, and the latest movements. |
| **Trainees** | Register a trainee, add a production shift, see every trainee's production score, issue a certificate when the target is met, and open or print a training profile. |
| **Store and dispatch** | See what is in the store and how many days it will last, send goods to a school, and read the recent dispatch ledger. |
| **Forecast** | See how much of each product to make next month. Change a school's headcount or the buffer to see the numbers move. |

## Rules the prototype uses

- A student can join **only one** program. A duplicate student ID is refused.
- **Production score = hours worked + units made.**
- Certificate target is **400**, or **240** for Fundamentals of computers, which is training only and sends nothing to the store.
- Units made by a trainee are added to the store. Stock leaves the store **only by dispatch** to a school, and a dispatch cannot exceed what is in the store.
- Every shift, registration, certificate and dispatch is written to the ledger.
- **Forecast** = average monthly use over the last three months × (staff now ÷ staff when that use was measured).
- **Make** = forecast demand + buffer − stock in the store. The buffer is set in weeks of use.

Programs and the products they make:

| Program | Product | Certificate target |
|---|---|---|
| Handicraft | Jute mats | 400 |
| Tailoring | School uniforms | 400 |
| Cleaning materials | Phenyl | 400 |
| Fundamentals of computers | none (training only) | 240 |

---

## Files

All files sit at one level. There is no `assets/` folder.

```
index.html                       the page and its four views
404.html                         not-found page
styles.css                       design tokens and styles
app.js                           sample data, rules and rendering
favicon.svg
vercel.json                      Vercel settings and security headers
robots.txt
LICENSES.txt                     font licences (SIL Open Font License 1.1)
rozha-one-latin-400.woff2        fonts
mukta-latin-400.woff2
mukta-latin-500.woff2
mukta-latin-700.woff2
noto-sans-oriya-oriya-400.woff2
README.md                        this file
```

`index.html` must be at the top level of whatever you deploy.

---

## Deploy to Vercel

There is no build step and nothing to install.

### Option A: GitHub, then Vercel (redeploys on every push)

1. Create a new empty repository at https://github.com/new.
2. On the empty repo page click **uploading an existing file**.
3. Open the folder that contains these files, select **all files inside it** (Ctrl+A, or Cmd+A on Mac) and drag them into the browser. Do not drag the folder itself, or the files end up in a subfolder and Vercel shows a 404.
4. Wait until every file is listed, then click **Commit changes**.
5. Check the repo's main page. `index.html` and `vercel.json` must be listed directly, not inside a folder.
6. Go to https://vercel.com/new and click **Import** next to the repository.
7. Set **Framework Preset** to **Other**. Leave Build Command, Output Directory and Install Command empty.
8. Click **Deploy**. When the status says **Ready**, click **Visit**.

After this, every push to `main` publishes automatically.

### Option B: Vercel CLI (no GitHub needed)

Open a terminal inside this folder, where `index.html` is visible, and run:

```
npx vercel --prod
```

Log in when asked and press Enter through the questions. The CLI prints your live URL.

### If you see a Vercel "404 NOT_FOUND" page

Vercel could not find `index.html` at the top level, which means the files are inside a subfolder of the repo. Fix it either way:

- Move the files to the repo root, or
- In Vercel open **Settings → Build and Deployment → Root Directory**, enter the subfolder name, save, then go to **Deployments → ⋯ → Redeploy**.

---

## Run it locally

Use a local server rather than double-clicking `index.html`:

```
python3 -m http.server 8080
```

Then open http://localhost:8080.

---

## Things to know

- **Saved in the browser only.** Changes are kept in `localStorage` on the visitor's own device. Nothing is sent anywhere, and other visitors never see your changes. The **Reset sample data** button at the bottom of the page clears it (click it twice to confirm).
- **New month, fresh counters.** When the calendar month changes, the "this month" counters (hours worked, units made, dispatches) start again at zero. Trainees and stock carry over.
- **Security headers.** `vercel.json` sends a strict Content-Security-Policy (scripts, styles and fonts from the site itself only, no outside connections), plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`. `cleanUrls` is on. If you add an outside script, font or image, you must also loosen the policy in `vercel.json`.
- **Not indexed by default.** `index.html` contains `<meta name="robots" content="noindex">` because the site uses the KISS name and is unofficial. Delete that line if you want search engines to list it, and consider adding a note that it is a class project.
- **Accessibility.** Skip link, keyboard navigation, visible focus, labelled form fields and progress bars, light and dark mode, and reduced-motion support.
- **Odia labels.** The four stage names (ପ୍ରଶିକ୍ଷଣ, ଉତ୍ପାଦନ, ଭଣ୍ଡାର, ବିତରଣ) should be checked by an Odia speaker before you present this.

## Changing the sample data

Everything the prototype starts with sits at the top of `app.js`: `PROGRAMS`, `ITEMS`, `SCHOOLS`, the seed `trainees` and the starting `ledger`. Colours and type are tokens at the top of `styles.css`.

After changing the seed data, click **Reset sample data** (or clear the site's local storage) so your browser stops loading its older saved copy.

## Fonts and licences

Rozha One, Mukta and Noto Sans Oriya, all under the SIL Open Font License 1.1. The full text is in `LICENSES.txt`.
