import React
import UIKit

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
    CGRect(x: CGFloat(index) * tabWidth + 4, y: 4,
           width: max(0, tabWidth - 8), height: max(0, bounds.height - 8))
  }

  private func updateTheme() {
    overrideUserInterfaceStyle = isDarkTheme ? .dark : .light
    if #available(iOS 26.0, *) {
      let effect = UIGlassEffect(style: .regular)
      effect.isInteractive = true
      effect.tintColor = UIColor(red: 0.64, green: 0.83, blue: 1, alpha: isDarkTheme ? 0.12 : 0.06)
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
      dragX = max(4, min(3 * tabWidth + 4, startX + gesture.translation(in: self).x))
      selectionView.frame.origin.x = dragX
    case .ended:
      guard dragging else { return }
      // A fast gesture can move directly from began to ended without changed.
      dragX = max(4, min(3 * tabWidth + 4, startX + gesture.translation(in: self).x))
      select(Int(((dragX - 4) / tabWidth).rounded()))
    case .cancelled, .failed:
      guard dragging else { return }
      dragging = false
      moveSelection(animated: true)
    default: break
    }
  }
}
