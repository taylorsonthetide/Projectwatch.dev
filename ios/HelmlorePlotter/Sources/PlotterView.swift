import SwiftUI
import WebKit

final class PlotterModel: NSObject, ObservableObject, WKScriptMessageHandler, WKNavigationDelegate {
    @Published var connectionStatus = "Gateway disconnected"
    @Published var positionStatus = "Position not selected"
    @Published var internetEnabled = false
    @Published var host = "192.168.1.1"
    @Published var port = "10110"
    @Published var exportedURL: URL?
    @Published var boatValues = "No boat instruments received"
    private let gateway = MarineGateway()
    private let location = DeviceLocation()
    private weak var web: WKWebView?
    private var handler: LocalChartHandler?
    private var gatewayPosition = false
    private var rulesReady = false
    private let home = URL(string: "helmlore://chart/navigation.html")!
    override init() {
        super.init()
        gateway.onStatus = { [weak self] in self?.connectionStatus = $0 }
        gateway.onData = { [weak self] in self?.emit("helmlore-nmea-data", $0) }
        location.onStatus = { [weak self] in self?.positionStatus = $0 }
        location.onFix = { [weak self] in guard let self = self, !self.gatewayPosition else { return }; self.emit("helmlore-native-fix", $0) }
    }
    func makeWebView() -> WKWebView {
        let config = WKWebViewConfiguration()
        let root = Bundle.main.url(forResource: "AppWeb", withExtension: nil)!
        let loader = LocalChartHandler(root: root); handler = loader
        config.setURLSchemeHandler(loader, forURLScheme: "helmlore")
        config.userContentController.add(self, name: "helmlore")
        config.userContentController.addUserScript(WKUserScript(source: "window.HelmloreNative={send:(command,value)=>window.webkit.messageHandlers.helmlore.postMessage({command,value})};", injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let view = WKWebView(frame: .zero, configuration: config); web = view
        view.navigationDelegate = self; view.isInspectable = false
        let rule = "[{\"trigger\":{\"url-filter\":\"^https?://\"},\"action\":{\"type\":\"block\"}}]"
        WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "HelmloreOffline", encodedContentRuleList: rule) { [weak self, weak view] list, error in
            DispatchQueue.main.async {
                guard let self = self else { return }
                guard let view = view, let list = list, error == nil else { self.positionStatus = "Offline policy could not initialise"; return }
                view.configuration.userContentController.add(list); self.rulesReady = true; view.load(URLRequest(url: self.home))
            }
        }
        return view
    }
    func setInternet(_ enabled: Bool) {
        guard rulesReady, let view = web else { return }
        if enabled { view.configuration.userContentController.removeAllContentRuleLists(); internetEnabled = true; return }
        internetEnabled = false
        WKContentRuleListStore.default().lookUpContentRuleList(forIdentifier: "HelmloreOffline") { [weak self, weak view] list, _ in
            DispatchQueue.main.async {
                if let list = list { view?.configuration.userContentController.add(list) }
                else { view?.stopLoading(); self?.positionStatus = "Restart app to restore offline policy" }
            }
        }
    }
    func selectPosition(gateway useGateway: Bool) {
        gatewayPosition = useGateway
        emit("helmlore-native-source", ["source": useGateway ? "gateway" : "device"])
        if useGateway { location.stop(); positionStatus = "Gateway position selected · waiting for fresh RMC" }
        else { location.start() }
    }
    func connectGateway() {
        guard let value = UInt16(port), value > 0, MarineGateway.isPrivateIPv4(host) else { connectionStatus = "Enter a private IPv4 address and port 1–65535"; return }
        emit("helmlore-nmea-reset", [:]); selectPosition(gateway: true); gateway.connect(host: host, port: value)
    }
    func disconnectGateway() { gateway.disconnect(); emit("helmlore-nmea-reset", [:]); if gatewayPosition { emit("helmlore-native-source", ["source":"none"]); positionStatus = "Gateway position stopped" } }
    func suspend() { location.stop(); gateway.disconnect(); emit("helmlore-native-source", ["source":"none"]); positionStatus = "Recording and inputs stopped in background · select a source to resume" }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.request.url?.scheme == "helmlore", message.frameInfo.request.url?.host == "chart",
              let body = message.body as? [String:Any], let command = body["command"] as? String else { return }
        switch command {
        case "gps.start": selectPosition(gateway: false)
        case "gps.stop": location.stop(); positionStatus = "Position stopped"
        case "export":
            guard let value = body["value"] as? [String:Any], let name = value["filename"] as? String,
                  let text = value["text"] as? String, text.utf8.count <= 8_000_000,
                  name.count <= 120, !name.contains("/"), !name.contains("\\"), !name.contains(".."),
                  ["gpx","csv","json"].contains(URL(fileURLWithPath:name).pathExtension.lowercased()) else { return }
            do {
                let dir = FileManager.default.urls(for:.documentDirectory,in:.userDomainMask)[0].appendingPathComponent("Exports",isDirectory:true)
                try FileManager.default.createDirectory(at:dir,withIntermediateDirectories:true)
                let file = dir.appendingPathComponent(name); try Data(text.utf8).write(to:file,options:.atomic)
                exportedURL = file; positionStatus = "Export saved · open Connections to share it"
            } catch { positionStatus = "Export failed: " + error.localizedDescription }
        case "instruments": if let value = body["value"] as? String { boatValues = String(value.prefix(300)) }
        default: break
        }
    }
    private func emit(_ event: String, _ payload: Any) {
        guard let data = try? JSONSerialization.data(withJSONObject: payload, options: [.fragmentsAllowed]), let json = String(data: data, encoding: .utf8) else { return }
        // Event names are fixed internal constants; payloads are JSON encoded, never interpolated raw.
        web?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('" + event + "',{detail:" + json + "}));", completionHandler: nil)
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = navigationAction.request.url
        decisionHandler(url?.scheme == "helmlore" && url?.host == "chart" ? .allow : .cancel)
    }
}

