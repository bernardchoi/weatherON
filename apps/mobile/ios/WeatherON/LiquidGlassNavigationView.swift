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

  @objc var isDarkTheme: Bool = false {
    didSet {
      updateTheme()
    }
  }

  private var glassHost: UIHostingController<AnyView>?
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
    }
  }

  private func updateActiveIndex() {
    if #available(iOS 26.0, *) {
      // 호스트를 교체하면 SwiftUI가 기존 글라스 형태를 잃어 morph 전환이 끊긴다.
      withAnimation(.spring(response: 0.42, dampingFraction: 0.82)) {
        navigationState.activeIndex = activeIndex.intValue
      }
    }
  }

  private func updateTheme() {
    if #available(iOS 26.0, *) {
      withAnimation(.easeOut(duration: 0.18)) {
        navigationState.isDarkTheme = isDarkTheme
      }
    }
  }
}

// iOS 15 지원을 유지하려고 Observation 대신 ObservableObject 사용함.
private final class NavigationGlassState: ObservableObject {
  @Published var activeIndex = 0
  @Published var isDarkTheme = false
}

@available(iOS 26.0, *)
private struct NavigationGlassSurface: View {
  @ObservedObject var state: NavigationGlassState
  @Namespace private var activeTabNamespace

  var body: some View {
    GlassEffectContainer(spacing: 8) {
      ZStack {
        // 겹친 glass 표면은 선택 캡슐의 경계를 흐리므로 dock은 얇은 받침만 사용함.
        Capsule()
          .fill(Color.white.opacity(state.isDarkTheme ? 0.04 : 0.08))

        HStack(spacing: 0) {
          ForEach(0..<4, id: \.self) { index in
            Group {
              if index == state.activeIndex {
                Capsule()
                  .fill(Color.white.opacity(state.isDarkTheme ? 0.08 : 0.04))
                  .glassEffect(
                    .regular
                      .tint(Color(red: 0.64, green: 0.83, blue: 1).opacity(state.isDarkTheme ? 0.2 : 0.1))
                      .interactive(),
                    in: Capsule()
                  )
                  .glassEffectID("active-tab", in: activeTabNamespace)
                  // 반사 테두리는 glass 뒤가 아닌 앞에 놓아 밝은 단색 배경에서도 유지함.
                  .overlay {
                    Capsule()
                      .strokeBorder(
                        LinearGradient(
                          colors: [
                            .white.opacity(state.isDarkTheme ? 0.78 : 0.95),
                            .white.opacity(0.16),
                            Color(red: 0.38, green: 0.62, blue: 0.82).opacity(0.32),
                            .white.opacity(state.isDarkTheme ? 0.4 : 0.7),
                          ],
                          startPoint: .topLeading,
                          endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                      )
                  }
                  .shadow(color: .black.opacity(state.isDarkTheme ? 0.3 : 0.12), radius: 3, x: 0, y: 2)
              } else {
                Color.clear
              }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(4)
          }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .environment(\.colorScheme, state.isDarkTheme ? .dark : .light)
    .animation(.spring(response: 0.42, dampingFraction: 0.82), value: state.activeIndex)
  }
}
