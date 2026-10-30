# Mehfil · Invitation Studio

A static invitation maker for GitHub Pages. Create image and video cards, customize every text block, add pages and a gentle soundtrack, and make a personalized invitation for each guest. No backend, accounts, API keys, dependencies, or paid services are required.

## Run locally

```sh
npm run dev
```

Open http://127.0.0.1:5173. Python 3 runs the static server. Node.js 22 or newer is needed only for the optional checks. Do not open `index.html` directly with `file://`; browser modules and asset loading need HTTP.

## Publish on GitHub Pages

The ready-to-upload website is in `mehfil-github-pages.zip`. To regenerate it, run `npm run build`.

1. Unzip `mehfil-github-pages.zip`.
2. Upload its **contents** to the root of your GitHub Pages repository, preserving the `src/` and `assets/` folders. `index.html` must be at the repository root, rather than inside another folder. Include the hidden `.nojekyll` file when copying.
3. Open **Settings → Pages → Build and deployment → Source → Deploy from a branch**. Select your branch and **/ (root)**, then Save.

This checkout is connected to [nabeelaligh-create/wedding_card](https://github.com/nabeelaligh-create/wedding_card). Its `main` branch tracks `origin/main`. GitHub Pages publishes directly from **main / (root)** after each push, and the **Check Mehfil** workflow runs syntax checks, tests and a production build. Keep Pages set to **Deploy from a branch**.

For future updates from this folder:

```sh
npm run check
npm test
npm run build
git add src styles.css index.html assets README.md tests scripts package.json .gitignore .nojekyll .github
git commit -m "Describe your update"
git push
```

Git uses GitHub CLI authentication stored in the macOS keychain. This repository requests the `nabeelaligh-create` account, so other saved GitHub accounts can remain connected. Check the connection with `gh auth status` and `git remote -v`. The live site is https://nabeelaligh-create.github.io/wedding_card/.

Relative paths support both `username.github.io` and `username.github.io/repository/`. The build and ZIP include only the website, empty frames and bundled fonts. Blessings are editable text in the selected design; finished sample images are excluded. The supplied finished personal sample, notebook, and duplicate artwork remain local and are ignored by Git. Publish the ZIP contents or the tracked source, rather than uploading the entire original folder through a file picker.

GitHub setup reference: [Configuring a Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## What's included

- Eight editable templates: Gulmohar, Royal evening, Rosewater, Marigold, Garden vows, Simply us, Written in the stars, and Desert rose.
- Occasion wording presets for weddings, Nikah, Walima, engagements, mehndi, sangeet, receptions and anniversaries, plus fully custom wording.
- Two empty navy and gold frames in **My uploads**. Finished sample images are excluded from the public collection.
- **Details → Add a blessing** offers Arabic and English, Arabic only, English only, or your own opening words. A live preview shows the actual chosen design. Put the blessing above the invitation (the editor makes room), or on a separate opening page. Edit, move, or remove it later. The Arabic font is bundled, so downloads do not depend on system fonts.
- Old built-in sample opening pages are upgraded to editable blessings when their saved project or draft is opened. Custom uploaded artwork is preserved.
- Custom JPG, PNG, WebP and GIF image backgrounds, or MP4, WebM and MOV video backgrounds. Playback depends on the browser's codecs. GIFs are treated as still images. Finished artwork can be used without overlay text.
- **Couple & family details** in Details: editable hosts, invitation request, ceremony, couple names, son of / daughter of, parent names (including “late”), date, meal/time, venue, address, RSVP and best compliments. Use a single page or the original three-part script, with an optional opening blessing in the same design. No blessing is selected by default.
- Editable names, headings, host, date, time, venue, address, greeting, schedule and custom text. Click text to select its typeface, color, size, alignment and width; drag it or use arrow keys to reposition it. Font size has an exact number, slider and A− / A+ buttons.
- **Design → Apply design changes to** chooses the current page, selected pages, or all pages. Select individual pages with checkboxes, or use Select all. Apply a font, enlarge or reduce all visible text together, toggle borders and floral emblems, change the palette, or choose video animation. Shared changes support Undo/Redo and saved projects. Arabic lettering retains Amiri. Built-in navy frames and Desert rose arches respect the border toggle; lettering or borders embedded in uploaded pictures remain part of those pictures.
- Portrait (5:7), square, story (9:16), and landscape (7:5). Image exports at 720, 1080, 1440 or 2160 pixels wide. Video exports at 720 or 1080 pixels wide.
- Up to 12 pages: invitations, covers, celebration schedules, RSVP details, or blank pages. Rename, reorder, duplicate or delete pages. Video duration is 2–20 seconds per page, with fade, slide or cut transitions.
- Silent video, three original procedurally generated instrumental tracks, or custom uploaded audio. Adjustable music volume and gentle fade in/out. Original audio from video backdrops is muted.
- PNG, high quality JPG, and browser-native MP4/WebM video downloads. Multiple image pages and guest batches are packaged in ZIP files without external libraries.
- Automatic browser drafts, undo/redo, and portable `.mehfil.json` project files that include uploaded backgrounds and music.

## Personalized invitations in bulk

Set up your template, including the family details, before choosing **Bulk create**.

**Type or paste names** accepts one invitation per line, with no header or spreadsheet needed:

```text
Ahmed Khan
Priya Sharma
Meera & Rohan
```

This creates three complete invitations. A couple or family kept on one line receives one invitation. You can also **Upload a list** using a plain `.txt` file containing the same lines. Numbered lists and bullet lists work; commas stay part of the guest name. An optional family wording field, such as `& family`, applies to the list. Guest lists stay in memory while you edit; save the list separately before closing or reloading the browser.

For different family or event wording per guest, type:

```text
Ahmed Khan | & family | Nikah Ceremony
Priya Sharma | | Walima Reception
Meera & Rohan
```

CSV remains optional, with a downloadable sample:

```csv
name,family,event
Priya Sharma,& family,Wedding ceremony
Ahmed Khan,,Walima reception
"Meera & Rohan",,Sangeet
```

Use `{{name}}`, `{{family}}`, and `{{event}}` anywhere in editable text. The optional automatic greeting is added to the first editable page, skipping opening blessings and finished artwork. A name placeholder already on your template takes priority, preserving the placement you chose. For finished artwork, position your own editable greeting in the editor first. A batch requires a visible name placeholder so it produces personalized cards.

Preview each guest and each page before exporting. Every guest gets a separate numbered folder in the ZIP containing all invitation pages, or one complete video. Duplicate names do not overwrite one another. Your base template stays unchanged. CSV supports quoted commas, escaped quotes and multiline fields. Batches are limited to 200 invitations and 500 MB of generated files; split larger lists into smaller batches.

## Browser behavior and limits

- Video uses Canvas `captureStream` and `MediaRecorder`. The download dialog detects a supported MIME type and labels the output MP4 or WebM. MP4 availability depends on the browser and OS; there is no server conversion. [MediaRecorder format support](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static).
- Output dimensions round to even pixels for video encoder compatibility. For example, the 1080-pixel-wide landscape card is 1080 × 772 pixels.
- Videos render in real time. Keep the browser tab visible for the whole export. Hiding the tab cancels recording to avoid returning a broken video. Video bulk jobs take the number of guests multiplied by the invitation duration. Cancel stops the job and leaves the project intact.
- Large videos and high resolution exports need more memory. Uploads are limited to 80 MB for backgrounds, 20 MB for music, 24 assets and roughly 120 MB of media per project. Prefer short compressed videos, especially on mobile.
- Media is decoded locally; an unsupported video/audio codec produces a readable error. Use MP4/H.264 or WebM, and MP3/WAV audio for broad compatibility.
- Drafts use IndexedDB on the current browser and origin. Browser storage can be cleared or denied, so download a project file for a lasting backup. Importing a project replaces the current editor; Undo restores the previous state.
- Canvas wraps and shrinks long text to fit its text box. You can edit in other languages using your system's fallback fonts. Review positioning for each shape, long names, and translated text before downloading.
- The handwritten option uses an available system script font; the bundled serif, sans-serif and Arabic fonts are consistent across devices. Fonts are self-hosted, and normal use makes no requests to external services.
- For uploaded artwork containing text, choose **Finished artwork**. Its original lettering is preserved and existing text layers are hidden without deleting them; **Show saved text** restores your overlays. Use **Blank backdrop** for editable wording over an empty image or video. Finished artwork defaults to showing the whole upload; the original empty navy frames adapt their borders to the selected shape.
- There are no live RSVP forms, cloud project sync, or hosted guest pages. RSVP pages are part of the exported invitation. These features would require additional hosting or integrations beyond a static Pages site.

## Checks

```sh
npm run check
npm test
```

The automated tests cover editable blessings, matching palettes, reversible heading layouts, legacy opening upgrades, right-to-left rendering, and plain and CSV guest lists, family wording, script sequences, hidden text, bulk personalization without modifying the template, safe artwork handling, floral placement across card shapes, proportional frame rendering, project validation, dimensions, filenames, and ZIP structure. Browser checks should include an image download, a multi-page ZIP, personalized guest cards, and a short video with music.

Verified locally on 29 October 2026: all 30 automated tests and syntax checks passed. Browser checks produced a 1080 × 1512 PNG, a valid two-page ZIP, six personalized images for three guests, a four-second H.264/AAC MP4 with instrumental audio, and a six-second 1080 × 772 landscape MP4. Custom video upload, custom WAV upload/playback, project-file restore with embedded media, draft restore, and a 390-pixel phone layout were also checked. Additional browser checks confirmed three pasted names produce three distinct images, and a four-page script produces 12 images for three guests, keeping the blessing identical and replacing each guest greeting. The refined blessing flow was also checked in the built production site: two guests produced four images, with identical editable blessing pages and distinct personalized invitation pages. Arabic/custom-wording controls, the 390-pixel blessing dialog, saved draft restoration, landscape decoration clearance, and a six-second 720 × 514 H.264 video containing the blessing were verified. Other browsers' codecs and very large guest batches remain device-dependent.

## Asset rights

The supplied artwork remains under its original terms; verify its licenses before public distribution. Built-in instrumentals are generated by the app. Visitors should upload only images, videos and music they are allowed to use. Cormorant Garamond, DM Sans and [Amiri](https://github.com/google/fonts/tree/main/ofl/amiri) are bundled under the SIL Open Font License; license texts are in `assets/fonts/`.

Verified for shared styling: 35 automated tests and syntax checks passed. Browser checks confirmed all-page font/size/border changes in exported project files, selected-page isolation, Undo, and individual size buttons and number input.
