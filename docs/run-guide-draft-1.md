# Running your own home or relay

*Draft 1, 1 October 2026 (roadmap step 10a). A first draft for Nobody, allegedly, to review, written from how MOR's first three homes were set up. It is a long-form document (the long-form text format cMIP): published at step 17 as a signed act, behind the Run door. Until then, MOR runs test identities only, and everything on every relay is wiped before the first real acts.*

## In plain words

MOR keeps everything as signed acts, and relays are where acts are kept. A relay is a small web server: anyone can put an act on it and anyone can fetch one back. It cannot forge anything, since every act is signed and every reader checks the signature. All a relay can do wrong is lose acts or refuse to hand them over, and that is why there are many.

A home is a relay with a few more duties. When an identity is born, its genesis names its homes, and each home signs a receipt for it. When the identity changes its key, its homes receipt the change, and the change counts once enough of them have. Each home keeps a numbered log of its receipts and signs a fingerprint of the whole log every time it grows.

The same program runs both. You can run one:

- on a small server with a name, so that anyone can reach it over HTTPS;
- on a computer at home, reachable only through Tor at an onion address, so that nothing is opened on your router and your address stays hidden;
- or both, as MOR did at the start.

## How MOR started

Three homes, run by three operators, so that the rule "a key change counts once a majority of homes receipt it" could be tried for real. Two homes ran on one small public server, each under its own account and its own operator. The third ran on a home computer at an onion address and kept acts only for the identities it was told to serve.

*Two homes on one server are not independent: if that server stops, one home of three is left, which is not a majority. A home can move to a server of its own later without any identity changing.*

## What you need

- A server or computer running Linux or macOS. One processor and 2 GB of memory are enough.
- For a public home: a domain name, or a name under one (for example `home.example.org`), pointing at the server's address, so that it can have an HTTPS certificate.
- For a home at an onion address: Tor.
- Rust, to build the program: <https://rustup.rs>. On Debian or Ubuntu, a C compiler too (`sudo apt install build-essential`).
- An operator identity for a home (see below). A basic relay needs none.

## 1. Build the program

From a copy of the code repository:

```
cargo build --release -p mor-relay
```

The program is `target/release/mor-relay`. Copy it to `/usr/local/bin/` on the machine that runs it. On a server with 2 GB of memory or less, the build needs a temporary swap file. If you build on another computer, copy the program over and compare its SHA-256 on both sides.

Check the copy of the code first: every release of MOR is published on MOR as a signed list of its files, and the repo client compares a checkout with it, file by file.

## 2. An operator identity, for a home

A home signs its receipts as its operator: an ordinary MOR identity, made like anyone's, somewhere other than the server. Make it with the genesis client, self-hosted at the home it will run (`self@` before the address), then export what the home needs:

```
mor-genesis new --file operator.json --home self@https://home.example.org
mor-genesis export-operator --file operator.json --out operator-files
```

The home does not exist yet, so the genesis is not sent now: the home sends it itself once it runs.

This writes `operator.key`, the identity's everyday signing key and the act that bound it, and `operator-chain.mor`, its identity-chain acts. The safety key stays in `operator.json`, off the server: whoever holds it can replace the operator's keys if the server is ever taken.

*Stated cost:* the everyday signing key sits on the server, because a home signs around the clock. Many will prefer a separate identity for running a home rather than their main one.

## 3a. A public home, on a server

1. Install Caddy, which fetches the HTTPS certificate by itself. Install Tor too, so that the home can reach homes at onion addresses when it checks on other homes.
2. Tell Caddy where the home listens, in `/etc/caddy/Caddyfile`, then reload Caddy:
   ```
   home.example.org {
       reverse_proxy 127.0.0.1:8080
   }
   ```
3. Give the home an account of its own, which can write only its own folder, so that a flaw in the program cannot reach the rest of the server:
   ```
   sudo useradd --system --home-dir /var/lib/mor-home --no-create-home --shell /usr/sbin/nologin mor
   sudo install -d -o mor -g mor -m 700 /var/lib/mor-home
   ```
4. Set it up, open to anyone, with the operator files copied to the server:
   ```
   sudo -u mor mor-relay init --dir /var/lib/mor-home --role home --base https://home.example.org --operator-key operator.key --operator-chain operator-chain.mor
   ```
   It prints a one-time code for the management page. Then delete the copies of the operator files outside `/var/lib/mor-home`.
