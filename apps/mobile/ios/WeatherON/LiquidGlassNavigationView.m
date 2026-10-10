#import <React/RCTViewManager.h>
@interface RCT_EXTERN_MODULE(LiquidGlassNavigationView, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(activeIndex, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(isDarkTheme, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSelect, RCTDirectEventBlock)
@end

@interface RCT_EXTERN_MODULE(AmbientSurfaceTextureView, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(isDarkTheme, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onPowerState, RCTDirectEventBlock)
@end

@interface RCT_EXTERN_MODULE(HomePlanGlassView, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(isDarkTheme, BOOL)
@end
