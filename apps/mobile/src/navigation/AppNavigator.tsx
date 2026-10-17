import React, { useEffect, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { BackHandler, Linking, Platform, StatusBar, StyleSheet, useColorScheme, View, Text, useWindowDimensions } from "../localization/react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AmbientReadingContext } from "../components/AmbientReadingSurface";
import { ambientReadingTheme, ambientReadingRouteIds } from "../theme/ambientSurface";
import { resolveWeatherTimeZone } from "../utils/weatherDaylight";
import { AppAmbientSurface } from "../components/AppAmbientSurface";
import { BottomNav } from "../components/BottomNav";
import { ReservedRegionObserver } from "../components/ReservedRegionObserver";
import { AppButton } from "../components/AppButton";
import { LaunchSplash } from "../components/LaunchSplash";
import { NavigationStack } from "../components/NavigationStack";
import { isLaunchHiddenRoute, isLaunchVisibleP0Route, type AppRouteId, type P0RouteId } from "./routes";
import { HomeScreen } from "../screens/HomeScreen";
import { LocationChangeScreen } from "../screens/LocationChangeScreen";
import { OutfitScreen } from "../screens/OutfitScreen";
import { OutfitDetailScreen } from "../screens/OutfitDetailScreen";
import { WardrobeScreen } from "../screens/WardrobeScreen";
import { WardrobePresetScreen } from "../screens/WardrobePresetScreen";
import { UmbrellaScreen } from "../screens/UmbrellaScreen";
import { IosRainForecastScreen } from "../screens/IosRainForecastScreen";
import { RainTimelineScreen } from "../screens/RainTimelineScreen";
import { WeatherDetailScreen } from "../screens/WeatherDetailScreen";
import { TomorrowBriefScreen } from "../screens/TomorrowBriefScreen";
import { NotificationCenterScreen } from "../screens/NotificationCenterScreen";
import {
  WeatherReportCompleteScreen,
  WeatherReportHistoryScreen,
  WeatherReportHomeScreen,
  WeatherReportSubmitScreen,
} from "../screens/WeatherReportScreens";
import { AlertSettingsScreen } from "../screens/AlertSettingsScreen";
import { MyScreen } from "../screens/MyScreen";
import { GlobalSettingsScreen } from "../screens/GlobalSettingsScreen";
import { AppPermissionsScreen } from "../screens/AppPermissionsScreen";
import { AccountManagementScreen } from "../screens/AccountManagementScreen";
import { PolicyHubScreen } from "../screens/PolicyHubScreen";
import { PolicyDocumentScreen } from "../screens/PolicyDocumentScreen";
import { AdConsentScreen } from "../screens/AdConsentScreen";
import { AdPlacementScreen } from "../screens/AdPlacementScreen";
import { DestinationListScreen } from "../screens/DestinationListScreen";
import { DestinationCareScreen } from "../screens/DestinationCareScreen";
import { DestinationAddScreen } from "../screens/DestinationAddScreen";
import { DestinationGuideScreen } from "../screens/DestinationGuideScreen";
import { DestinationHubScreen } from "../screens/DestinationHubScreen";
import { TripPlannerScreen } from "../screens/TripPlannerScreen";
import { WalkingTripScreen } from "../screens/WalkingTripScreen";
import { AiJourneyPlannerScreen } from "../screens/AiJourneyPlannerScreen";
import { PremiumScreen } from "../screens/PremiumScreen";
import { AccountConnectScreen } from "../screens/AccountConnectScreen";
import { emptyTermsConsentDraft, TermsConsentScreen, type TermsConsentDraft } from "../screens/TermsConsentScreen";
import { PermissionGateScreen } from "../screens/PermissionGateScreen";
import { OnboardingIntroScreen } from "../screens/OnboardingIntroScreen";
import { OnboardingOutfitScreen } from "../screens/OnboardingOutfitScreen";
import { StyleProfileScreen } from "../screens/StyleProfileScreen";
import { SmartCareOnboardingScreen } from "../screens/SmartCareOnboardingScreen";
import { OnboardingDestinationScreen } from "../screens/OnboardingDestinationScreen";
import { AppEntrySplashScreen, OnboardingSplashScreen } from "../screens/SplashScreens";
import { useWeatherOnAppState } from "../state/useWeatherOnAppState";
import { AppThemeProvider } from "../theme/AppThemeContext";
import { appColors, resolveAppTheme } from "../theme/tokens";
import { resolveNavigationContainerLayout, resolveResponsiveLayout, ResponsiveLayoutContext } from "../theme/responsiveLayout";
import { equalReservedRegions, resolveReservedContentRegion, type ReservedRegion } from "../theme/reservedRegionLayout";

export function AppNavigator() {
  const appState = useWeatherOnAppState();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reservedRegions, setReservedRegions] = React.useState<ReservedRegion[]>([]);
  const safeWindowWidth = Math.max(0, width - insets.left - insets.right);
  const safeWindowHeight = Math.max(0, height - insets.top - insets.bottom);
  const reservedContentRegion = resolveReservedContentRegion(safeWindowWidth, safeWindowHeight, reservedRegions);
  const navigationContainer = resolveNavigationContainerLayout(reservedContentRegion.width, reservedContentRegion.height);
  const layout = resolveResponsiveLayout(navigationContainer.contentWidth, navigationContainer.availableHeight, {
    useSideNavigation: navigationContainer.useSideNavigation,
  });
  const handleReservedRegionsChange = React.useCallback((nextRegions: ReservedRegion[]) => {
    setReservedRegions((currentRegions) => equalReservedRegions(currentRegions, nextRegions) ? currentRegions : nextRegions);
  }, []);
  const [rainForecastContext, setRainForecastContext] = React.useState<import("../utils/homeOuting").RainForecastContext | null>(null);
  const [launchVisible, setLaunchVisible] = React.useState(true);
  const [launchReady, setLaunchReady] = React.useState(false);
  const [launchStarted, setLaunchStarted] = React.useState(false);
  const [termsConsentDraft, setTermsConsentDraft] = React.useState<TermsConsentDraft>(() => ({ ...emptyTermsConsentDraft }));
  const finishLaunch = React.useCallback(() => setLaunchVisible(false), []);
  const readyLaunch = React.useCallback(() => setLaunchReady(true), []);
  const handledDeepLinkRef = useRef<string | null>(null);
  const systemTheme = useColorScheme();
  const theme = resolveAppTheme(
    appState.themeMode,
    systemTheme === "unspecified" ? null : systemTheme,
    appState.reducedTransparency,
    appState.dynamicColorEnabled,
  );
  const route = isLaunchHiddenRoute(appState.route) ? "H1" : appState.route;
  useEffect(() => {
    // Permission/settings overlays can return to the same forecast. Other entries start fresh.
    if (!["H5", "O3", "M2"].includes(route)) setRainForecastContext(null);
  }, [route]);
  const bottomNavActiveRoute = getBottomNavActiveRoute(route, appState.alertSettingsRouteState?.returnTo, appState.overlayReturnRoutes.H4);
  const readingAmbient = Platform.OS === "ios" && ambientReadingRouteIds.includes(route);
  const presentationTheme = readingAmbient ? ambientReadingTheme(theme) : theme;
  const appBackgroundColor = presentationTheme.background;
  const fullHomeAmbient = Platform.OS === "ios" && route === "H1";
  const ambientContext = route === "G2" ? "destination" : ["C1", "C4"].includes(route) ? "outfit" : ["H1", "H6"].includes(route) ? "origin" : "neutral";
  const ambientWeather = ambientContext === "destination" ? appState.state.destinationWeatherById[appState.selectedDestinationPlace.id] ?? appState.state.destinationCare.destinationWeather : ambientContext === "outfit" ? appState.state.weather : appState.state.destinationCare.originWeather;
  const ambientLocation = ambientContext === "destination" && ambientWeather.locationId === appState.selectedDestinationPlace.id
    ? { locationId: ambientWeather.locationId, locationName: ambientWeather.locationName, countryCode: ambientWeather.countryCode, coordinate: appState.selectedDestinationPlace.coordinate, timezone: resolveWeatherTimeZone(ambientWeather.countryCode, appState.selectedDestinationPlace.timezone ?? ambientWeather.timezone) }
    : appState.placeSearchOrigin;
  const contentBackground = fullHomeAmbient || readingAmbient ? "transparent" : appBackgroundColor;
  const showPrimaryNavigation = shouldShowPrimaryNavigation(route, appState.styleProfileReturnRoute);
  // Custom navigation does not inherit UIKit's Duo rail placement. Opt into a
  // rail only from the live container size, never a device name or orientation.
  const useSideNavigation = Platform.OS === "ios" && layout.useSideNavigation && showPrimaryNavigation;
  const renderPrimaryNavigation = (navigationRoute: AppRouteId, placement: "bottom" | "side" = "bottom") => {
    const styleProfileReturnRoute = navigationRoute === "O4" ? appState.styleProfileReturnRoute : null;
    if (!shouldShowPrimaryNavigation(navigationRoute, styleProfileReturnRoute)) return null;
    const navigationReadingAmbient = Platform.OS === "ios" && ambientReadingRouteIds.includes(navigationRoute);
    const navigationFullHomeAmbient = Platform.OS === "ios" && navigationRoute === "H1";
    return (
      <BottomNav
        key={`primary-navigation-${navigationRoute}`}
        placement={placement}
        transparentBackground={navigationFullHomeAmbient || navigationReadingAmbient}
        activeRoute={navigationRoute === "O4" ? styleProfileReturnRoute! : getBottomNavActiveRoute(navigationRoute, appState.alertSettingsRouteState?.returnTo, appState.overlayReturnRoutes.H4)}
        onNavigate={appState.navigate}
      />
    );
  };
  const primaryNavigation = showPrimaryNavigation ? renderPrimaryNavigation(route, useSideNavigation ? "side" : "bottom") : null;

  useEffect(() => {
    if (!appState.appStateHydrated && !appState.storageLoadError) return;
    if (!launchReady && !appState.storageLoadError) return;
    let active = true;
    void SplashScreen.hideAsync().catch(() => {}).then(() => {
      if (active) setLaunchStarted(true);
    });
    return () => { active = false; };
  }, [appState.appStateHydrated, appState.storageLoadError, launchReady]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", appState.goBack);
    return () => subscription.remove();
  }, [appState.goBack]);

  useEffect(() => {
    if (!appState.gate) setTermsConsentDraft({ ...emptyTermsConsentDraft });
  }, [appState.gate]);

  useEffect(() => {
    let active = true;
    const openDeepLink = (url: string | null, initial = false) => {
      // Deduplicate launch restoration only. Each later widget/Activity tap is
      // a new navigation request, even if its URL is unchanged.
      if (!active || !url || (initial && handledDeepLinkRef.current !== null)) return;
      if (url.toLowerCase().replace(/[/?#]+$/u, "") === "weatheron://home") {
        handledDeepLinkRef.current = url;
        appState.navigate("H1");
        return;
      }
      if (!/^weatheron:\/\/destination(?:[/?#]|$)/iu.test(url) || !appState.destinationSelectionReady) return;
      const encodedDestinationId = url.match(/[?&]id=([^&#]+)/u)?.[1];
      let destinationId: string | null = null;
      try {
        destinationId = encodedDestinationId ? decodeURIComponent(encodedDestinationId.replace(/\+/gu, " ")) : null;
      } catch {
        return;
      }
      const destination = appState.savedDestinations.find(({ place }) => place.id === destinationId);
      handledDeepLinkRef.current = url;
      if (!destination) {
        appState.navigate("G1");
        return;
      }
      appState.selectDestinationPlace(destination.place);
      appState.navigate("G2");
    };
    void Linking.getInitialURL().then((url) => openDeepLink(url, true)).catch(() => {});
    const subscription = Linking.addEventListener("url", ({ url }) => openDeepLink(url));
    return () => { active = false; subscription.remove(); };
  }, [
    appState.destinationSelectionReady,
    appState.navigate,
    appState.savedDestinations,
    appState.selectDestinationPlace,
  ]);

  const screenProps = {
    state: appState.state,
    rainForecastContext,
    onOpenRainForecast: (context: import("../utils/homeOuting").RainForecastContext) => {
      setRainForecastContext(context);
      appState.navigate("H5");
    },
    useDestinationWeather: appState.useDestinationWeather,
    umbrellaReviewed: appState.umbrellaReviewed,
    smartCareEnabled: appState.smartCareEnabled,
    weatherProviderMode: appState.weatherProviderMode,
    weatherLocationMode: appState.weatherLocationMode,
    deviceLocationState: appState.deviceLocationState,
    placeSearchOrigin: appState.placeSearchOrigin,
    destinationSaved: appState.destinationSaved,
    savedDestinations: appState.savedDestinations,
    destinationLimitNotice: appState.destinationLimitNotice,
    recentlyRemovedDestination: appState.recentlyRemovedDestination,
    destinationCareEnabled: appState.destinationCareEnabled,
    selectedDestinationAlertCondition: appState.selectedDestinationAlertCondition,
    selectedDestinationSchedulePreference: appState.selectedDestinationSchedulePreference,
    selectedDestinationTravelEstimate: appState.selectedDestinationTravelEstimate,
    selectedDestinationDepartureAt: appState.selectedDestinationDepartureAt,
    selectedDestinationTargetAt: appState.selectedDestinationTargetAt,
    selectedDestinationPlace: appState.selectedDestinationPlace,
    destinationSelectionReady: appState.destinationSelectionReady,
    placeSearchQuery: appState.placeSearchQuery,
    placeSearchResults: appState.placeSearchResults,
    isPlaceSearchLoading: appState.isPlaceSearchLoading,
    placeSearchStatus: appState.placeSearchStatus,
    readNotificationIds: appState.readNotificationIds,
    notificationHistory: appState.notificationHistory,
    alertPreferences: appState.alertPreferences,
    notificationDeliveryStatus: appState.notificationDeliveryStatus,
    alertSettingsRouteState: appState.alertSettingsRouteState,
    selectedPolicyDocument: appState.selectedPolicyDocument,
    policyDocumentReturnRoute: appState.policyDocumentReturnRoute,
    adConsentMode: appState.adConsentMode,
    temperatureUnit: appState.temperatureUnit,
    distanceUnit: appState.distanceUnit,
    themeMode: appState.themeMode,
    reducedTransparency: appState.reducedTransparency,
    dynamicColorEnabled: appState.dynamicColorEnabled,
    styleProfileSaved: appState.styleProfileSaved,
    styleGender: appState.styleGender,
    ageBand: appState.ageBand,
    fitPreference: appState.fitPreference,
    selectedStyles: appState.selectedStyles,
    wardrobeItems: appState.wardrobe,
    selectedWardrobeItemId: appState.selectedWardrobeItemId,
    recentlyRemovedWardrobeItemId: appState.recentlyRemovedWardrobeItemId,
    smartCareScenario: appState.smartCareScenario,
    onboardingCompleted: appState.onboardingCompleted,
    isWeatherLoading: appState.isWeatherLoading,
    accountLinked: appState.accountLinked,
    accountProfile: appState.accountProfile,
    accountAuthStatus: appState.accountAuthStatus,
    accountAuthMessage: appState.accountAuthMessage,
    termsRequiredAccepted: appState.termsRequiredAccepted,
    locationReady: appState.locationReady,
    permissionReady: appState.permissionReady,
    outfitSaved: appState.outfitSaved,
    accountGateResult: appState.accountGateResult,
    permissionGateResult: appState.permissionGateResult,
    onNavigate: (nextRoute: AppRouteId) => {
      setRainForecastContext(null);
      appState.navigate(nextRoute);
    },
    onGoBack: appState.goBack,
    onOpenAlertSettings: appState.openAlertSettings,
    onReturnFromAlertSettings: appState.returnFromAlertSettings,
    onOpenPolicyDocument: appState.openPolicyDocument,
    onReturnFromPolicyDocument: appState.returnFromPolicyDocument,
    onSetAdConsentMode: appState.setAdConsentMode,
    onSetTemperatureUnit: appState.setTemperatureUnit,
    onSetDistanceUnit: appState.setDistanceUnit,
    onSetThemeMode: appState.setThemeMode,
    onToggleReducedTransparency: appState.toggleReducedTransparency,
    onToggleDynamicColor: appState.toggleDynamicColor,
    onSetStyleGender: appState.setStyleGender,
    onSetAgeBand: appState.setAgeBand,
    onSetFitPreference: appState.setFitPreference,
    onToggleStyleTag: appState.toggleStyleTag,
    onSetWardrobeItemOwned: appState.setWardrobeItemOwned,
    onSavePhotoWardrobeItem: appState.savePhotoWardrobeItem,
    onOpenWardrobeItem: appState.openWardrobeItem,
    onOpenWardrobeAdd: appState.openWardrobeAdd,
    onRemoveWardrobeItem: appState.removeWardrobeItem,
    onRestoreRemovedWardrobeItem: appState.restoreRemovedWardrobeItem,
    onSaveStyleProfile: appState.saveStyleProfile,
    onSetSmartCareScenario: appState.setSmartCareScenario,
    onCompleteSmartCareOnboarding: appState.completeSmartCareOnboarding,
    onCompleteOnboarding: appState.completeOnboarding,
    onToggleWeather: appState.toggleWeather,
    onReviewUmbrella: appState.markUmbrellaReviewed,
    onToggleSmartCare: appState.toggleSmartCare,
    onSetWeatherProviderMode: appState.setWeatherProviderMode,
    onSetWeatherLocationMode: appState.setWeatherLocationMode,
    onRequestCurrentLocation: appState.requestCurrentLocation,
    onRequestNotificationPermission: appState.requestOnboardingNotificationPermission,
    onSelectWeatherLocation: appState.selectWeatherLocation,
    onSaveDestination: appState.saveDestination,
    onReturnFromDestinationAdd: appState.returnFromDestinationAdd,
    onToggleDestinationCare: appState.toggleDestinationCare,
    onToggleSavedDestinationCare: appState.toggleSavedDestinationCare,
    onSetDestinationLabel: appState.setSelectedDestinationLabel,
    onSetDestinationTargetArrivalTime: appState.setSelectedDestinationTargetArrivalTime,
    onSetDestinationTimeBasis: appState.setSelectedDestinationTimeBasis,
    onSetDestinationTransportMode: appState.setSelectedDestinationTransportMode,
    onToggleDestinationRepeat: appState.toggleSelectedDestinationRepeat,
    onToggleDestinationRepeatDay: appState.toggleSelectedDestinationRepeatDay,
    onRemoveSavedDestination: appState.removeSavedDestination,
    onRestoreRemovedDestination: appState.restoreRemovedDestination,
    onDismissRemovedDestination: appState.dismissRemovedDestination,
    onDismissDestinationLimitNotice: appState.dismissDestinationLimitNotice,
    onSearchPlaces: appState.searchPlaces,
    onSelectDestinationPlace: appState.selectDestinationPlace,
    onMarkNotificationRead: appState.markNotificationRead,
    onMarkAllNotificationsRead: appState.markAllNotificationsRead,
    onClearNotificationHistory: appState.clearNotificationHistory,
    onToggleAlertPreference: appState.toggleAlertPreference,
    onEditDestinationAlertCondition: appState.editDestinationAlertCondition,
    onEditNotificationCondition: appState.editNotificationCondition,
    onOpenNotificationDeepLink: appState.openNotificationDeepLink,
    onSendTestNotification: appState.sendTestNotification,
    onRefreshWeather: appState.refreshWeather,
    onRequireAccount: appState.requestAccountGate,
    onDismissAccountGateResult: appState.dismissAccountGateResult,
    onRequestPermissionGate: appState.requestPermissionGate,
    onSignOutAccount: appState.signOutAccount,
    onDeleteAccount: appState.deleteAccount,
  };

  // The Home surface reflects the committed Live Activity trip. Destination
  // editor props intentionally remain selected-preview state for every other
  // route, so scope the owner-specific values to Home only.
  const homeScreenProps = {
    ...screenProps,
    selectedDestinationSchedulePreference: appState.homeDestinationSchedulePreference,
    selectedDestinationDepartureAt: appState.homeDestinationDepartureAt,
    selectedDestinationTargetAt: appState.homeDestinationTargetAt,
    selectedDestinationPlace: appState.homeDestinationPlace,
  };

  if (appState.storageLoadError && !appState.appStateHydrated) {
    return (
      <AppThemeProvider theme={theme}>
        <View style={{ flex: 1, justifyContent: "center", padding: 32, gap: 20, backgroundColor: theme.background }}>
          <Text accessibilityRole="alert" style={{ color: theme.text, fontSize: 18 }}>
            저장한 정보를 불러오지 못했어요. 기존 데이터는 유지돼요.
          </Text>
          <AppButton label="다시 불러오기" onPress={appState.retryStorageLoad} />
        </View>
      </AppThemeProvider>
    );
  }

  const renderRouteContent = (route: AppRouteId) => (<>
      {route === "A1" ? <AppEntrySplashScreen {...screenProps} /> : null}
      {route === "H1" ? <HomeScreen {...homeScreenProps} state={appState.homeState} /> : null}
      {route === "H2" ? <LocationChangeScreen {...screenProps} /> : null}
      {route === "C1" ? <OutfitScreen {...screenProps} /> : null}
      {route === "C2" ? <WardrobeScreen {...screenProps} /> : null}
      {route === "C3" ? <WardrobePresetScreen {...screenProps} /> : null}
      {route === "C4" ? <OutfitDetailScreen {...screenProps} /> : null}
      {route === "H4" ? <UmbrellaScreen {...screenProps} /> : null}
      {route === "H5" ? (Platform.OS === "ios" ? <IosRainForecastScreen {...screenProps} /> : <RainTimelineScreen {...screenProps} />) : null}
      {route === "H6" ? <WeatherDetailScreen {...screenProps} /> : null}
      {route === "H7" ? <TomorrowBriefScreen {...screenProps} /> : null}
      {route === "H3" ? <NotificationCenterScreen {...screenProps} /> : null}
      {route === "W1" ? <WeatherReportHomeScreen {...screenProps} /> : null}
      {route === "W2" ? <WeatherReportSubmitScreen {...screenProps} /> : null}
      {route === "W3" ? <WeatherReportCompleteScreen {...screenProps} /> : null}
      {route === "W4" ? <WeatherReportHistoryScreen {...screenProps} /> : null}
      {route === "G1" ? <DestinationListScreen {...screenProps} /> : null}
      {route === "G2" ? <DestinationCareScreen {...screenProps} /> : null}
      {route === "G3" ? <TripPlannerScreen {...screenProps} /> : null}
      {route === "G4" ? <WalkingTripScreen {...screenProps} /> : null}
      {route === "G5" ? <AiJourneyPlannerScreen {...screenProps} /> : null}
      {route === "G6" ? <PremiumScreen {...screenProps} /> : null}
      {route === "P1" ? <DestinationAddScreen {...screenProps} /> : null}
      {route === "P2" ? <DestinationGuideScreen {...screenProps} /> : null}
      {route === "P3" ? <DestinationHubScreen {...screenProps} /> : null}
      {route === "M1" ? <MyScreen {...screenProps} /> : null}
      {route === "M2" ? <AlertSettingsScreen {...screenProps} /> : null}
      {route === "M3" ? <GlobalSettingsScreen {...screenProps} /> : null}
      {route === "M4" ? <AppPermissionsScreen {...screenProps} /> : null}
      {route === "A4" ? <AccountManagementScreen {...screenProps} /> : null}
      {route === "R1" ? <PolicyHubScreen {...screenProps} /> : null}
      {route === "R2" ? <PolicyDocumentScreen {...screenProps} /> : null}
      {route === "R3" ? <AdConsentScreen {...screenProps} /> : null}
      {route === "R4" ? <AdPlacementScreen {...screenProps} /> : null}
      {route === "O2" ? <OnboardingIntroScreen {...screenProps} /> : null}
      {route === "O7" ? <OnboardingOutfitScreen {...screenProps} /> : null}
      {route === "O1" ? <OnboardingSplashScreen {...screenProps} /> : null}
      {route === "O4" ? <StyleProfileScreen {...screenProps} /> : null}
      {route === "O5" ? <SmartCareOnboardingScreen {...screenProps} /> : null}
      {route === "O6" ? <OnboardingDestinationScreen {...screenProps} /> : null}
      {route === "A2" ? (
        <AccountConnectScreen
          gate={appState.gate}
          authStatus={appState.accountAuthStatus}
          authMessage={appState.accountAuthMessage}
          onCancel={appState.cancelAccountGate}
          onSignIn={appState.signInWithProvider}
        />
      ) : null}
      {route === "A3" ? (
        <TermsConsentScreen
          gate={appState.gate}
          authStatus={appState.accountAuthStatus}
          authMessage={appState.accountAuthMessage}
          accepted={termsConsentDraft}
          onDraftChange={setTermsConsentDraft}
          onOpenPolicyDocument={appState.openPolicyDocument}
          onCancel={appState.cancelAccountGate}
          onComplete={appState.completeTerms}
        />
      ) : null}
      {route === "O3" ? (
        <PermissionGateScreen
          gate={appState.permissionGate}
          locationReady={appState.locationReady}
          permissionReady={appState.permissionReady}
          destinationLimitNotice={appState.destinationLimitNotice}
          onCancel={appState.skipPermissionGate}
          onComplete={appState.completePermissionGate}
        />
      ) : null}
  </>);

  // On iPhone the dock belongs to each native controller. Keeping it as a
  // sibling of ScreenStack lets UIKit move only the body during an interactive
  // pop. The rail stays outside the stack on wide iOS layouts.
  const renderScreen = (screenRoute: AppRouteId) => (
    <View style={styles.stackPage}>
      {renderRouteContent(screenRoute)}
      {Platform.OS === "ios" && !useSideNavigation ? renderPrimaryNavigation(screenRoute) : null}
    </View>
  );

  return (
    <AppThemeProvider theme={presentationTheme}>
      <AmbientReadingContext.Provider value={readingAmbient}>
      <AppAmbientSurface routeId={route} enabled={Platform.OS === "ios" && !launchVisible} backgroundColor={appBackgroundColor} theme={theme} weather={ambientWeather} location={ambientLocation} reliable={ambientContext !== "neutral" && appState.state.weatherProvider.status === "ready" && !appState.state.weatherProvider.fallbackUsed && !ambientWeather.stale && !appState.isWeatherLoading}>
      <SafeAreaView
        accessibilityElementsHidden={launchVisible}
        importantForAccessibility={launchVisible ? "no-hide-descendants" : "auto"}
        pointerEvents={launchVisible ? "none" : "auto"}
        edges={["top", "right", "bottom", "left"]}
        style={[styles.safeArea, { backgroundColor: contentBackground }]}
      >
        <SystemBars backgroundColor={appBackgroundColor} isDarkTheme={theme.name === "dark"} />
        <ReservedRegionObserver onRegionsChange={handleReservedRegionsChange} />
        <ResponsiveLayoutContext.Provider value={layout}>
          <View style={[
            styles.root,
            useSideNavigation && styles.rootWithRail,
            reservedContentRegion.avoidsReservedRegion ? {
              flex: 0,
              width: reservedContentRegion.width,
              height: reservedContentRegion.height,
              marginLeft: reservedContentRegion.x,
              marginTop: reservedContentRegion.y,
            } : null,
            { backgroundColor: contentBackground },
          ]}>
            {useSideNavigation ? primaryNavigation : null}
            <NavigationStack key="route-stack" route={route} variant={isPrimaryTabRoute(route) ? "tab" : "detail"}
              backRoute={appState.canGoBack && !isPrimaryTabRoute(route) ? appState.backRoute : undefined}
              onGoBack={appState.goBack} renderScreen={renderScreen} />
            {Platform.OS !== "ios" && !useSideNavigation ? primaryNavigation : null}
          </View>
        </ResponsiveLayoutContext.Provider>
      </SafeAreaView>
      {launchVisible ? <LaunchSplash started={launchStarted} onReady={readyLaunch} onFinish={finishLaunch} /> : null}
      </AppAmbientSurface>
      </AmbientReadingContext.Provider>
    </AppThemeProvider>
  );
}

function isPrimaryTabRoute(route: AppRouteId) {
  return route === "H1" || route === "C1" || route === "G1" || route === "M1";
}

function shouldShowPrimaryNavigation(route: AppRouteId, styleProfileReturnRoute: P0RouteId | null) {
  return (isLaunchVisibleP0Route(route) && route !== "G6") || route === "A4" || route === "R1" || route === "R2" || (route === "O4" && styleProfileReturnRoute);
}

function SystemBars({ backgroundColor, isDarkTheme }: { backgroundColor: string; isDarkTheme: boolean }) {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    StatusBar.setBarStyle(isDarkTheme ? "light-content" : "dark-content");
    try {
      NavigationBar.setStyle(isDarkTheme ? "dark" : "light");
    } catch {
      // Android 제조사별 시스템 UI 제약으로 설정이 거부돼도 앱 렌더링은 유지한다.
    }
  }, [isDarkTheme]);

  if (Platform.OS === "android") {
    return null;
  }

  return <StatusBar backgroundColor={backgroundColor} barStyle={isDarkTheme ? "light-content" : "dark-content"} translucent={false} />;
}

function getBottomNavActiveRoute(route: AppRouteId, alertReturnTo?: P0RouteId, umbrellaReturnTo?: P0RouteId): P0RouteId {
  if (route === "A4" || route === "R1" || route === "R2") return "M1";
  if (route === "H7") return "H1";
  if (route === "M2" && (alertReturnTo === "G1" || alertReturnTo === "G2")) return "G1";
  // 우산(H4)은 홈·코디 양쪽에서 진입 가능해 항상 홈으로 고정하면 코디에서 들어왔을 때 탭 표시가 어긋난다.
  // 뒤로가기가 실제로 돌아갈 라우트(umbrellaReturnTo) 기준으로 탭을 맞춘다.
  if (route === "H4" && umbrellaReturnTo) return umbrellaReturnTo;
  if (isLaunchVisibleP0Route(route)) return route;
  return "H1";
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: appColors.navy,
  },
  rootWithRail: {
    flexDirection: "row",
  },
  stackPage: {
    flex: 1,
  },
});
