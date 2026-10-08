import Foundation
import CoreLocation

final class DeviceLocation: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var wanted = false
    var onFix: (([String: Any]) -> Void)?
    var onStatus: ((String) -> Void)?
    override init() { super.init(); manager.delegate = self; manager.desiredAccuracy = kCLLocationAccuracyBestForNavigation }
    func start() { wanted = true; manager.requestWhenInUseAuthorization(); resume() }
    func stop() { wanted = false; manager.stopUpdatingLocation() }
    private func resume() {
        guard wanted else { return }
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse: manager.startUpdatingLocation(); onStatus?("iPad position selected")
        case .denied, .restricted: onStatus?("Location permission unavailable")
        default: onStatus?("Waiting for location permission")
        }
    }
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) { resume() }
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard wanted, let fix = locations.last, fix.horizontalAccuracy >= 0, abs(fix.timestamp.timeIntervalSinceNow) <= 15 else { return }
        onFix?(["lat":fix.coordinate.latitude,"lon":fix.coordinate.longitude,"accuracy":fix.horizontalAccuracy,
                "time":fix.timestamp.timeIntervalSince1970 * 1000,"speed":fix.speed >= 0 ? fix.speed as Any : NSNull(),
                "heading":fix.course >= 0 ? fix.course as Any : NSNull(),"source":"device"])
    }
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) { onStatus?("Position unavailable: " + error.localizedDescription) }
}
