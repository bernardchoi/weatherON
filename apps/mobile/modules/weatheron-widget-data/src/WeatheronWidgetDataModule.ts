import { NativeModule, requireOptionalNativeModule } from "expo";

declare class WeatheronWidgetDataModule extends NativeModule {
  saveSnapshot(snapshotJson: string): boolean;
}

export default requireOptionalNativeModule<WeatheronWidgetDataModule>("WeatheronWidgetData");
