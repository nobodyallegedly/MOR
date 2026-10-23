// Nakišib's window on the Mac, and the app's own program: it starts
// Nakišib's program (the Rust program beside it in the app, `nakisib-program`)
// on 127.0.0.1, shows its page in a web view that keeps nothing on disk (a
// non-persistent store: no cache, no cookies, no history, no form state saved
// for a restore), goes nowhere but that address, and when the window is
// closed, ends Nakišib's program, which forgets everything with it. Built by
// scripts/make-app.sh where Apple's command-line tools are present; without
// them, the app opens Nakišib's page in the default browser instead, which
// may keep what a page shows in its own files: make-app.sh says so.
//
//   Nakisib.app/Contents/MacOS/nakisib            (this window; starts the program)
//   nakisib http://127.0.0.1:PORT/                (a page already served: shown only)

import AppKit
import WebKit

final class Window: NSObject, NSApplicationDelegate, NSWindowDelegate, WKNavigationDelegate {
  var base: URL?
  var program: Process?
  var window: NSWindow!
  var view: WKWebView!

  func applicationDidFinishLaunching(_ note: Notification) {
    let config = WKWebViewConfiguration()
    config.websiteDataStore = .nonPersistent()
    view = WKWebView(frame: .zero, configuration: config)
    view.navigationDelegate = self
    window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1180, height: 800), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
    window.title = "Nakišib"
    window.contentView = view
    window.delegate = self
    window.center()
    window.makeKeyAndOrderFront(nil)
    NSApp.activate(ignoringOtherApps: true)
    let args = CommandLine.arguments
    if args.count > 1, let u = URL(string: args[1]), u.host == "127.0.0.1" {
      show(u)
    } else {
      start()
    }
  }

  /// Nakišib's program, beside this one in the app, its address read from what it prints first.
  func start() {
    let me = URL(fileURLWithPath: CommandLine.arguments[0]).resolvingSymlinksInPath()
    let p = Process()
    p.executableURL = me.deletingLastPathComponent().appendingPathComponent("nakisib-program")
    p.arguments = ["--no-open"]
    let out = Pipe()
    p.standardOutput = out
    p.terminationHandler = { _ in DispatchQueue.main.async { NSApp.terminate(nil) } }
    do { try p.run() } catch {
      fatalError("Nakišib's program could not start: \(error)")
    }
    program = p
    out.fileHandleForReading.readabilityHandler = { h in
      let line = String(decoding: h.availableData, as: UTF8.self)
      if let r = line.range(of: #"http://127\.0\.0\.1:\d+/"#, options: .regularExpression), let u = URL(string: String(line[r])) {
        h.readabilityHandler = nil
        DispatchQueue.main.async { self.show(u) }
      }
    }
  }

  func show(_ u: URL) {
    base = u
    view.load(URLRequest(url: u))
  }

  // Only Nakišib's own address: any other is refused.
  func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    let u = action.request.url
    decisionHandler(base != nil && u?.host == base!.host && u?.port == base!.port && u?.scheme == "http" ? .allow : .cancel)
  }

  func windowWillClose(_ note: Notification) {
    program?.terminate()
    NSApp.terminate(nil)
  }

  func applicationWillTerminate(_ note: Notification) {
    program?.terminate()
  }
}

let app = NSApplication.shared
let delegate = Window()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
