![Port0r](assets/port0r-header.png)

# Port0r

**Arcade classics in true stereoscopic 3D, on Meta Quest.** Not a flat screen floating in a dark room: the real 3D of the
game, rebuilt for each eye, at real scale. The car is in front of you, the hills have volume, the speed is physical.

Port0r runs the real arcade game through an emulator and re-projects the 3D scene each board draws, per eye, through
OpenXR. One app per game, released one at a time.

## Releases

| Game | Status | Download |
| --- | --- | --- |
| **Port0r: Rally VR** (Sega Rally Championship, Sega Model 2, 1995) | Out now, v0.2.0 | [Releases](../../releases) · itch.io · SideQuest |
| Time Crisis (Namco System 22, 1995) | Coming soon | |
| Virtua Cop, Daytona USA, The House of the Dead, Sega Super GT, Top Skater, Virtua Racing, Dirt Dash, Time Crisis II | In progress | |

Meta Quest 3 is the reference headset. Quest 3S and Quest 2 support is being enabled.

## Bring your own game files

**No game data is included.** You need your own, legally owned copy of the arcade game. We never provide, link to or
discuss where to download game files: please don't ask.

For Port0r: Rally VR, the files are the MAME set `srallyc.zip` and `segabill.zip`.

## Install (Port0r: Rally VR)

1. Turn on Developer Mode on your Quest (Meta Horizon app on your phone > Devices > Headset settings > Developer mode).
2. Install the APK with [SideQuest](https://sidequestvr.com) ("Install APK file") or `adb install -r`.
3. Copy your game files to the headset (USB cable to your computer, or the headset's browser). The **Download** folder
   is the usual place, but the app looks everywhere on the headset's storage.
4. Launch **Port0r: Rally VR** from Library > Unknown sources. The first time, allow "All files access": the app only
   reads its game files and the optional HD texture pack.
5. Come back to the app: the game is copied in and starts by itself.

Updating from v0.1.0: it used another app id. Uninstall it, then install the new version; your files stay on the headset.

## What you get in Port0r: Rally VR

- True stereoscopic 3D at real scale, with the arcade's exact original colours.
- Rock-solid 60 images a second, smoothed to 120 Hz by the headset. No stutter.
- The HUD on a comfortable plane, the speedometer needle inside its dial.
- Manual gearbox on the side grips (left down, right up).
- Vibrations on wall hits, jumps, landings and contacts with other cars.
- Your records and the cabinet's settings are saved.
- **Mods** (settings panel): free timer, free play, sporty automatic gearbox, adaptive steering, mirrored track (the
  co-driver's calls mirrored too), telemetry bar, and picture styles (colour, black and white, comic, night).
- Settings panel in ten languages (English, Français, Deutsch, Español, Italiano, Português, Русский, 日本語, 简体中文,
  한국어), following the headset's language.

### Optional: HD textures

The community HD texture pack is made by **Jean-seb**: get it from his video
["Sega Rally Championship HD textures pack : new version"](https://www.youtube.com/watch?v=K1d4jO6rP2Y) (download link
in its description). Put his zip on the headset next to the game files: the app finds it and imports it by itself. All
credit to Jean-seb.

### Controls

| | |
| --- | --- |
| Steering | Left stick |
| Gas / brake | Right trigger / left trigger |
| Gears (manual cars) | Side grips: left down, right up (the right stick works too) |
| View | B |
| Settings panel | Left menu button (aim with the right controller, trigger or A to click) |
| Pause | Click both sticks |

## Community and support

- **Discord**: questions, setup help, bug reports, and an assistant bot that knows the project.
- **Bugs**: open an issue here with your headset model, the app version and what you saw.
- **Support the work**: GitHub Sponsors. Donations support the engine's development; they are not a purchase of any game,
  and there is no paywall or early access for money.

## Legal

Port0r is a free, non-commercial fan project. It is **not affiliated with, endorsed by or connected to SEGA, Namco,
Meta or any rights holder.** All trademarks belong to their owners.

The apps bundle only permissively licensed open-source components (MAME's BSD-3-Clause parts, OpenXR, zlib and others);
their copyright notices ship with every release (`THIRD-PARTY-NOTICES.txt`, also inside the app). Port0r's own source
code is not public for now.
