import React
import SwiftUI
import UIKit

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
        rootView: AnyView(NavigationGlassSurface(activeIndex: activeIndex.intValue))
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
      glassHost?.rootView = AnyView(NavigationGlassSurface(activeIndex: activeIndex.intValue))
    }
  }
}

@available(iOS 26.0, *)
private struct NavigationGlassSurface: View {
  let activeIndex: Int

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
                if index == activeIndex {
                  Color.white.opacity(0.001)
                    .glassEffect(.regular.tint(.white.opacity(0.14)), in: Capsule())
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
  }
}
