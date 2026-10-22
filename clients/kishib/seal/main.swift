// Kišib's seal in the macOS menu bar (the Dubsar runner cMIP, draft 3,
// section 10; asked by Nobody, allegedly: "can it be shown in the top bar on
// macOS, so one knows it is active?"; "Yes, I do want it").
//
// Kišib.app is a launcher with no Dock icon, and closing a Mac window never
// ends its program: the seal gives Kišib a place to be seen and to be quit.
// Its look follows the runner: off, a hollow seal; locked, a padlock; on, a
// full seal; and a number beside it while an app's request waits. Its menu:
// Open Kišib, Lock now, Quit Kišib, Turn off (asked first).
//
// It talks to Kišib's own program on this computer only: the port from
// Kišib's folder (`run.json`), a token the program writes there at each start
// (`seal.json`, owner only), sent in a header no web page may send without
// asking first. It keeps nothing and holds no key.
//
// Built by scripts/make-app.sh where Apple's command-line tools are present.
// Never on Linux, never on the web.
//
//   kishib-seal [--dir DIR]                 the seal, in the menu bar
//   kishib-seal [--dir DIR] --state         print the runner's state, and exit
//   kishib-seal [--dir DIR] --lock|--quit|--off|--open
//                                           do it, print the answer, and exit
//
// TEST IDENTITIES ONLY, until MOR is frozen.

import Foundation
#if canImport(AppKit)
import AppKit
#endif

/** Kišib's program, as its folder names it. */
struct Door {
    let dir: URL

    /** Its port and the seal's token, or nil where Kišib's program is not running. */
    func read() -> (port: Int, token: String)? {
        guard let run = try? Data(contentsOf: dir.appendingPathComponent("run.json")),
              let r = (try? JSONSerialization.jsonObject(with: run)) as? [String: Any],
              let port = (r["port"] as? NSNumber)?.intValue,
              let seal = try? Data(contentsOf: dir.appendingPathComponent("seal.json")),
              let s = (try? JSONSerialization.jsonObject(with: seal)) as? [String: Any],
              let token = s["token"] as? String
        else { return nil }
        return (port, token)
    }

    /** Ask the program; its answer, or nil where it does not answer. */
    func call(_ path: String, post: Bool, done: @escaping ([String: Any]?) -> Void) {
        guard let at = read(), let url = URL(string: "http://127.0.0.1:\(at.port)\(path)") else {
            done(nil)
            return
        }
        var req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 5)
        req.httpMethod = post ? "POST" : "GET"
        req.setValue(at.token, forHTTPHeaderField: "mor-seal")
        URLSession.shared.dataTask(with: req) { data, resp, _ in
            guard let data = data,
                  let http = resp as? HTTPURLResponse, http.statusCode == 200,
                  let obj = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
            else {
                done(nil)
                return
            }
            done(obj)
        }.resume()
    }

    /** The same, waiting for the answer (the command-line modes). */
    func callNow(_ path: String, post: Bool) -> [String: Any]? {
        let sem = DispatchSemaphore(value: 0)
        var out: [String: Any]?
        call(path, post: post) { obj in
            out = obj
            sem.signal()
        }
        sem.wait()
        return out
    }
}

let args = CommandLine.arguments
var dirPath = NSHomeDirectory() + "/mor-kishib"
if let i = args.firstIndex(of: "--dir"), i + 1 < args.count { dirPath = args[i + 1] }
let door = Door(dir: URL(fileURLWithPath: dirPath))

let commands: [String: (path: String, post: Bool)] = [
    "--state": ("/seal/state", false),
    "--lock": ("/seal/lock", true),
    "--quit": ("/seal/quit", true),
    "--off": ("/seal/off", true),
    "--open": ("/seal/open", true),
]

if let cmd = args.first(where: { commands[$0] != nil }), let c = commands[cmd] {
    // A command: done, its answer printed as JSON, and exit (1 where Kišib's program did not answer).
    guard let out = door.callNow(c.path, post: c.post),
          let data = try? JSONSerialization.data(withJSONObject: out, options: [.sortedKeys]),
          let text = String(data: data, encoding: .utf8)
    else {
        print("{\"state\":\"not running\"}")
        exit(1)
    }
    print(text)
    exit(0)
}

