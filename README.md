# Mass Energy website

Single-page website for **Mass Energy**, *For Brighter Tomorrow*. Built with plain HTML, CSS and JavaScript, with no frameworks and no build step.

## Preview

- **VS Code:** install the *Live Server* extension, right-click `index.html` and choose **Open with Live Server**.
- **Any terminal:** run `python -m http.server 8000` in this folder, then open <http://localhost:8000>.

Use a local server rather than double-clicking `index.html`, because some browsers block web fonts on `file://` pages.

## Deploy

Upload the whole folder, keeping its structure, to any static host (cPanel or FTP hosting, Netlify, Cloudflare Pages, GitHub Pages). No server-side code is needed.

- **Include `.htaccess`.** Its name starts with a dot, so some FTP programs hide it; turn on "show hidden files" when uploading.
- **After changing `css/styles.css` or `js/main.js`,** raise the `?v=` number on their links in `index.html` (for example `?v=3` to `?v=4`). This stops Cloudflare and browsers serving old copies. If something still looks out of date, purge the cache in Cloudflare (Caching → Configuration → Purge Everything).

The canonical link, social-sharing tags, sitemap and structured data use absolute URLs for the official address, `https://www.massenergy.pk/`. If the site will live elsewhere, update them in the `<head>` of `index.html`, in `sitemap.xml` and in `robots.txt`.

## Folder structure

```
index.html            Page content, metadata and structured data
css/styles.css        All styles; design tokens are in section 2
js/main.js            Header, mobile menu, reveals, FAQ and form behaviour
assets/brand/         Logo (SVG + PNG), emblem, favicon.svg, app icons
assets/images/        Photos in AVIF/WebP (several widths) + JPEG fallback, og-image.jpg
assets/fonts/         Self-hosted Archivo and Montserrat, with licences
assets/licenses/      Icon licence (Lucide)
favicon.ico           Browser tab icon
site.webmanifest      App name and icons
robots.txt            Tells search engines they may crawl the site; points to the sitemap
sitemap.xml           Page and image list for search engines
.htaccess             Server rules: hides the test copy from Google, 404 page, caching
404.html              Branded "page not found" page
```

## Where to edit

