import React from "react";
import { StyleSheet, View } from "react-native";
import { BottomNav } from "../components/BottomNav";
import { isP0Route } from "./routes";
import { HomeScreen } from "../screens/HomeScreen";
import { OutfitScreen } from "../screens/OutfitScreen";
import { OutfitDetailScreen } from "../screens/OutfitDetailScreen";
import { WardrobeScreen } from "../screens/WardrobeScreen";
import { WardrobePresetScreen } from "../screens/WardrobePresetScreen";
import { UmbrellaScreen } from "../screens/UmbrellaScreen";
import { RainTimelineScreen } from "../screens/RainTimelineScreen";
import { NotificationCenterScreen } from "../screens/NotificationCenterScreen";
import { AlertSettingsScreen } from "../screens/AlertSettingsScreen";
import { MyScreen } from "../screens/MyScreen";
import { GlobalSettingsScreen } from "../screens/GlobalSettingsScreen";
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
import { AccountConnectScreen } from "../screens/AccountConnectScreen";
import { TermsConsentScreen } from "../screens/TermsConsentScreen";
import { PermissionGateScreen } from "../screens/PermissionGateScreen";
import { OnboardingIntroScreen } from "../screens/OnboardingIntroScreen";
import { StyleProfileScreen } from "../screens/StyleProfileScreen";
import { SmartCareOnboardingScreen } from "../screens/SmartCareOnboardingScreen";
import { OnboardingDestinationScreen } from "../screens/OnboardingDestinationScreen";
import { useWeatherOnAppState } from "../state/useWeatherOnAppState";
import { appColors } from "../theme/tokens";

export function AppNavigator() {
  const appState = useWeatherOnAppState();

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
    selectedDestinationPlace: appState.selectedDestinationPlace,
    destinationHubFilter: appState.destinationHubFilter,
    placeSearchQuery: appState.placeSearchQuery,
    placeSearchResults: appState.placeSearchResults,
    isPlaceSearchLoading: appState.isPlaceSearchLoading,
    readNotificationIds: appState.readNotificationIds,
    notificationHistory: appState.notificationHistory,
    alertSettingsRouteState: appState.alertSettingsRouteState,
    selectedPolicyDocument: appState.selectedPolicyDocument,
    adConsentMode: appState.adConsentMode,
    temperatureUnit: appState.temperatureUnit,
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
    onOpenAlertSettings: appState.openAlertSettings,
    onReturnFromAlertSettings: appState.returnFromAlertSettings,
    onOpenPolicyDocument: appState.openPolicyDocument,
    onReturnFromPolicyDocument: appState.returnFromPolicyDocument,
    onSetAdConsentMode: appState.setAdConsentMode,
    onSetTemperatureUnit: appState.setTemperatureUnit,
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
    onSaveDestination: appState.saveDestination,
    onToggleDestinationCare: appState.toggleDestinationCare,
    onToggleSavedDestinationCare: appState.toggleSavedDestinationCare,
    onCycleDestinationAlertCondition: appState.cycleSelectedDestinationAlertCondition,
    onRemoveSavedDestination: appState.removeSavedDestination,
    onRestoreRemovedDestination: appState.restoreRemovedDestination,
    onSetDestinationHubFilter: appState.setDestinationHubFilter,
    onSearchPlaces: appState.searchPlaces,
    onSelectDestinationPlace: appState.selectDestinationPlace,
    onMarkNotificationRead: appState.markNotificationRead,
    onMarkAllNotificationsRead: appState.markAllNotificationsRead,
    onClearNotificationHistory: appState.clearNotificationHistory,
    onEditDestinationAlertCondition: appState.editDestinationAlertCondition,
    onEditNotificationCondition: appState.editNotificationCondition,
    onOpenNotificationDeepLink: appState.openNotificationDeepLink,
    onRefreshWeather: appState.refreshWeather,
    onRequireAccount: appState.requestAccountGate,
    onRequestPermissionGate: appState.requestPermissionGate,
    onSignOutAccount: appState.signOutAccount,
  };

  return (
    <View style={styles.root}>
      {appState.route === "H1" ? <HomeScreen {...screenProps} /> : null}
      {appState.route === "C1" ? <OutfitScreen {...screenProps} /> : null}
      {appState.route === "C2" ? <WardrobeScreen {...screenProps} /> : null}
      {appState.route === "C3" ? <WardrobePresetScreen {...screenProps} /> : null}
      {appState.route === "C4" ? <OutfitDetailScreen {...screenProps} /> : null}
      {appState.route === "H4" ? <UmbrellaScreen {...screenProps} /> : null}
      {appState.route === "H5" ? <RainTimelineScreen {...screenProps} /> : null}
      {appState.route === "H3" ? <NotificationCenterScreen {...screenProps} /> : null}
      {appState.route === "G1" ? <DestinationListScreen {...screenProps} /> : null}
      {appState.route === "G2" ? <DestinationCareScreen {...screenProps} /> : null}
      {appState.route === "P1" ? <DestinationAddScreen {...screenProps} /> : null}
      {appState.route === "P2" ? <DestinationGuideScreen {...screenProps} /> : null}
      {appState.route === "P3" ? <DestinationHubScreen {...screenProps} /> : null}
      {appState.route === "M1" ? <MyScreen {...screenProps} /> : null}
      {appState.route === "M2" ? <AlertSettingsScreen {...screenProps} /> : null}
      {appState.route === "M3" ? <GlobalSettingsScreen {...screenProps} /> : null}
      {appState.route === "A4" ? <AccountManagementScreen {...screenProps} /> : null}
      {appState.route === "R1" ? <PolicyHubScreen {...screenProps} /> : null}
      {appState.route === "R2" ? <PolicyDocumentScreen {...screenProps} /> : null}
      {appState.route === "R3" ? <AdConsentScreen {...screenProps} /> : null}
      {appState.route === "R4" ? <AdPlacementScreen {...screenProps} /> : null}
      {appState.route === "O2" ? <OnboardingIntroScreen {...screenProps} /> : null}
      {appState.route === "O4" ? <StyleProfileScreen {...screenProps} /> : null}
      {appState.route === "O5" ? <SmartCareOnboardingScreen {...screenProps} /> : null}
      {appState.route === "O6" ? <OnboardingDestinationScreen {...screenProps} /> : null}
      {appState.route === "A2" ? (
        <AccountConnectScreen gate={appState.gate} onCancel={appState.cancelAccountGate} onComplete={appState.completeAccountLink} />
      ) : null}
      {appState.route === "A3" ? (
        <TermsConsentScreen gate={appState.gate} onCancel={appState.cancelAccountGate} onComplete={appState.completeTerms} />
      ) : null}
      {appState.route === "O3" ? (
        <PermissionGateScreen
          gate={appState.permissionGate}
          locationReady={appState.locationReady}
          permissionReady={appState.permissionReady}
          onCancel={appState.skipPermissionGate}
          onComplete={appState.completePermissionGate}
        />
      ) : null}
      {isP0Route(appState.route) ? <BottomNav activeRoute={appState.route} onNavigate={appState.navigate} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.navy,
  },
});