#if canImport(AppKit)
/** The seal itself, in the menu bar. */
final class Seal: NSObject {
    let door: Door
    let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
    let menu = NSMenu()
    let said = NSMenuItem(title: "Kišib", action: nil, keyEquivalent: "")
    var lockItem = NSMenuItem()
    var offItem = NSMenuItem()
    var state = "not running"
    var waiting = 0
    var timer: Timer?

    init(door: Door) {
        self.door = door
        super.init()
        menu.autoenablesItems = false
        said.isEnabled = false
        menu.addItem(said)
        menu.addItem(NSMenuItem.separator())
        add("Open Kišib", #selector(openKishib))
        lockItem = add("Lock now", #selector(lockNow))
        add("Quit Kišib", #selector(quitKishib))
        menu.addItem(NSMenuItem.separator())
        offItem = add("Turn off…", #selector(turnOff))
        item.menu = menu
        show(nil)
        refresh()
        timer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in self?.refresh() }
    }

    @discardableResult
    func add(_ title: String, _ action: Selector) -> NSMenuItem {
        let m = NSMenuItem(title: title, action: action, keyEquivalent: "")
        m.target = self
        menu.addItem(m)
        return m
    }

    func refresh() {
        door.call("/seal/state", post: false) { obj in
            DispatchQueue.main.async { self.show(obj) }
        }
    }

    /** Its look: off, a hollow seal; locked, a padlock; on, a full seal; a number while a request waits. */
    func show(_ obj: [String: Any]?) {
        state = obj?["state"] as? String ?? "not running"
        waiting = (obj?["waiting"] as? NSNumber)?.intValue ?? 0
        let symbol = state == "on" ? "seal.fill" : state == "locked" ? "lock.fill" : "seal"
        let words: String
        switch state {
        case "on": words = "Kišib’s runner is on"
        case "locked": words = "Kišib’s runner is locked: give its passphrase in Kišib"
        case "off": words = "Kišib’s runner is off: Kišib holds nothing"
        default: words = "Kišib is not running"
        }
        if let b = item.button {
            if #available(macOS 11.0, *), let img = NSImage(systemSymbolName: symbol, accessibilityDescription: words) {
                img.isTemplate = true
                b.image = img
                b.imagePosition = .imageLeading
                b.title = waiting > 0 ? " \(waiting)" : ""
            } else {
                b.image = nil
                b.title = (state == "on" ? "●" : state == "locked" ? "🔒" : "○") + (waiting > 0 ? " \(waiting)" : "")
            }
            b.toolTip = words
        }
        said.title = waiting > 0 ? "\(words) · \(waiting) waiting" : words
        lockItem.isEnabled = state == "on"
        offItem.isEnabled = state == "on" || state == "locked"
    }

    /** Open Kišib: its page, paired by a one-time link; where it is not running, the app is started. */
    @objc func openKishib() {
        if state == "not running" {
            _ = NSWorkspace.shared.open(URL(fileURLWithPath: NSHomeDirectory() + "/Applications/Kishib.app"))
            return
        }
        door.call("/seal/open", post: true) { obj in
            guard let s = obj?["url"] as? String, let u = URL(string: s) else { return }
            DispatchQueue.main.async { _ = NSWorkspace.shared.open(u) }
        }
    }

    @objc func lockNow() {
        door.call("/seal/lock", post: true) { _ in
            DispatchQueue.main.async { self.refresh() }
        }
    }

    /** Quit Kišib: its program ends, the runner locked first; the seal goes with it. */
    @objc func quitKishib() {
        if state == "not running" {
            NSApp.terminate(nil)
            return
        }
        door.call("/seal/quit", post: true) { _ in
            DispatchQueue.main.async { NSApp.terminate(nil) }
        }
    }

    /** Turn off, asked first: it erases everything. */
    @objc func turnOff() {
        let a = NSAlert()
        a.alertStyle = .warning
        a.messageText = "Turn Kišib’s runner off?"
        a.informativeText = "It erases everything: every signing key it holds, every app paired with it, and what it signed and opened. Turned on again, it starts from nothing."
        a.addButton(withTitle: "Turn it off, and erase everything")
        a.addButton(withTitle: "Cancel")
        NSApp.activate(ignoringOtherApps: true)
        guard a.runModal() == .alertFirstButtonReturn else { return }
        door.call("/seal/off", post: true) { _ in
            DispatchQueue.main.async { self.refresh() }
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let seal = Seal(door: door)
withExtendedLifetime(seal) { app.run() }
#else
print("Kišib’s seal is the Mac’s only: on this machine, use --state, --lock, --quit, --off or --open.")
exit(2)
#endif