| To change… | Edit… |
| --- | --- |
| Text | `index.html`. Each section starts with a comment such as `<!-- About -->`, `<!-- Lithium battery solutions -->`, `<!-- Water & IoT solutions -->` or `<!-- FAQ -->`. |
| Energy-flow guide (lithium section) | The three captions are in `<dl class="energy-flow__states">`; the diagram labels are the `<text>` elements inside the SVG just below it. |
| Enquiry types in the form | The `<select id="f-topic">` options. The "Ask about…" links pre-select an option through their `data-enquiry` attribute, so keep the two matching. |
| Colours, fonts, sizes, spacing, corners, shadows, animation timing | `css/styles.css`, section 2 **Design tokens** (the `:root` block). The brand colours are `--brand-blue`, `--brand-gold`, `--brand-neutral` and `--brand-ink`. |
| Photos | `assets/images/`. See [Replacing photos](#replacing-photos). |
| Logo | `assets/brand/mass-energy-logo.svg` (used in the header and footer). |
| Contact details | See the list below. |

### Contact details appear in several places

Search `index.html` for `8219937` and `massenergy.pk` to find every occurrence:

- header phone link, mobile menu, hero contact strip, call-to-action band, Contact section and footer
- the page title, meta description and the structured data (JSON-LD) in `<head>`
- the form's `data-email="sales@massenergy.pk"`. The script reads the enquiry address from here.
- the address (with Rawalpindi) and the two Google Maps links in the Contact section and footer
- `assets/images/og-image.jpg`, the social sharing image, which has the phone, email and website written into it. Recreate it at 1200 × 630 px if any of these change.

### Replacing photos

Each photo is served through a `<picture>` element in three widths, as AVIF and WebP, plus one JPEG fallback. For example: `about-panel-installation-640/960/1280.avif`, the matching `.webp` files, and `about-panel-installation-960.jpg`.

To replace a photo:

1. Export the same widths and formats with the same file names, or update the names in `index.html`.
2. Keep the same aspect ratio, or update the `width` and `height` attributes.
3. Update the `alt` text so it describes the new photo.

Only describe a photo as a Mass Energy project if it genuinely is one.

## Contact form

No form backend is configured, so the form works honestly without one:

- **Open Email Draft** checks the fields, then opens the visitor's email app with a pre-filled message to sales@massenergy.pk. The page states that the enquiry is **not sent until they press Send** in their email app.
- **Copy Message** copies the formatted enquiry. If the browser blocks copying, the message is shown in a box for manual copying.
- The site never shows a "message sent" confirmation in this mode.
- With JavaScript turned off, the form's buttons are hidden and a note offers the email address and phone number instead. (A `mailto:` form action was removed because browsers flag it as an insecure form on HTTPS pages.)

### Connecting a form service later

1. Create a form with a service that accepts browser submissions and returns JSON, for example Formspree, Getform or Basin, or with your own server endpoint.
2. Add its **public endpoint URL** to the form's `data-endpoint` attribute in `index.html`:

   ```html
   <form class="enquiry" id="enquiry-form" … data-endpoint="https://formspree.io/f/your-form-id">
   ```

3. The button then reads **Send Enquiry**. The script sends the fields `name`, `contact`, `topic` and `message`, plus an empty `website` spam-trap field, as a `POST` with `Accept: application/json`. It shows a success message **only after the service confirms with a 2xx response**. On any error it shows a failure message and offers **Copy Message** instead.
4. Endpoint URLs are public identifiers. **Never put API keys, passwords or email (SMTP) credentials in the HTML or JavaScript.** Any secret must stay inside the form service or on your own server.

## SEO

### What is set up

- **Title and description** target searches such as "solar energy Rawalpindi" and "lithium batteries Rawalpindi" (title 60 characters, description 144 characters).
- **One official address:** a canonical link to `https://www.massenergy.pk/`, with matching Open Graph and X (Twitter) tags for link previews.
- **Robots meta tag** allowing indexing and large image previews.
- **Structured data (JSON-LD):**
  - `LocalBusiness`: name, slogan, logo, phone, email, the Rawalpindi address and services
  - `WebSite`
  - `FAQPage` for all 12 FAQs
  Google no longer shows FAQ dropdowns in results for most business sites, but the data still helps search engines understand the page. **If you edit an FAQ answer on the page, make the same edit in the JSON-LD**; they must match word for word.
- **`robots.txt` and `sitemap.xml`,** including the site's images for Google Images.
- **The test copy is hidden from Google.** `.htaccess` sends a `noindex` header only on `test.bahriatownservices.com`, so it cannot compete with the real domain. On `www.massenergy.pk` the header is not sent.
- **Technical basics:**
  - one `h1` and logical headings
  - descriptive image alt text and file names
  - fast, responsive images
  - no layout shift
  - a mobile-friendly layout
  - a branded 404 page that returns a real 404 status
  - long browser caching for images and fonts

### Lighthouse results (30 September 2026)

- **Simulated production (`www.massenergy.pk`):** SEO **100** and Accessibility **100** on mobile and desktop.
- **Live test site:**
  - Performance 95 on desktop and 83 on mobile.
  - Best Practices was 78–79 because of the old `mailto:` form action, which is now removed.
  - Once the new `.htaccess` is uploaded, the test site will deliberately score lower on SEO, because it is marked `noindex`.

### Launch checklist (needs the owner or hosting access)

1. **Register and connect `massenergy.pk`,** with HTTPS and email (MX) records. Until then, the site cannot appear in Google: the test copy is hidden on purpose, and the real domain does not exist yet.
2. **Upload these files to `www.massenergy.pk`,** and redirect `massenergy.pk` and `http://` to `https://www.massenergy.pk/`. The easiest place to set this up is Cloudflare.
3. **Google Search Console:** add the domain, verify it, and submit `https://www.massenergy.pk/sitemap.xml`. Do the same in Bing Webmaster Tools.
4. **Google Business Profile:** create one for Mass Energy at the Rawalpindi address, with the same name, phone and website as the site. This matters most for "solar company near me" searches and Maps.
5. **Keep details consistent** (name, address, phone) wherever the business is listed, and ask happy customers for Google reviews.
6. **Cloudflare settings that affect speed and scores:**
   - Cache the HTML at Cloudflare's edge with a Cache Rule. The page currently takes 1.3–1.6 s to come from the hosting server; purge the cache after each upload.
   - Turn off **Email Address Obfuscation** (Scrape Shield). It rewrites the email links and adds a script.
   - Optionally, turn off automatic **Web Analytics**. Its beacon script is flagged as legacy JavaScript.
7. **When the site changes,** update `<lastmod>` in `sitemap.xml`.

Search rankings also depend on things outside the website, such as reviews, links from other sites, and competition. No site can guarantee a position, but the technical SEO here scores 100 in Lighthouse.

## Image, font and icon sources

| Asset | Source | Licence |
| --- | --- | --- |
| `hero-rooftop-dusk-*` | "A large solar panel with mountains in the background" by Michael Pointner (Austria). <https://unsplash.com/photos/a-large-solar-panel-with-mountains-in-the-background-OZ0ZEAm_PbE> | Unsplash License |
| `about-panel-installation-*` | "A person working on a solar panel" by Markus Spiske (Middle Franconia, Germany). <https://unsplash.com/photos/a-person-working-on-a-solar-panel-rNn_TU8dvoY> | Unsplash License |
| `solutions-flat-rooftop-*` | "Black and white solar panels" by Jeroen van de Water (Werkspoorfabriek, Utrecht). <https://unsplash.com/photos/black-and-white-solar-panels-aQOzmgcT6sI> | Unsplash License |
| `cta-panels-blue-sky-*` | "Solar panel under blue sky" by American Public Power Association (Lincoln, USA). <https://unsplash.com/photos/solar-panel-under-blue-sky-XGAZzyLzn18> | Unsplash License |
| `lithium-battery-bank-*` | "High-Efficiency Residential Power Inverter Setup" by Magda Ehlers. <https://www.pexels.com/photo/high-efficiency-residential-power-inverter-setup-37929911/> | Pexels License |
| `water-canal-sunset-*` | "A straight canal runs through green fields at sunset" by Bernd Dittrich. <https://unsplash.com/photos/a-straight-canal-runs-through-green-fields-at-sunset-xtnNxHJZY_Y> | Unsplash License |
| `water-clean-glass-*` | "Clear drinking glass on gray surface" by KOBU Agency (Faro, Portugal). <https://unsplash.com/photos/clear-drinking-glass-on-gray-surface-TWIRIAizZFU> | Unsplash License |
| `water-treatment-solar-*` | "Aerial view of a water treatment plant with surrounding fields" by Subhash Chand. <https://unsplash.com/photos/aerial-view-of-a-water-treatment-plant-with-surrounding-fields-T-q7fVaJgHA> | Unsplash License |
| `iot-monitoring-station-*` | "A solar panel mounted to the side of a building" (a weather station with a solar panel) by Abhinav Chitikela. <https://unsplash.com/photos/a-solar-panel-mounted-to-the-side-of-a-building-OtW3XS4Yjd0> | Unsplash License |
| Energy-flow diagram | Original illustration drawn in SVG for this site, using Lucide icons | — |
| `og-image.jpg` | Composed from the hero photo and the Mass Energy logo | — |
| Logo, emblem, favicons, app icons | Extracted as vector artwork from the company letterhead (`Mass Energy Letter Head - Printing.pdf`). Paths, colours, the sun gradient and the lettering are unchanged; the wordmark was converted to outlines. | Mass Energy |
| Archivo and Montserrat fonts | Google Fonts, self-hosted and trimmed to the weights used | SIL Open Font License 1.1 (`assets/fonts/`) |
| Icons | Lucide 1.49.0, inlined as an SVG sprite in `index.html` | ISC (`assets/licenses/lucide-ISC.txt`) |

Every photo was checked on 30 September 2026: the Unsplash photos are "Free to use under the Unsplash License" (not paid Unsplash+ images), and the battery photo is free under the Pexels License. Both licences allow commercial use without attribution; credit is recorded here anyway. Neither allows implying that the photographer or anything pictured endorses Mass Energy. The photos were only cropped and resized. Photos published by solar or battery companies, and photos showing equipment brand names, were deliberately avoided.

## For the owner to review before launch

### Must fix

- **The domain is not live.** On 30 September 2026, `massenergy.pk` did not exist in DNS (checked with a local resolver and with Google Public DNS). Until the domain is registered and configured:
  - `www.massenergy.pk` will not load.
  - **Email sent to sales@massenergy.pk will bounce.** This includes enquiries drafted by the contact form.

  Register or configure the domain, add mail (MX) records for the email address, and enable HTTPS. The site keeps the details exactly as they appear on the letterhead.

### Added from the owner's instructions (30 September 2026)

- **Lithium batteries.** The owner confirmed that Mass Energy installs lithium batteries, so the lithium section and the Solutions card present this as a confirmed service. The benefits, the lithium and lead-acid comparison and the lithium FAQs are general industry information. Please check them against the batteries you supply. Before adding specifics such as brands, capacities, cycle ratings or warranty terms, confirm them. The FAQ names lithium iron phosphate (LiFePO4) as the most common solar chemistry; confirm it matches your products.
- **Water & IoT solutions.** This section uses the owner's supplied text, lightly edited for the web, with the tags taken from that text. The supplied text did not include a heading for the first category, so it is titled **"Off-Grid Solar Water Solutions"**. Confirm or rename it.
- **Navigation.** With eight links, the full desktop menu appears from 1200 px wide; narrower screens use the menu button.
- **City.** The owner confirmed the office is in **Rawalpindi**. It is now part of the visible address, the title and description, the map links and the structured data (Rawalpindi, Punjab, Pakistan).
- **Official domain.** The owner chose `www.massenergy.pk` as the official address, so the test copy is kept out of search results (see [SEO](#seo)).

### Please confirm (draft content)

- **Services.** The Solutions section still presents residential and commercial solar as *educational categories* and asks visitors to confirm availability. Confirm which of these Mass Energy offers. Once confirmed, the wording can become more direct, and unoffered categories can be removed.
- **Process.** The four stages (Consultation, Site Assessment, System Proposal, Installation and Handover) are a proposed workflow. Confirm the steps and their wording. No timelines or warranties are stated.
- **About copy**, including the three "How we work" points (Clear answers, Planned around your site, Realistic expectations) and the statement that a quote can be prepared.
- **Hero, call-to-action and FAQ copy.** This is general solar information; check it matches how Mass Energy works.
- **WhatsApp.** No WhatsApp link was added. If 0333-8219937, or another number, is a WhatsApp contact, a link can be added.
- **Left out because they are unverified:** service area, opening hours, social media, founding year, team, certifications, partners, projects, testimonials, prices, subsidies, net-metering, warranties and financing. Add these only with genuine information.
- **Photography.** Every photo is a stock image, and the footer says so. Replace them with genuine project photos when available, then update or remove that footer note.
- **Logo on dark backgrounds.** No official reversed (light) logo was supplied, so the footer shows the original logo on a white panel. Supply an approved reversed version if you prefer one.

## Checks performed

These checks were run locally in Chrome 154, automated with Playwright:

- **Layout** at 360, 390, 768, 1024 and 1440 px wide, with and without motion: no horizontal overflow, no console errors and no failed requests.
- **102 scripted interaction checks**, all passing:
  - mobile menu: open and close, `aria-expanded`, Escape key, focus handling, background made inert; menu button at 1024 px, full navigation from 1280 px
  - anchor links land below the sticky header
  - active-section highlighting in the navigation, including Batteries and Water & IoT
  - FAQ with mouse and keyboard (Enter, Space, arrow keys, Home, End)
  - energy-flow guide: default state, button states, captions, diagram changes and keyboard use
  - "Ask about…" links pre-selecting the matching enquiry type
  - form validation messages and focus
  - email-draft contents, and Copy Message
  - a simulated form service, testing both success and failure
  - reduced motion, JavaScript turned off, the skip link and focus outlines
- **Accessibility:** axe-core 4.10 found no WCAG 2.2 A/AA violations, in the default, energy-flow power-cut, expanded-FAQ, form-error and open-menu states. Colour contrast was checked for every text colour pairing.
- **HTML:** `html-validate` passes. The one exception is the intentional `role="list"` on styled lists and table parts, which keeps their semantics in Safari.
- **Performance:** about 330 KB on first desktop load, before server compression; images further down load as visitors scroll. The hero image is the largest element painted (Largest Contentful Paint), and layout shift was 0.
- **SEO:** Lighthouse 12.8 scored SEO 100 on mobile and desktop (simulated `www.massenergy.pk`). The structured data parses, all 12 FAQ entries match the visible text, and `sitemap.xml` is well-formed.

**Not tested:** Safari, Firefox, real phones, and real email apps. Whether "Open Email Draft" opens an app depends on the visitor's device settings.
