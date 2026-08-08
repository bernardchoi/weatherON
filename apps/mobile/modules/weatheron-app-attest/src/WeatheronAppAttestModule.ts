import { NativeModule, requireNativeModule } from "expo";

declare class WeatheronAppAttestModule extends NativeModule {
  isSupported(): boolean;
  generateKey(): Promise<string>;
  attestKey(keyId: string, clientDataHashBase64: string): Promise<string>;
  generateAssertion(keyId: string, clientDataHashBase64: string): Promise<string>;
}

export default requireNativeModule<WeatheronAppAttestModule>("WeatheronAppAttest");
