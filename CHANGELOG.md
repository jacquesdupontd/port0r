# Changelog

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
