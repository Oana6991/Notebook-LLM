# Sala — jurnal de antrenament (aplicație pe telefon)

Site-ul de pe https://antrenament-yolo.netlify.app/ transformat în aplicație pentru ecranul telefonului
(iconiță proprie, deschidere pe tot ecranul, pornire rapidă).

Datele (antrenamente, exerciții, greutate, grup) stau în **Supabase**, în contul tău — nu în telefon —
deci nu se pierd și apar la fel pe orice dispozitiv după login.

## Publicare pe aceeași adresă Netlify
1. app.netlify.com → site-ul **antrenament-yolo** → tab-ul **Deploys**.
2. Trage folderul `antrenament` (sau conținutul din `sala-app.zip`) în zona *„Drag and drop your site output folder here”*.
3. Gata — adresa rămâne aceeași.

În folder trebuie să fie: `index.html`, `manifest.json`, `sw.js`, `icons/`.

## Instalare pe iPhone
1. Deschide https://antrenament-yolo.netlify.app/ în **Safari**.
2. **Share (□↑) → Add to Home Screen → Add**.
3. Deschide aplicația „Sala” de pe ecran și **loghează-te o dată** (aplicația are login-ul ei separat de Safari).
