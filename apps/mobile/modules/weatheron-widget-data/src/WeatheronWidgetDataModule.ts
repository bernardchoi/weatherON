import { NativeModule, requireNativeModule } from "expo";

declare class WeatheronWidgetDataModule extends NativeModule {
  saveSnapshot(snapshotJson: string): boolean;
}

export default requireNativeModule<WeatheronWidgetDataModule>("WeatheronWidgetData");
