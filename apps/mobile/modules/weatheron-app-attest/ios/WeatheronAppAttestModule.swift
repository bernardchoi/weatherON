import DeviceCheck
import ExpoModulesCore

public class WeatheronAppAttestModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WeatheronAppAttest")

    Function("isSupported") { () -> Bool in
      DCAppAttestService.shared.isSupported
    }

    AsyncFunction("generateKey") { () async throws -> String in
      try await DCAppAttestService.shared.generateKey()
    }

    AsyncFunction("attestKey") { (keyId: String, clientDataHashBase64: String) async throws -> String in
      let clientDataHash = try decodeHash(clientDataHashBase64)
      let attestation = try await DCAppAttestService.shared.attestKey(keyId, clientDataHash: clientDataHash)
      return attestation.base64EncodedString()
    }

    AsyncFunction("generateAssertion") { (keyId: String, clientDataHashBase64: String) async throws -> String in
      let clientDataHash = try decodeHash(clientDataHashBase64)
      let assertion = try await DCAppAttestService.shared.generateAssertion(keyId, clientDataHash: clientDataHash)
      return assertion.base64EncodedString()
    }
  }

  private func decodeHash(_ value: String) throws -> Data {
    guard let data = Data(base64Encoded: value), data.count == 32 else {
      throw AppAttestModuleError.invalidClientDataHash
    }
    return data
  }
}

private enum AppAttestModuleError: Error {
  case invalidClientDataHash
}
