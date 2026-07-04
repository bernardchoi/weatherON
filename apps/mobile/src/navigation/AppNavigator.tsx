import React, { useEffect } from "react";
import { BackHandler, StyleSheet, useColorScheme, View } from "react-native";
import { BottomNav } from "../components/BottomNav";
import { isLaunchHiddenRoute, isLaunchVisibleP0Route, type AppRouteId, type P0RouteId } from "./routes";
import { HomeScreen } from "../screens/HomeScreen";
import { LocationChangeScreen } from "../screens/LocationChangeScreen";
import { OutfitScreen } from "../screens/OutfitScreen";
import { OutfitDetailScreen } from "../screens/OutfitDetailScreen";
import { WardrobeScreen } from "../screens/WardrobeScreen";
import { WardrobePresetScreen } from "../screens/WardrobePresetScreen";
import { UmbrellaScreen } from "../screens/UmbrellaScreen";
import { RainTimelineScreen } from "../screens/RainTimelineScreen";
import { WeatherDetailScreen } from "../screens/WeatherDetailScreen";
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
import { TermsConsentScreen } from "../screens/TermsConsentScreen";
import { PermissionGateScreen } from "../screens/PermissionGateScreen";
import { OnboardingIntroScreen } from "../screens/OnboardingIntroScreen";
import { StyleProfileScreen } from "../screens/StyleProfileScreen";
import { SmartCareOnboardingScreen } from "../screens/SmartCareOnboardingScreen";
import { OnboardingDestinationScreen } from "../screens/OnboardingDestinationScreen";
import { AppEntrySplashScreen, OnboardingSplashScreen } from "../screens/SplashScreens";
import { useWeatherOnAppState } from "../state/useWeatherOnAppState";
import { AppThemeProvider } from "../theme/AppThemeContext";
import { appColors, resolveAppTheme } from "../theme/tokens";

