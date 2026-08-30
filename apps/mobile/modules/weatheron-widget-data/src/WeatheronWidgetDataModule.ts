import { NativeModule, requireOptionalNativeModule } from "expo";

declare class WeatheronWidgetDataModule extends NativeModule {
  saveSnapshot(snapshotJson: string): boolean;
  protectWardrobePhoto(fileUri: string): boolean;
  getDepartureActivityStatus(): Promise<string>;
  startDepartureActivity(payloadJson: string): Promise<string>;
  endDepartureActivity(): Promise<boolean>;
}

export default requireOptionalNativeModule<WeatheronWidgetDataModule>("WeatheronWidgetData");
