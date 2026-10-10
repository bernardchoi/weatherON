import React
import UIKit
import CoreImage

@objc(LiquidGlassNavigationView)
final class LiquidGlassNavigationView: RCTViewManager {
  override func view() -> UIView! { LiquidGlassNavigationSurfaceView() }
  @objc override static func requiresMainQueueSetup() -> Bool { true }
}

// Keep the glass and its touches in UIKit: an RN responder above it prevents
// UIGlassEffect's native touch highlights and deformation from receiving input.
final class LiquidGlassNavigationSurfaceView: UIView {
  @objc var activeIndex: NSNumber = 0 {
    didSet { if !dragging { moveSelection(animated: hasLayout) } }
  }
  @objc var isDarkTheme = false { didSet { updateTheme() } }
  @objc var onSelect: RCTDirectEventBlock?
  private let glass = UIVisualEffectView()
  private let selectionView = UIView()
  private var dragX: CGFloat = 0
  private var dragging = false
  private var startX: CGFloat = 0
  private var hasLayout = false
  private var selectionAnimator: UIViewPropertyAnimator?
  private var tabWidth: CGFloat { bounds.width / 4 }
  private var selectionDiameter: CGFloat { max(0, min(tabWidth - 8, bounds.height - 8)) }
  private var selectionInset: CGFloat { (tabWidth - selectionDiameter) / 2 }
  private var selectedIndex: Int { max(0, min(3, activeIndex.intValue)) }

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    clipsToBounds = false
    addSubview(selectionView)
    selectionView.addSubview(glass)
    glass.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    if #available(iOS 26.0, *) {
      glass.cornerConfiguration = .capsule()
    }
    updateTheme()
    let tap = UITapGestureRecognizer(target: self, action: #selector(tapped(_:)))
    let pan = UIPanGestureRecognizer(target: self, action: #selector(panned(_:)))
    tap.cancelsTouchesInView = false
    pan.cancelsTouchesInView = false
    addGestureRecognizer(tap)
    addGestureRecognizer(pan)
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  override func layoutSubviews() {
    super.layoutSubviews()
    if !dragging {
      selectionAnimator?.stopAnimation(true)
      selectionView.frame = selectionFrame(selectedIndex)
      glass.frame = selectionView.bounds
    }
    hasLayout = bounds.width > 0
  }

  private func selectionFrame(_ index: Int) -> CGRect {
    CGRect(x: CGFloat(index) * tabWidth + selectionInset, y: (bounds.height - selectionDiameter) / 2,
           width: selectionDiameter, height: selectionDiameter)
  }

  private func updateTheme() {
    overrideUserInterfaceStyle = isDarkTheme ? .dark : .light
    if #available(iOS 26.0, *) {
      let effect = UIGlassEffect(style: .regular)
      effect.isInteractive = true
      effect.tintColor = isDarkTheme
        ? UIColor(red: 1, green: 0.71, blue: 0.18, alpha: 0.12)
        : UIColor(red: 1, green: 0.65, blue: 0.55, alpha: 0.22)
      glass.effect = effect
    }
  }

  private func moveSelection(animated: Bool) {
    selectionAnimator?.stopAnimation(true)
    let target = selectionFrame(selectedIndex)
    guard animated, !UIAccessibility.isReduceMotionEnabled else { selectionView.frame = target; return }
    let animator = UIViewPropertyAnimator(duration: 0.32, dampingRatio: 0.9) { self.selectionView.frame = target }
    selectionAnimator = animator
    animator.startAnimation()
  }

  private func select(_ index: Int) {
    dragging = false
    activeIndex = NSNumber(value: max(0, min(3, index)))
    onSelect?(["index": selectedIndex])
  }

  @objc private func tapped(_ gesture: UITapGestureRecognizer) {
    guard tabWidth > 0 else { return }
    select(Int(gesture.location(in: self).x / tabWidth))
  }

  @objc private func panned(_ gesture: UIPanGestureRecognizer) {
    guard tabWidth > 0 else { return }
    switch gesture.state {
    case .began:
      let initialX = gesture.location(in: self).x - gesture.translation(in: self).x
      guard Int(initialX / tabWidth) == selectedIndex else { return }
      let visibleFrame = selectionView.layer.presentation()?.frame ?? selectionView.frame
      selectionAnimator?.stopAnimation(true)
      selectionView.frame = visibleFrame
      startX = visibleFrame.minX
      dragX = startX
      dragging = true
    case .changed:
      guard dragging else { return }
      dragX = max(selectionInset, min(3 * tabWidth + selectionInset, startX + gesture.translation(in: self).x))
      selectionView.frame.origin.x = dragX
    case .ended:
      guard dragging else { return }
      // A fast gesture can move directly from began to ended without changed.
      dragX = max(selectionInset, min(3 * tabWidth + selectionInset, startX + gesture.translation(in: self).x))
      select(Int(((dragX - selectionInset) / tabWidth).rounded()))
    case .cancelled, .failed:
      guard dragging else { return }
      dragging = false
      moveSelection(animated: true)
    default: break
    }
  }
}


