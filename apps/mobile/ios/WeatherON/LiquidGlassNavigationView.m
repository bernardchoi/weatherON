#import <React/RCTViewManager.h>
@interface RCT_EXTERN_MODULE(LiquidGlassNavigationView, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(activeIndex, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(isDarkTheme, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSelect, RCTDirectEventBlock)
@end
