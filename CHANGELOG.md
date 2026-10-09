# Changelog

## Sega Rally Linux & Steam Deck v0.1.0

The first Linux version: Sega Rally on the Steam Deck and any 64-bit Linux PC (Vulkan), nothing to install.
[The Linux guide](LINUX.md).

- **True full screen at your screen's native resolution**, the arcade's whole picture with its HUD and the world widened;
  the same Vulkan renderer as Port0r: Rally VR.
- **Up to 240 images a second** (the screen's maximum, or 60, 120, 180, 240), **supersampling up to 200 %**,
  **anti-aliasing up to x8**: 120 images a second at 200 % of 1440p with the HD textures on a Radeon RX 7800 XT.
- **Steady pacing**: every arcade picture held exactly the same number of refreshes (Settings > Image > Pacing), or
  the lowest latency.
- **Keyboard** (by key position: ZQSD on AZERTY) and **every gamepad** at once, remappable, with rumble; the mouse
  works in the settings.
- **Steam Deck**: add `Port0r Rally.sh` as a non-Steam game; the Deck's controls work as a gamepad.
- **Your game files found by themselves** in Downloads, anywhere in your home folder or on the SD card, zipped HD pack
  included; or drop them on the window.
- **Record your races** (F9, or Settings > Game on the Deck): exactly 60 images a second with the game's sound, four
  quality profiles from Maximum to Light, encoded by the graphics card; F12 takes a screenshot.
- **Updates from inside the game**: from the next version on, the game checks GitHub at launch, shows what's new
  before anything is installed, installs it (SHA-256 checked, the previous version kept) and restarts.
- The Sega Rally mods, picture styles, HD textures, ten languages, the Discord leaderboard.
- Your own game files (MAME 0.289), never included.

## Sega Rally Android v0.1.0

The first Android version: Sega Rally on phones and tablets (Android 8+, Vulkan). [The Android guide](ANDROID.md).

- **True full screen**: the arcade's whole picture, HUD included, the world widened to fill the screen; the game's own
  camera, never tilted.
- **60 images a second** on the tested tablet at its full 3200x2136, with a dynamic resolution (Settings > Image >
  Resolution: Auto) and a sharpening pass that keeps the picture crisp when it lowers.
- **Touch controls designed for racing**: a steering slider that appears under the left thumb, the brake and the gas
  side by side, gears above them, all sized in real millimetres; size, opacity and progressive gas in Settings > Driving.
- **Steer by turning or tilting the device**, with angle, smoothing, dead zone and recentring.
- **Any gamepad**: every action remappable in Settings > Gamepad, Start pauses, Select held shows or hides the touch
  controls, and the settings work with the gamepad.
- The Rally VR settings that make sense on a flat screen, the Sega Rally mods, HD textures, vibrations, ten languages,
  the Discord leaderboard.
- **Updates from inside the game**: from the next version on, the game checks GitHub at launch, shows what's new
  before anything is installed, and installs it (SHA-256 checked) after Android's confirmation.
- Installs next to Port0r: Rally VR on a Quest; your own game files (MAME 0.289), never included.

## Port0r: Rally VR v0.2.4

- **Updates from inside the game**: Rally VR checks for a new version once at launch (Settings > Game, can be switched
  off) and shows what's new before anything is installed. Download and install from the headset, then choose Open to
  play the new version. The first time, the headset asks you to allow Port0r to install apps (once).
- Sound comes back by itself after a change of audio output (Bluetooth headphones connected or removed), and no longer
  drifts after a pause or the menu.
- Smaller Port0r watermark, fixed in the bottom-left corner.
- Your settings, records and game files are kept. This one time, install v0.2.4 over v0.2.3 with SideQuest or adb:
  v0.2.3 has no in-game update yet.

## Sega Rally Switch v0.5.3

- Remap ten driving actions in Workshop > Driving > Controls. Press A, release the buttons, then press your chosen button. B saves and returns; X restores defaults. The Workshop and clean-exit shortcuts remain fixed.
- Choose mirrored scenery or plain black sides for the original 4:3 picture, in Settings > Display.
- Check for Switch updates at startup, or manually in Sharing > GitHub updates. Automatic checks can be disabled and that choice is saved.
- Read and scroll the release changelog before downloading. Press + on the update notification to open the notes directly. These notes come from the matching stable Switch release on GitHub; Quest releases are excluded.
- Download updates in the game. SHA-256 and the NRO header are verified before installation is offered. A second confirmation leaves the race, saves and restarts the new version. B cancels a download or returns without installing.
- Settings, scores, replays, ghosts and HD textures are kept. The original NRO stays available as a fallback; the HOME tile does not need reinstalling.
- No changes to MAME emulation, driving physics or graphics in this update. No overclocking.

### Updating from v0.5.1 or v0.5.2

Install v0.5.3 manually once: close the game and replace `/switch/segarally/gpt61sol/segarally.nro` with this release's NRO, or copy the ZIP onto the SD root. Keep all existing data folders. Future newer stable Switch releases can then be installed from the game.

No ROM, BIOS or HD texture pack is included. See SWITCH.md / INSTALL.md for the required folders. Video capture and replay-to-video conversion are not included.


Validation: Switch compilation, native menu rendering and host tests for release checks, downloads, cancellation, corrupt files and fallback. The future-update handoff has not yet been tested on a physical Switch.

## Port0r: Rally VR v0.2.3

- **Your game files can be anywhere on the headset**, not only in `Download`: a `ROMS` folder you already use for other
  emulators works too (up to five folders deep). The pages that ask for the files now say so, in all ten languages
  (a player on Reddit: "the game notified me it needed to be in the Downloads folder").
- **A corrected file is picked up wherever you put it**: the most recent copy anywhere on the headset replaces the old
  one by itself (before, only a file in `Download` was looked at).
- Nothing else changes in the game: same picture, same smoothness, same settings. Install it over v0.2.2: your
  settings, records and files are kept.

## Port0r: Rally VR v0.2.2

- **Steering on the right stick**, a wish from the Discord: settings panel > Game > **Steering stick** > *Right*. The
  right stick steers and the side grips shift gears (the right stick's up / down shift is off, so that a diagonal never
  changes gear). *Left* stays the default.
- **A Controls page** in the settings panel (the button next to *Resume*): every button of the game, in your language,
  and it follows your settings (right-stick steering, VR wheel).
- **The settings panel scrolls** when a tab is longer than the panel, with either thumbstick or the bar on its right:
  the *Resume* button no longer covered the last settings of the *Game* tab. Long names and sentences now go onto a
  second line instead of being cut, in all ten languages.
- **The app's own icon** in the headset's library (earlier versions showed the project's first icon).
- Nothing else changes in the game: same picture, same smoothness, same settings.

## Port0r: Rally VR v0.2.1

- **Clear message when your game files are the wrong version.** If MAME can't load your set, a page says so in your
  language ("Wrong version of the game files"), lists the files that are missing or don't match, and tells you what to
  do. Before, the app went back to its menu without a word.
- **Your corrected files are picked up.** Put a new `srallyc.zip` (or `segabill.zip`) in `Download` and come back to
  the app: it replaces the copy it made before and the game starts by itself. v0.2.0 kept its first copy forever.
- No more game list in front of a game that failed to start.

## Port0r: Rally VR v0.2.0 (first public release)

- True stereoscopic 3D at real scale, the arcade's exact colours, locked 60 images a second smoothed to 120 Hz.
- Manual gearbox on the side grips; vibrations on wall hits, jumps, landings and contacts with other cars.
- HD texture packs found and imported by themselves (Jean-seb's pack for Sega Rally), offered once per launch with
  "Don't ask again".
- Game files found anywhere on the headset's storage; setup screen in the headset's language.
- Records and the cabinet's settings saved.
- Settings panel in ten languages: display, image, smoothness, game, mods.
- Mods: free timer, free play, sporty automatic gearbox, adaptive steering, mirrored track (co-driver mirrored too),
  telemetry bar; styles colour, black and white, comic, night.
- The creek after the Desert checkpoint with its moving sky reflection, like the cabinet.
- Discord leaderboard: link your Discord once (sign in from the headset's browser or alloxr.info/port0r/link, or
  `!link CODE`), then publish the stages you finished at the end of a game; one board per course, top 30.
- Resolution setting (Native / High / Maximum), High by default; dynamic resolution only lowers it under load, and the
  headset smooths the picture above its native resolution.
- HD textures sent to the GPU during the boot screens, kept from one course to the next: no hitch on the first hill.
- Fixed screens (warning, logo, game over) at 120 Hz; the game over shows the SEGA RALLY logo like the cabinet.