5. Keep it running, with a systemd service, `/etc/systemd/system/mor-home.service`:
   ```
   [Unit]
   Description=MOR home
   After=network-online.target tor.service
   Wants=network-online.target

   [Service]
   User=mor
   Group=mor
   ExecStart=/usr/local/bin/mor-relay run --dir /var/lib/mor-home --listen 127.0.0.1:8080 --tor-proxy socks5h://127.0.0.1:9050
   Restart=always
   RestartSec=5
   NoNewPrivileges=yes
   ProtectSystem=strict
   ProtectHome=yes
   ReadWritePaths=/var/lib/mor-home
   PrivateTmp=yes

   [Install]
   WantedBy=multi-user.target
   ```
   Then `sudo systemctl enable --now mor-home`.

A second home on the same server needs its own operator, its own account and folder, its own port (for example 8081) and its own name in Caddy, so that neither home can read the other's key.

## 3b. A home on a computer at home, at an onion address

1. Install Tor (macOS: `brew install tor`; Debian or Ubuntu: `sudo apt install tor`).
2. Add an onion service to Tor's configuration (`torrc`), with a folder of your choice, and restart Tor:
   ```
   HiddenServiceDir /path/to/mor-onion
   HiddenServicePort 80 127.0.0.1:8080
   ```
   The file `hostname` in that folder now holds the onion address. Keep that folder private: it is the address's key.
3. Set the home up, for the identities you list only:
   ```
   mor-relay init --dir ~/mor-home --role home --base http://YOUR-ONION-ADDRESS.onion --allowlist --operator-key operator.key --operator-chain operator-chain.mor
   ```
4. Run it, reachable only through Tor:
   ```
   mor-relay run --dir ~/mor-home --listen 127.0.0.1:8080 --tor-proxy socks5h://127.0.0.1:9050
   ```
5. To keep it running, start Tor and the home when you log in: on macOS, a login agent for each (`launchctl`); on Linux, a systemd service as above. A home started by a login agent that restarts it is stopped with `launchctl bootout` and started again with `launchctl bootstrap`.

The home answers only while the computer is on. Identities that name it should name other homes too.

## 3c. A second address for a home already running

A home on a public server can also answer at an onion address, so that visitors can reach it privately. Add an onion service to Tor on the server as in 3b, pointing at the home's port (Tor as an onion service only, never a relay or an exit), then, with the home stopped:

```
sudo -u mor mor-relay address --dir /var/lib/mor-home --add http://YOUR-ONION-ADDRESS.onion
```

and start it again. `mor-relay address --dir DIR` lists its addresses. A home whose operator identity it holds itself (set up with `--new-test-operator`) also publishes the operator's next routes naming the new address, so that clients find it there; a home whose operator was made with the genesis client says so, and the operator's routes are then published from where its identity is kept.

## 4. Run it from the management page

Every relay serves a page at `/manage/` on its own address. Open it in a browser (for the home at an onion address, at `http://127.0.0.1:8080/manage/` on the computer itself) and pair the browser with the code `init` printed. A new code: `mor-relay pair --dir DIR` (on a server, `sudo -u mor mor-relay pair --dir /var/lib/mor-home`). The browser keeps a key of its own for that address, and signs every request with it.

From the page, without a terminal:

- see what the relay holds, and the latest arrivals;
- list the identities a list-only home serves;
- for identities whose owners asked for it, approve each key change before it counts;
- limit how many new identities a public home takes in 24 hours (a public home is open to anyone, so set one);
- rotate the operator's keys, or close the home for good;
- pair another device, or unpair one.

## 5. Tell people

An identity names a home in its genesis by the operator's identity and the home's address. Give both to whoever wants to use your home: the operator's identity hash (`mor-relay show --dir DIR` prints it) and the address. To check from outside that the home answers, fetch `/info` at its address.

## 6. A basic relay

A basic relay keeps and serves acts without receipting identities. It is set up the same way, with `--role relay` and no operator files.

## Keeping it going

- **Back up the folder.** It holds the relay's data and, for a home, `operator.key`. Keep the backup as private as the key.
- **Updating.** Build the new program, replace it, and restart the service (`sudo systemctl restart mor-home`). The data is kept.
- **What a relay sees.** It sees every public act it keeps, who asked for what, and when. Private acts and sealed deliveries are carried unopened: a relay sees that something came for an identity, and its size, never what it says or who sent it.
- **What it cannot do.** It cannot forge an act or a receipt in anyone's name but its operator's. It can refuse, forget or withhold, and readers who ask other relays find out.