// Non-repeating, runtime light density for the same ambient wind field.
// No screenshot/texture tile, frame timer, network or device sensor is used.
struct AmbientSurfaceTextureGenerator {
  static let context = CIContext(options: [.cacheIntermediates: false])

  static func image(size: CGSize, dark: Bool, origin: CGPoint) -> CGImage? {
    let rect = CGRect(origin: .zero, size: size)
    guard size.width > 0, size.height > 0,
          let random = CIFilter(name: "CIRandomGenerator")?.outputImage else { return nil }
    let field = random.transformed(by: CGAffineTransform(translationX: origin.x, y: origin.y))
      .cropped(to: rect.insetBy(dx: -4, dy: -4))
      .applyingFilter("CIColorControls", parameters: [kCIInputSaturationKey: 0])
      .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 0.45])
      .applyingFilter("CIMaskToAlpha")
    let color: (CGFloat, CGFloat, CGFloat) = dark ? (140 / 255, 171 / 255, 202 / 255) : (1, 1, 1)
    let tint = field.applyingFilter("CIColorMatrix", parameters: [
      "inputRVector": CIVector(x: color.0, y: 0, z: 0, w: 0),
      "inputGVector": CIVector(x: 0, y: color.1, z: 0, w: 0),
      "inputBVector": CIVector(x: 0, y: 0, z: color.2, w: 0),
      "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
    ]).cropped(to: rect)
    return context.createCGImage(tint, from: rect)
  }
}

@objc(AmbientSurfaceTextureView)
final class AmbientSurfaceTextureView: RCTViewManager {
  override func view() -> UIView! { AmbientSurfaceTextureSurfaceView() }
  @objc override static func requiresMainQueueSetup() -> Bool { true }
}

final class AmbientSurfaceTextureSurfaceView: UIView {
  @objc var onPowerState: RCTDirectEventBlock? { didSet { reportPowerState() } }
  private var powerObserver: NSObjectProtocol?
  @objc var isDarkTheme = false { didSet { if oldValue != isDarkTheme { updateDensityMask(); requestTexture() } } }
  private let imageView = UIImageView()
  private let densityMask = CAGradientLayer()
  private var requestedSize = CGSize.zero
  private var renderVersion = 0
  private let origin = CGPoint(x: CGFloat.random(in: 0...4096), y: CGFloat.random(in: 0...4096))

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
    isUserInteractionEnabled = false
    accessibilityElementsHidden = true
    isAccessibilityElement = false
    imageView.contentMode = .scaleToFill
    imageView.isAccessibilityElement = false
    addSubview(imageView)
    // Keep the upper blue atmosphere from being washed out by white density.
    // This is one diffuse field envelope; no repeated decorative texture.
    densityMask.colors = [UIColor.white.withAlphaComponent(0.35).cgColor, UIColor.white.withAlphaComponent(0.35).cgColor, UIColor.white.cgColor]
    densityMask.locations = [0, 0.2, 0.65]
    densityMask.startPoint = CGPoint(x: 0.5, y: 0)
    densityMask.endPoint = CGPoint(x: 0.5, y: 1)
    updateDensityMask()
    powerObserver = NotificationCenter.default.addObserver(forName: Notification.Name.NSProcessInfoPowerStateDidChange, object: nil, queue: .main) { [weak self] _ in self?.reportPowerState() }
  }

  deinit { if let powerObserver { NotificationCenter.default.removeObserver(powerObserver) } }

  private func reportPowerState() {
    #if DEBUG
    let baseOnly = ProcessInfo.processInfo.arguments.contains("--weatheron-ambient-base-only")
    #else
    let baseOnly = false
    #endif
    onPowerState?(["lowPower": ProcessInfo.processInfo.isLowPowerModeEnabled, "baseOnly": baseOnly])
  }

  required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

  override func layoutSubviews() {
    super.layoutSubviews()
    imageView.frame = bounds
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    densityMask.frame = bounds
    CATransaction.commit()
    if requestedSize != bounds.size { requestTexture() }
  }

  private func updateDensityMask() {
    imageView.layer.mask = isDarkTheme ? nil : densityMask
  }

  private func requestTexture() {
    guard bounds.width > 0, bounds.height > 0 else { return }
    requestedSize = bounds.size
    // One sample per logical point, bounded memory; no continuous raster work.
    let size = CGSize(width: min(512, bounds.width), height: min(1024, bounds.height))
    let dark = isDarkTheme
    let sampleOrigin = origin
    renderVersion += 1
    let version = renderVersion
    DispatchQueue.global(qos: .utility).async { [weak self] in
      guard let cg = AmbientSurfaceTextureGenerator.image(size: size, dark: dark, origin: sampleOrigin) else { return }
      DispatchQueue.main.async {
        guard let self, self.renderVersion == version else { return }
        self.imageView.image = UIImage(cgImage: cg)
      }
    }
  }
}
