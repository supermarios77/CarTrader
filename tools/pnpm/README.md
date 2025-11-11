# Offline pnpm Binary

Download the `pnpm-linuxstatic-x64` artifact that matches `PNPM_VERSION` and place it in this folder before running `docker compose build` if you want to avoid network downloads inside Docker. The Dockerfiles treat the file as optional; if it is absent, they fall back to fetching the binary from GitHub.

