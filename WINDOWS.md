![Sega Rally on PC: PCVR and desktop](assets/windows/header.jpg)

<p align="center">
  <a href="https://github.com/jacquesdupontd/port0r/releases/tag/pc-v0.1.7"><img alt="Download Sega Rally for Windows PC v0.1.7 (free)" src="https://img.shields.io/badge/Download-Sega%20Rally%20PC%20v0.1.7%20%C2%B7%20free-9b7bff?style=for-the-badge&logo=windows&logoColor=white" height="42"></a>
</p>

<p align="center">
  <a href="https://port0r.com"><b>port0r.com</b></a> ·
  <a href="https://discord.gg/XMk7GgapuN"><b>Discord</b></a> ·
  <a href="https://github.com/jacquesdupontd/port0r/releases/tag/pc-v0.1.7"><b>Download</b></a> ·
  <a href="https://ko-fi.com/port0r"><b>Ko-fi</b></a> ·
  <a href="https://github.com/sponsors/jacquesdupontd"><b>Sponsor</b></a> ·
  <a href="README.md"><b>Port0r on Meta Quest (VR)</b></a> ·
  <a href="LINUX.md"><b>Linux & Steam Deck</b></a> ·
  <a href="MAC.md"><b>Mac</b></a> ·
  <a href="SWITCH.md"><b>Nintendo Switch</b></a> ·
  <a href="ANDROID.md"><b>Android</b></a>
</p>

# Sega Rally on PC: PCVR and desktop

**The 1995 arcade Sega Rally Championship on a Windows PC, free: in your VR headset through SteamVR or Quest Link, or on
the screen, with the cockpit view and Logitech wheels driven by the force feedback of the arcade cabinet.**

> ### Download Sega Rally for Windows PC v0.1.7 (free)
> **[Port0r-SegaRally-PC-v0.1.7-Setup.exe](https://github.com/jacquesdupontd/port0r/releases/download/pc-v0.1.7/Port0r-SegaRally-PC-v0.1.7-Setup.exe)**
> (the installer), or **[Port0r-SegaRally-PC-v0.1.7.zip](https://github.com/jacquesdupontd/port0r/releases/download/pc-v0.1.7/Port0r-SegaRally-PC-v0.1.7.zip)**
> to unpack anywhere without installing.

## Contents

- [What you need](#what-you-need)
- [Install](#install)
- [Play in VR](#play-in-vr)
- [Play on the screen](#play-on-the-screen)
- [A wheel](#a-wheel)
- [The views](#the-views)
- [HD textures](#hd-textures)
- [The leaderboard on Discord](#the-leaderboard-on-discord)
- [Your data](#your-data)
- [Updates and uninstall](#updates-and-uninstall)
- [Troubleshooting](#troubleshooting)
- [Help, bugs, support](#help-bugs-support)
- [Credits and legal](#credits-and-legal)

## What you need

- A **Windows 10 or 11** PC (64-bit) with a **Vulkan** graphics card (AMD, NVIDIA or Intel with a current driver).
  Tested on a Radeon RX 7800 XT.
- For VR: a PC VR headset through **SteamVR** (a Quest by Steam Link, a Valve Index, a Vive...) or a Quest by
  **Quest Link**.
- **Your own** Sega Rally Championship arcade files, made for **MAME 0.289**: `srallyc.zip` and `segabill.zip`.
  Port0r never includes them and never says where to get them. No ROM requests on the Discord, please.
- Optional: a Logitech wheel (tested with a G29) or a gamepad, and Jean-seb's HD texture pack.

<a id="install"></a>

## Install

1. **Download** `Port0r-SegaRally-PC-v0.1.7-Setup.exe` and open it. The installer is not signed: if Windows shows
   "Windows protected your PC", click **More info**, then **Run anyway**. It installs for your account only, no
   administrator rights needed.
2. The **Port0r launcher** opens. Under **Game files**, click **Choose the files** and pick `srallyc.zip` and
   `segabill.zip`, **not unzipped**, wherever they are. You do this once: the game reads them where they are.
3. Click **Play in VR** or **Play on the screen**.

## Play in VR

Start **SteamVR** with your headset first (or **Quest Link** on a Quest), then click **Play in VR** in the launcher. The
launcher shows the VR runtime it found; with none, it says to install SteamVR. The game takes a few seconds to start, and
the launcher comes back when you quit.

Tested with a Quest 3 by Steam Link (120 Hz) and by Quest Link.

## Play on the screen

**Play on the screen** opens the game in a window: **F11** switches to full screen. The sound stays on the PC's speakers,
and the wheel, a gamepad or the keyboard drive it.

## A wheel

Plug a Logitech wheel (tested with a G29) before starting. It drives at once, with the **force feedback of
the arcade cabinet**: the cabinet's own drive board orders, replayed on the wheel's motor.

- **The menu, from the wheel**: Triangle opens it, the D-pad moves, Cross chooses, Circle goes back, the paddles change
  tab.
- **Settings > Wheel**: the rotation, the strength of the force and its direction, every button, and the pedals. If the
  pedals answer on the wrong axes, **Pedals > Find them**: press the gas, then the brake.
- Without a wheel: a gamepad (Xbox, PlayStation, 8BitDo...) or the keyboard.

## The views

The **VIEW** button changes the view: **cockpit**, **chase** and **on the road**. The cockpit view is on by default
(the **Cockpit view** switch in the settings turns it off). At the end of a race, the game's own cameras come back.

## HD textures

Jean-seb's community pack, optional. In the launcher, under **HD textures**: **Add the pack** and pick its zip. The same
place switches it on or off (**Use the HD textures**) and removes it (**Remove the pack**, click twice).

## The leaderboard on Discord

At the end of a game, Port0r offers to publish your times. The first time, it shows a code: link your Discord once, and
your times land in #leaderboard on the [Port0r Discord](https://discord.gg/XMk7GgapuN).

## Your data

Your settings, records and the HD pack are in `%APPDATA%\Port0r\srallyc` (paste it in the File Explorer's address bar).
The game itself is in `%LOCALAPPDATA%\Programs\Port0r\SegaRally`.

## Updates and uninstall

- **Update**: download the new installer and open it. Your settings, records and files are kept.
- **Uninstall**: Windows Settings > Apps > Installed apps > **Port0r: Rally VR** > Uninstall. Your data stays in
  `%APPDATA%\Port0r\srallyc` until you delete that folder.

## Troubleshooting

- **"Windows protected your PC"**: the installer is not signed; **More info**, then **Run anyway**.
- **VR: the game says the headset is not ready**: start SteamVR (or Quest Link) first, check the headset shows the
  SteamVR home, then **Play in VR** again.
- **A file is missing**: the launcher marks each file Ready or Missing; **Choose the files** again and pick the zip files
  themselves, not their unpacked content.
- **The pedals are swapped or do nothing**: Settings > Wheel > **Pedals > Find them**.

## Help, bugs, support

[Discord](https://discord.gg/XMk7GgapuN) (#install-help, #bugs) or a GitHub issue.

Port0r is free. If you like it, you can sponsor it on [GitHub Sponsors](https://github.com/sponsors/jacquesdupontd) or
buy me a coffee on [Ko-fi](https://ko-fi.com/port0r). Sharing it helps a lot too.

## Credits and legal

HD textures by Jean-seb. Sega Rally Championship is a trademark of SEGA. Windows is a trademark of Microsoft. Port0r is a
free fan project, not affiliated with SEGA, Microsoft, Valve or Meta. Built from MAME's BSD-3-Clause source files; every
component's license is in [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt).
