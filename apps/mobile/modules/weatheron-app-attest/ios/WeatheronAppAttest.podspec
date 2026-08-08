Pod::Spec.new do |s|
  s.name           = 'WeatheronAppAttest'
  s.version        = '1.0.0'
  s.summary        = 'WeatherON App Attest bridge'
  s.description    = 'Expo bridge for Apple DeviceCheck App Attest.'
  s.author         = 'WeatherON'
  s.homepage       = 'https://github.com/weatheron'
  s.platforms      = {
    :ios => '16.4',
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