export function AppNavigator() {
  const appState = useWeatherOnAppState();
  const systemTheme = useColorScheme();
  const theme = resolveAppTheme(appState.themeMode, systemTheme);
  const route = isLaunchHiddenRoute(appState.route) ? "H1" : appState.route;
  const bottomNavActiveRoute = getBottomNavActiveRoute(route, appState.alertSettingsRouteState?.returnTo);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", appState.goBack);
    return () => subscription.remove();
  }, [appState.goBack]);

  const screenProps = {
    state: appState.state,
    useDestinationWeather: appState.useDestinationWeather,
    umbrellaReviewed: appState.umbrellaReviewed,
    smartCareEnabled: appState.smartCareEnabled,
    weatherProviderMode: appState.weatherProviderMode,
    weatherLocationMode: appState.weatherLocationMode,
    deviceLocationState: appState.deviceLocationState,
    destinationSaved: appState.destinationSaved,
    savedDestinations: appState.savedDestinations,
    recentlyRemovedDestination: appState.recentlyRemovedDestination,
    destinationCareEnabled: appState.destinationCareEnabled,
    selectedDestinationAlertCondition: appState.selectedDestinationAlertCondition,
    selectedDestinationSchedulePreference: appState.selectedDestinationSchedulePreference,
    selectedDestinationTravelEstimate: appState.selectedDestinationTravelEstimate,
    selectedDestinationPlace: appState.selectedDestinationPlace,
    destinationSelectionReady: appState.destinationSelectionReady,
    destinationHubFilter: appState.destinationHubFilter,
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
    adConsentMode: appState.adConsentMode,
    temperatureUnit: appState.temperatureUnit,
    distanceUnit: appState.distanceUnit,
    themeMode: appState.themeMode,
    reducedTransparency: appState.reducedTransparency,
    styleProfileSaved: appState.styleProfileSaved,
    styleGender: appState.styleGender,
    ageBand: appState.ageBand,
    fitPreference: appState.fitPreference,
    selectedStyles: appState.selectedStyles,
    wardrobeItems: appState.wardrobe,
    selectedWardrobeItemId: appState.selectedWardrobeItemId,
    smartCareScenario: appState.smartCareScenario,
    onboardingCompleted: appState.onboardingCompleted,
    isWeatherLoading: appState.isWeatherLoading,
    accountLinked: appState.accountLinked,
    termsRequiredAccepted: appState.termsRequiredAccepted,
    locationReady: appState.locationReady,
    permissionReady: appState.permissionReady,
    outfitSaved: appState.outfitSaved,
    accountGateResult: appState.accountGateResult,
    permissionGateResult: appState.permissionGateResult,
    onNavigate: appState.navigate,
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
    onSetStyleGender: appState.setStyleGender,
    onSetAgeBand: appState.setAgeBand,
    onSetFitPreference: appState.setFitPreference,
    onToggleStyleTag: appState.toggleStyleTag,
    onSetWardrobeItemOwned: appState.setWardrobeItemOwned,
    onOpenWardrobeItem: appState.openWardrobeItem,
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
    onSelectWeatherLocation: appState.selectWeatherLocation,
    onSaveDestination: appState.saveDestination,
    onReturnFromDestinationAdd: appState.returnFromDestinationAdd,
    onToggleDestinationCare: appState.toggleDestinationCare,
    onToggleSavedDestinationCare: appState.toggleSavedDestinationCare,
    onCycleDestinationAlertCondition: appState.cycleSelectedDestinationAlertCondition,
    onSetDestinationTargetArrivalTime: appState.setSelectedDestinationTargetArrivalTime,
    onSetDestinationTransportMode: appState.setSelectedDestinationTransportMode,
    onToggleDestinationRepeat: appState.toggleSelectedDestinationRepeat,
    onToggleDestinationRepeatDay: appState.toggleSelectedDestinationRepeatDay,
    onRemoveSavedDestination: appState.removeSavedDestination,
    onRestoreRemovedDestination: appState.restoreRemovedDestination,
    onSetDestinationHubFilter: appState.setDestinationHubFilter,
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
    onRequestPermissionGate: appState.requestPermissionGate,
    onSignOutAccount: appState.signOutAccount,
  };

  return (
    <AppThemeProvider theme={theme}>
      <View style={[styles.root, { backgroundColor: theme.background }]}>
      {route === "A1" ? <AppEntrySplashScreen {...screenProps} /> : null}
      {route === "H1" ? <HomeScreen {...screenProps} /> : null}
      {route === "H2" ? <LocationChangeScreen {...screenProps} /> : null}
      {route === "C1" ? <OutfitScreen {...screenProps} /> : null}
      {route === "C2" ? <WardrobeScreen {...screenProps} /> : null}
      {route === "C3" ? <WardrobePresetScreen {...screenProps} /> : null}
      {route === "C4" ? <OutfitDetailScreen {...screenProps} /> : null}
      {route === "H4" ? <UmbrellaScreen {...screenProps} /> : null}
      {route === "H5" ? <RainTimelineScreen {...screenProps} /> : null}
      {route === "H6" ? <WeatherDetailScreen {...screenProps} /> : null}
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
      {route === "O1" ? <OnboardingSplashScreen {...screenProps} /> : null}
      {route === "O4" ? <StyleProfileScreen {...screenProps} /> : null}
      {route === "O5" ? <SmartCareOnboardingScreen {...screenProps} /> : null}
      {route === "O6" ? <OnboardingDestinationScreen {...screenProps} /> : null}
      {route === "A2" ? (
        <AccountConnectScreen gate={appState.gate} onCancel={appState.cancelAccountGate} onComplete={appState.completeAccountLink} />
      ) : null}
      {route === "A3" ? (
        <TermsConsentScreen gate={appState.gate} onCancel={appState.cancelAccountGate} onComplete={appState.completeTerms} />
      ) : null}
      {route === "O3" ? (
        <PermissionGateScreen
          gate={appState.permissionGate}
          locationReady={appState.locationReady}
          permissionReady={appState.permissionReady}
          onCancel={appState.skipPermissionGate}
          onComplete={appState.completePermissionGate}
        />
      ) : null}
        {isLaunchVisibleP0Route(route) && route !== "G6" ? <BottomNav activeRoute={bottomNavActiveRoute} onNavigate={appState.navigate} /> : null}
        {route === "A4" || route === "R1" || route === "R2" ? <BottomNav activeRoute="M1" onNavigate={appState.navigate} /> : null}
        {route === "O4" && appState.styleProfileReturnRoute ? (
          <BottomNav activeRoute={appState.styleProfileReturnRoute} onNavigate={appState.navigate} />
        ) : null}
      </View>
    </AppThemeProvider>
  );
}

function getBottomNavActiveRoute(route: AppRouteId, alertReturnTo?: P0RouteId): P0RouteId {
  if (route === "M2" && (alertReturnTo === "G1" || alertReturnTo === "G2")) return "G1";
  if (isLaunchVisibleP0Route(route)) return route;
  return "H1";
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.navy,
  },
});
