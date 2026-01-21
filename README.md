# DiscoPanel-Tailscale

A simple tool to quickly start and stop Minecraft servers for playing with friends. This project is intended for personal use and testing only. It is **not safe for production or public servers**.

> ⚠️ This project only supports **one active server at a time**. You can technically run multiple servers, but commands will only affect one.

## Features

- Start, stop, and restart a Minecraft server with ease.
- Automatically fetch Tailscale IP for easy local access.
- Simple web panel (`DiscoPanel`) integration.
- Multi-language support for UI (English, Spanish, Portuguese).

## ⚠️ Important Notes

- **Do not use this for production or public servers.**
  - No isolated backend.
  - Not security-tested.
- Only tested on **Arch Linux**.
- Requires manual login to **Tailscale**.
- Not affiliated with **Tailscale** or **DiscoPanel**.

## Dependencies

- `curl`
- `docker`
- `docker-compose`
- `make` / `Makefile`

## Ports

- Web server: `80`
- DiscoPanel: `8080`
- Minecraft server: `25565`

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/alimascarello/DiscoPanel-Tailscale.git
cd discopanel-launcher
```

2. Ensure all dependencies are installed:

```bash
Docker, Docker Compose, curl, make
```

3. Start the server and panel:

```bash
make up
```

4. Tailscale is isntalled, but you need run and login manually:

```bash
sudo tailscale up
sudo tailscale login
```

5. Stop the server:

```bash
make down
```

## Usage Notes

- The web panel will show the server status, player count, and allow starting, stopping, or restarting the server.
- Copy IP to clipboard via the panel for easy connection.
- Only one server is managed at a time via the panel.

## Acknowledgements

- This project is for personal/fun use only. No guarantees are provided, and you are responsible for any issues or data loss.
- This project uses **Tailscale** and **DiscoPanel**, but I am **not affiliated** with either project.
- I did not create Tailscale or DiscoPanel, and I have no contact with their teams.
- This project is purely a personal launcher/tool to simplify starting and stopping Minecraft servers for private use.

## License & Attribution

This project is licensed under the GNU Affero General Public License v3 (AGPLv3).

This project uses third-party software:

- **DiscoPanel** - MIT License  
  Copyright (c) 2025 Nicholas W. Heyer  
  [MIT License](https://github.com/nwheyer/discopanel/blob/main/LICENSE)

- **Tailscale** - BSD 3-Clause License  
  Copyright (c) 2020 Tailscale Inc & AUTHORS  
  [BSD 3-Clause License](https://github.com/tailscale/tailscale/blob/main/LICENSE)

This project is **not affiliated** with DiscoPanel or Tailscale.

This project is licensed under the GNU Affero General Public License v3 (AGPLv3). See [LICENSE](./LICENSE) for details.
