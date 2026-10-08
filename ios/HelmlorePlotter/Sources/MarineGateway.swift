import Foundation
import Network

/// Receive-only TCP connection. NMEA 2000 is accepted only after gateway conversion to 0183.
final class MarineGateway {
    private let queue = DispatchQueue(label: "com.helmlore.gateway")
    private var connection: NWConnection?
    private var generation = 0
    var onData: ((String) -> Void)?
    var onStatus: ((String) -> Void)?
    static func isPrivateIPv4(_ host: String) -> Bool {
        let parts = host.split(separator: ".", omittingEmptySubsequences: false)
        guard parts.count == 4, parts.allSatisfy({ !$0.isEmpty && $0.allSatisfy(\.isNumber) }),
              parts.allSatisfy({ Int($0).map { (0...255).contains($0) } ?? false }) else { return false }
        let p = parts.map { Int($0)! }
        return p[0] == 10 || (p[0] == 172 && (16...31).contains(p[1])) || (p[0] == 192 && p[1] == 168) || (p[0] == 169 && p[1] == 254)
    }
    func connect(host: String, port: UInt16) {
        queue.async { [weak self] in
            guard let self = self else { return }
            self.generation += 1; let epoch = self.generation
            self.connection?.cancel(); self.connection = nil
            guard Self.isPrivateIPv4(host), port > 0, let endpointPort = NWEndpoint.Port(rawValue: port) else { self.status("Enter the gateway's local IPv4 address and TCP port."); return }
            let c = NWConnection(host: NWEndpoint.Host(host), port: endpointPort, using: .tcp)
            self.connection = c; self.status("Connecting to gateway…")
            c.stateUpdateHandler = { [weak self] state in
                guard let self = self, epoch == self.generation else { return }
                switch state {
                case .ready: self.status("Gateway connected · receive-only NMEA 0183"); self.receive(c, epoch: epoch)
                case .waiting(let error): self.status("Waiting for gateway: " + error.localizedDescription)
                case .failed(let error): self.status("Gateway failed: " + error.localizedDescription); self.connection = nil
                case .cancelled: self.status("Gateway disconnected")
                default: break
                }
            }
            c.start(queue: self.queue)
        }
    }
    private func receive(_ c: NWConnection, epoch: Int) {
        c.receive(minimumIncompleteLength: 1, maximumLength: 4096) { [weak self] data, _, complete, error in
            guard let self = self, epoch == self.generation else { return }
            if let data = data, let text = String(data: data, encoding: .ascii), !text.isEmpty {
                DispatchQueue.main.async { self.onData?(text) }
            }
            if let error = error { self.status("Gateway receive error: " + error.localizedDescription); return }
            if complete { self.status("Gateway closed the connection"); return }
            self.receive(c, epoch: epoch)
        }
    }
    func disconnect() { queue.async { self.generation += 1; self.connection?.cancel(); self.connection = nil; self.status("Gateway disconnected") } }
    private func status(_ text: String) { DispatchQueue.main.async { self.onStatus?(text) } }
    deinit { connection?.cancel() }
}
