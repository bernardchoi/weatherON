Pod::Spec.new do |s|
  s.name           = 'WeatheronWidgetData'
  s.version        = '1.0.0'
  s.summary        = 'Shares WeatherON snapshots with the iOS widget.'
  s.description    = 'Writes the latest current-location weather snapshot to an App Group and reloads WidgetKit timelines.'
  s.author         = 'WeatherON'
  s.homepage       = 'https://weatheron.app'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
