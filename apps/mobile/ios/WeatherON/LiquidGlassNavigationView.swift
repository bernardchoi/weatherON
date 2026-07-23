import React
import SwiftUI
import UIKit
import Combine

@objc(LiquidGlassNavigationView)
final class LiquidGlassNavigationView: RCTViewManager {
  override func view() -> UIView! {
    return LiquidGlassNavigationSurfaceView()
  }

  @objc override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}

final class LiquidGlassNavigationSurfaceView: UIView {
  @objc var activeIndex: NSNumber = 0 {
    didSet {
      updateActiveIndex()
    }
  }

  private var glassHost: UIHostingController<AnyView>?
  private var fallbackEffect: UIVisualEffectView?
  private let navigationState = NavigationGlassState()

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    isUserInteractionEnabled = false
    layer.cornerRadius = 32
    layer.cornerCurve = .continuous
    clipsToBounds = true
    installSurface()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    glassHost?.view.frame = bounds
    fallbackEffect?.frame = bounds
  }

  private func installSurface() {
    if #available(iOS 26.0, *) {
      let host = UIHostingController(
        rootView: AnyView(NavigationGlassSurface(state: navigationState))
      )
      host.view.backgroundColor = .clear
      host.view.isUserInteractionEnabled = false
      addSubview(host.view)
      glassHost = host
      return
    }

    let effect = UIVisualEffectView(effect: UIBlurEffect(style: .systemThinMaterial))
    effect.isUserInteractionEnabled = false
    effect.layer.cornerRadius = 32
    effect.layer.cornerCurve = .continuous
    effect.clipsToBounds = true
    addSubview(effect)
    fallbackEffect = effect
  }

  private func updateActiveIndex() {
    if #available(iOS 26.0, *) {
      // 호스트를 교체하면 SwiftUI가 기존 글라스 형태를 잃어 morph 전환이 끊긴다.
      withAnimation(.spring(response: 0.42, dampingFraction: 0.82)) {
        navigationState.activeIndex = activeIndex.intValue
      }
    }
  }
}

// iOS 15 지원을 유지하려고 Observation 대신 ObservableObject 사용함.
private final class NavigationGlassState: ObservableObject {
  @Published var activeIndex = 0
}

@available(iOS 26.0, *)
private struct NavigationGlassSurface: View {
  @ObservedObject var state: NavigationGlassState
  @Namespace private var activeTabNamespace

  var body: some View {
    GeometryReader { proxy in
      GlassEffectContainer(spacing: 8) {
        ZStack {
          Color.white.opacity(0.001)
            .frame(width: proxy.size.width, height: proxy.size.height)
            .glassEffect(.regular, in: Capsule())

          HStack(spacing: 4) {
            ForEach(0..<4, id: \.self) { index in
              Group {
                if index == state.activeIndex {
                  Color.white.opacity(0.001)
                    .glassEffect(.regular.tint(.white.opacity(0.14)).interactive(), in: Capsule())
                    .glassEffectID("active-tab", in: activeTabNamespace)
                } else {
                  Color.clear
                }
              }
              .frame(maxWidth: .infinity, maxHeight: .infinity)
              .padding(4)
            }
          }
        }
      }
    }
    .animation(.spring(response: 0.42, dampingFraction: 0.82), value: state.activeIndex)
  }
}
