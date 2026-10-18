# #Hashtag Shisha Lounge — QR menu

## Running it on a computer in the bar (localhost)

1. Install **Node.js** (version 20 or newer) from https://nodejs.org on the bar's computer.
2. Download this project (Lovable → GitHub, or download the code) and open a terminal in its folder.
3. Install once:
   ```sh
   npm install
   ```
4. Build and start the site so other devices on the Wi-Fi can reach it:
   ```sh
   npm run build
   npx vite preview --host 0.0.0.0 --port 8080
   ```
   (For quick testing you can also use `npm run dev -- --host 0.0.0.0`.)
5. Find the computer's local IP address:
   - Windows: `ipconfig` → "IPv4 Address" (e.g. `192.168.1.20`)
   - macOS: System Settings → Wi-Fi → Details, or `ipconfig getifaddr en0`
6. On a phone connected to the **bar's Wi-Fi**, open `http://192.168.1.20:8080` to check it works.
7. Open `http://192.168.1.20:8080/qr` on the computer (or tap the **QR** button bottom-right of the menu) and print the QR code. Do **not** print it from `localhost` — phones can't open "localhost".

### Tips
- Guests must be on the bar's Wi-Fi; the site is not reachable from mobile data.
- Give the computer a **fixed IP** in your router settings, otherwise the address (and printed QR) can change.
- Allow Node.js through the computer's firewall when asked.
- The computer must stay on while the bar is open.
- Easier alternative: click **Publish** in Lovable — the site gets a public address that works on any network, and you print the QR from there.

## Editing the menu
Menu items and prices live in `src/lib/menu.ts`. Shisha rules are in `src/routes/policy.tsx`.