struct ChartWebView: UIViewRepresentable {
    let model: PlotterModel
    func makeUIView(context: Context) -> WKWebView { model.makeWebView() }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

struct PlotterView: View {
    @StateObject private var model = PlotterModel()
    @State private var connections = false
    @Environment(\.scenePhase) private var scenePhase
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Helmlore · UK & Ireland").font(.headline)
                Spacer()
                Text(model.internetEnabled ? "Online services enabled" : "Offline charts").font(.caption)
                Button("Connections") { connections = true }
            }.padding(.horizontal).padding(.vertical, 8)
            ChartWebView(model: model)
        }
        .sheet(isPresented: $connections) {
            NavigationStack {
                Form {
                    Section("Chart package") {
                        Text("Reviewed 8 October 2026 · stored on this iPad")
                        Text("Historical coastline and depths: 2011. Saved sea marks: 7 October 2026.").font(.caption)
                    }
                    Section("Internet services") {
                        Toggle("Allow weather and internet AIS requests", isOn: Binding(get: { model.internetEnabled }, set: { model.setInternet($0) }))
                        Text("Off by default. Local charts and the Wi-Fi gateway do not require internet. Chart-package updating is not implemented in this first build.").font(.caption)
                    }
                    Section("Wi-Fi marine gateway") {
                        TextField("Local IPv4 address", text: $model.host).keyboardType(.decimalPad).autocorrectionDisabled()
                        TextField("TCP port", text: $model.port).keyboardType(.numberPad)
                        Button("Connect · use gateway position") { model.connectGateway() }
                        Button("Disconnect") { model.disconnectGateway() }
                        Text(model.connectionStatus)
                        Text("Receive-only TCP NMEA 0183. For NMEA 2000 select converted NMEA 0183 output on the gateway. Raw PGN and vendor-binary formats are not decoded. UDP is not yet supported.").font(.caption)
                    }
                    Section("Position source") {
                        Button("Use iPad position") { model.selectPosition(gateway: false) }
                        Button("Use gateway position") { model.selectPosition(gateway: true) }
                        Text(model.positionStatus)
                        Text("Foreground use only. Inputs stop in the background; select a source again when returning.").font(.caption)
                    }
                    if let file = model.exportedURL { Section("Latest export") { ShareLink(item:file) { Text("Share " + file.lastPathComponent) } } }
                    Section("Boat instruments") { Text(model.boatValues); Text("Measured transducer depth is separate from historical chart soundings. No under-keel clearance calculation is performed.").font(.caption) }
                }
                .navigationTitle("Connections")
                .toolbar { Button("Done") { connections = false } }
            }
        }
        .onChange(of: scenePhase) { value in if value == .background { model.suspend() } }
    }
}
