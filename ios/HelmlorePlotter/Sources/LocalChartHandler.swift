import Foundation
import WebKit

/// App assets are served from the installed bundle, independent of an internet connection.
final class LocalChartHandler: NSObject, WKURLSchemeHandler {
    private let root: URL
    private var active: [ObjectIdentifier: WKURLSchemeTask] = [:]
    init(root: URL) { self.root = root.resolvingSymlinksInPath(); super.init() }
    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let id = ObjectIdentifier(urlSchemeTask as AnyObject)
        active[id] = urlSchemeTask
        guard let request = urlSchemeTask.request.url, request.host == "chart",
              request.scheme == "helmlore", let path = request.path.removingPercentEncoding,
              !path.contains("\0"), !path.split(separator: "/").contains("..") else {
            finish(id, error: URLError(.badURL)); return
        }
        let file = root.appendingPathComponent(path == "/" ? "navigation.html" : String(path.dropFirst())).resolvingSymlinksInPath()
        guard file.path.hasPrefix(root.path + "/") else { finish(id, error: URLError(.noPermissionsToReadFile)); return }
        let mime = ["html":"text/html", "js":"application/javascript", "css":"text/css", "json":"application/json", "geojson":"application/json", "svg":"image/svg+xml", "png":"image/png", "jpg":"image/jpeg", "md":"text/plain", "webmanifest":"application/manifest+json"][file.pathExtension] ?? "application/octet-stream"
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            let result = Result { try Data(contentsOf: file) }
            DispatchQueue.main.async {
                guard let self = self, let task = self.active.removeValue(forKey: id) else { return }
                switch result {
                case .success(let bytes):
                    task.didReceive(URLResponse(url: request, mimeType: mime, expectedContentLength: bytes.count, textEncodingName: mime.hasPrefix("text/") ? "utf-8" : nil))
                    task.didReceive(bytes); task.didFinish()
                case .failure(let error): task.didFailWithError(error)
                }
            }
        }
    }
    private func finish(_ id: ObjectIdentifier, error: Error) { active.removeValue(forKey: id)?.didFailWithError(error) }
    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) { active.removeValue(forKey: ObjectIdentifier(urlSchemeTask as AnyObject)) }
}
