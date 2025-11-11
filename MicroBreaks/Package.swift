// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MicroBreaks",
    platforms: [.macOS(.v13)],
    targets: [
        .executableTarget(
            name: "MicroBreaks",
            dependencies: [],
            swiftSettings: [
                .unsafeFlags(["-swift-version", "5"])
            ]
        )
    ]
)
