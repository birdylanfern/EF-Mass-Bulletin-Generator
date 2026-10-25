# Traditional Latin Mass (1962 Missal) Sunday Bulletin Generator

An elegant, production-grade liturgical bulletin generator engineered for the **Singapore Extraordinary Form Community** at the **Church of St. Joseph (Victoria Street)**.

The application automatically calculates liturgical days according to the **1962 Roman Missal** (including Singapore archdiocesan feasts and correct post-Epiphany/post-Pentecost Sunday titling), renders authentic EB Garamond sacred typography with traditional red rubric headings, provides rich in-place editing, and exports high-resolution PDFs in two formats:
1. **Download E-bulletin**: 4 sequential A5 pages optimized for mobile/tablet reading and online distribution.
2. **Download Booklet**: 2-sheet A4 landscape folded booklet imposition:
   - **Sheet 1 (Outer Spread)**: Page 4 (Back Cover) | Page 1 (Front Cover)
   - **Sheet 2 (Inner Spread)**: Page 2 (Inside Left) | Page 3 (Inside Right)
   - Ready for double-sided short-edge printing and folding into a 4-page A5 booklet.

---

## Table of Contents
1. [How to Change Announcements](#1-how-to-change-announcements)
   - [Method A: Temporary / Per-Sunday Edits in the UI](#method-a-temporary--per-sunday-edits-in-the-ui)
   - [Method B: Permanent Defaults in Code](#method-b-permanent-defaults-in-code)
2. [How to Change Links & Contact Details](#2-how-to-change-links--contact-details)
   - [Method A: In the User Interface](#method-a-in-the-user-interface)
   - [Method B: Permanent Defaults in Code](#method-b-permanent-defaults-in-code)
3. [How to Change or Customize the QR Code](#3-how-to-change-or-customize-the-qr-code)
   - [How the QR Code Works](#how-the-qr-code-works)
   - [Changing the Encoded Destination URL](#changing-the-encoded-destination-url)
   - [Replacing the Static Fallback Asset](#replacing-the-static-fallback-asset)
4. [How to Customize Liturgical Propers & Meditations](#4-how-to-customize-liturgical-propers--meditations)
5. [PDF Exports & Booklet Imposition](#5-pdf-exports--booklet-imposition)
6. [Development & Build Commands](#6-development--build-commands)

---

## 1. How to Change Announcements

Announcements appear on **Page 2** of the bulletin (inside left spread).

### Method A: Temporary / Per-Sunday Edits in the UI

You can edit announcements on-the-fly for any specific Sunday without touching code:

1. **Via the Left Sidebar Form:**
   - Click the **"Announcements"** tab (megaphone icon) in the control panel.
   - Edit the **Title** or **Notice Details** of any existing announcement card.
   - Click **"+ Add Announcement"** to append a new custom parish notice.
   - Click the red **trash bin icon** on any card to remove it.

2. **Via Direct In-Place Click-to-Edit on the Preview Canvas:**
   - Directly click on any announcement headline or body paragraph on Page 2 in the live preview.
   - Type or paste new text directly.
   - Highlight any text to bring up the **floating typography toolbar** (Bold, Italic, Underline, Alignment).
   - If needed, click the **Reset Form to Liturgical Defaults** button in the header to revert to standard text.

> **Automatic Link & Handle Detection:**  
> The bulletin parser automatically scans announcement text and renders:
> - Telegram handles like `@zackteo` or `@timrichardtan` as active links to `https://t.me/<username>`.
> - Email addresses like `SingaporeEFministries@gmail.com` as clickable `mailto:` links.
> - Web addresses (`https://...` or `www...`) as active clickable hyperlinks.

---

### Method B: Permanent Defaults in Code

To update the default announcements that populate automatically whenever the generator opens or whenever a new Sunday date is selected:

1. Open `src/utils/liturgicalCalendar.ts`.
2. Locate the constant `DEFAULT_ANNOUNCEMENTS` (around line 450):

```typescript
export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'announcement-1',
    title: 'Weekly Post-Mass fellowship (Around 4pm)',
    content: "A group of young adults regularly meet at Star Kitchen Coffeeshop, just across Queen Street. If you're new to Mass or seeking community, feel free to say hi or reach out on Telegram:\nZachary @zackteo, Alvin @alvintingalot, Timothy @timrichardtan, Petrina @dearpetrina or Angeline @AngelineMT",
    isCustom: false,
  },
  {
    id: 'announcement-2',
    title: 'First time at the Extraordinary Form Mass?',
    content: "If it's your first time to Mass and you would like to have a guide in the future or for a friend, feel free to contact us on Telegram:\nZachary @zackteo, Alvin @alvintingalot, Timothy @timrichardtan, Petrina @dearpetrina or Angeline @AngelineMT\nAlternatively, you may drop us an email at SingaporeEFministries@gmail.com",
    isCustom: false,
  },
  {
    id: 'announcement-3',
    title: 'Volunteering Opportunities - Welcome Desk, Rosary, Guides, Photography',
    content: "Interested parties may contact us on Telegram.\nRosary: Nathaniel @goodmorningnathaniel\nBefrienders (Guides) & Welcome Desk: Timothy @timrichardtan\nPhotography: Zachary @zackteo\nAlternatively, you may approach us at the welcome desk or drop us an email at SingaporeEFministries@gmail.com",
    isCustom: false,
  },
];
```

3. To **add a new announcement**, simply add another object to this array with a unique `id`, `title`, and `content`.
4. To **reorder announcements**, swap the order of the objects in the array.
5. Save the file. The dev server will automatically reload with the new defaults.

---

## 2. How to Change Links & Contact Details

### Method A: In the User Interface

1. Open the left sidebar and click on the **"Community Info"** tab (`Church` icon).
2. You can edit:
   - **LinkTree URL (auto-updates QR Code & Links)**: e.g. `https://linktr.ee/efmasscommunitysingapore`
   - **Community Email**: e.g. `SingaporeEFministries@gmail.com`
   - **Venue Name**: e.g. `Church of St. Joseph`
   - **Street Address**: e.g. `Victoria Street`
   - **Mass Timing**: e.g. `2:00 pm`
   - **Rosary Timing**: e.g. `1:30 pm`
   - **Confessions Timing**: e.g. `1:30 pm`
   - **Priests**: e.g. `Father Augustine Tay, Father Ferdinand Purnomo, O.C.D.`

When you update the **LinkTree URL** in this field, the QR code on Page 2 and in the exported PDF **immediately regenerates** to encode your new URL!

---

### Method B: Permanent Defaults in Code

1. **Default Community Info & Linktree URL:**
   - File: `src/utils/liturgicalCalendar.ts`
   - Locate `DEFAULT_GENERAL_INFO`:
   ```typescript
   export const DEFAULT_GENERAL_INFO: GeneralInfo = {
     venueName: 'Church of St. Joseph',
     venueStreet: 'Victoria Street',
     massTiming: '2:00 pm',
     rosaryTiming: '1:30 pm',
     confessionsTiming: '1:30 pm',
     priests: 'Father Augustine Tay, Father Ferdinand Purnomo, O.C.D.',
     footerNotice: 'All are welcome to write their Mass intentions at the Welcome Desk.',
     linkTreeUrl: 'https://linktr.ee/efmasscommunitysingapore',
     email: 'SingaporeEFministries@gmail.com',
   };
   ```

2. **Social Media Icons Bar (Page 2 Header):**
   - File: `src/components/SocialIcons.tsx`
   - Lines 8–76 control the round black social media buttons:
     - **Telegram**: `https://t.me/singaporeefcommunity`
     - **Facebook**: `https://facebook.com`
     - **Email**: `mailto:${email}`
     - **WhatsApp**: `https://chat.whatsapp.com`
     - **Instagram**: `https://instagram.com`
   - Update any `href` attribute to point to your specific parish/ministry social account.

3. **Page 2 Footer Links:**
   - File: `src/components/BulletinPreview.tsx` (around lines 1185–1240):
     - The left block links to `generalInfo.linkTreeUrl` (with label "Scan our LinkTree QR Code").
     - The center block contains the QR code linking to `generalInfo.linkTreeUrl`.
     - The right block links to `https://t.me/singaporeefcommunity` (with label "Join our Telegram Channel").

---

## 3. How to Change or Customize the QR Code

### How the QR Code Works
The application uses the `qrcode` library to generate crisp, high-resolution SVG/PNG data URLs on the fly from `bulletin.generalInfo.linkTreeUrl`.
- **Dynamic Encoding**: When a user changes the LinkTree or destination URL in the form or code, the QR code dynamically updates immediately.
- **Export Safety**: Because the QR code is generated as a base64 image data URL locally in the browser, it has zero external network latency and zero CORS issues when rendering canvas frames for PDF generation.

### Changing the Encoded Destination URL
- **Active URL**: `https://linktr.ee/efmasscommunitysingapore`
- To change it in UI: Go to the **Community Info** tab on the left sidebar and change the **LinkTree URL** field.
- To change the default in code: Change `linkTreeUrl` in `DEFAULT_GENERAL_INFO` in `src/utils/liturgicalCalendar.ts`.

### Replacing the Static Fallback Asset
A static image is stored at `public/assets/qr-linktree.png` and `public/assets/qr-linktree.jpg` as an instant fallback.

If you ever wish to regenerate the static image files via the terminal, run:
```bash
node -e "const QRCode = require('qrcode'); QRCode.toFile('public/assets/qr-linktree.png', 'https://linktr.ee/efmasscommunitysingapore', { width: 512, margin: 1, color: { dark: '#000000', light: '#ffffff' } }, (err) => { if (err) console.error(err); else console.log('Generated successfully'); });"
cp public/assets/qr-linktree.png public/assets/qr-linktree.jpg
```
Alternatively, you can drop any custom 512x512 PNG QR code into `public/assets/qr-linktree.png`.

---

## 4. How to Customize Liturgical Propers & Meditations

- **Missal Propers and Kyriale / Credo Reference Data:**
  - File: `src/data/missalPropers.ts`
  - Defines Missal page numbers (Father Lasance, St. Andrew, Roman Missal 1962), Kyriale settings (Missa I through Missa XVIII), and Credo settings (Credo I through IV).
- **Weekly Patristic Meditations:**
  - File: `src/data/meditationsData.ts`
  - Contains traditional meditations from the Church Fathers, Dom Guéranger (*The Liturgical Year*), and St. Alphonsus Liguori indexed by liturgical Sunday key.
  - Page 3 features dynamic auto-fitting: text gracefully scales between 10.5pt and 13.5pt so long reflections never overflow the A5 boundary.
- **Feasts Specific to Singapore:**
  - File: `src/data/singaporeFeasts.ts`
  - Configures Singapore archdiocesan solemnities and patrons (e.g. Solemnity of St. Joseph on March 19, St. Francis Xavier on December 3, Our Lady of the Rosary on October 7).

---

## 5. PDF Exports & Booklet Imposition

The header bar provides two one-click export actions:

### 1. "Download E-bulletin"
- Produces a 4-page single-page sequence A5 PDF:
  - Page 1: Cover (Altar banner, liturgical date, 1st & 2nd class titling, Missal reference box).
  - Page 2: Inside Left (Community info, parish notices, Telegram handles, LinkTree QR code).
  - Page 3: Inside Right (Patristic meditation reflection, rubric border, indented text).
  - Page 4: Back Cover (Full-week 1962 liturgical calendar Monday–Saturday with class & commemorations, next Sunday preview, community crest).
- Output filename format: `YYYY-MM-DD (D MMMM YYYY).pdf` (e.g., `2026-10-18 (18 October 2026).pdf`).

### 2. "Download Booklet"
- Arranged in 2-sheet A4 landscape folded booklet format:
  - **Sheet 1**: Left = Page 4 (Back Cover) | Right = Page 1 (Front Cover)
  - **Sheet 2**: Left = Page 2 (Inside Left) | Right = Page 3 (Inside Right)
- Output filename format: `YYYY-MM-DD (D MMMM YYYY) Booklet.pdf`.
- **Printing instructions**:
  1. Print double-sided ("Flip on short edge" / "Short-edge binding").
  2. Fold the printed sheet down the middle along the vertical center guide.
  3. You have an authentic, professionally bound 4-page A5 parish bulletin!

---

## 6. Development & Build Commands

```bash
# Start local development server on port 3000
npm run dev

# Type-check TypeScript codebase without emitting JS
npm run lint

# Compile production-ready bundle into /dist
npm run build
```

---

*Ad majorem Dei gloriam.*
