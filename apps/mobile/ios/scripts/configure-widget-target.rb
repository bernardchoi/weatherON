#!/usr/bin/env ruby

require "xcodeproj"

project_path = File.expand_path("../WeatherON.xcodeproj", __dir__)
project = Xcodeproj::Project.open(project_path)
app_target = project.targets.find { |target| target.name == "WeatherON" }
raise "WeatherON app target not found" unless app_target

widget_target = project.targets.find { |target| target.name == "WeatherONWidget" }
widget_target ||= project.new_target(:app_extension, "WeatherONWidget", :ios, "17.0")

widget_group = project.main_group.find_subpath("WeatherONWidget", true)
widget_group.set_source_tree("<group>")
widget_group.set_path("WeatherONWidget")

swift_file = widget_group.files.find { |file| file.path == "WeatherONWidget.swift" }
swift_file ||= widget_group.new_file("WeatherONWidget.swift")
widget_target.source_build_phase.add_file_reference(swift_file, true)

unless app_target.dependencies.any? { |dependency| dependency.target == widget_target }
  app_target.add_dependency(widget_target)
end

embed_phase = app_target.copy_files_build_phases.find { |phase| phase.name == "Embed App Extensions" }
embed_phase ||= app_target.new_copy_files_build_phase("Embed App Extensions")
embed_phase.symbol_dst_subfolder_spec = :plug_ins
unless embed_phase.files_references.include?(widget_target.product_reference)
  build_file = embed_phase.add_file_reference(widget_target.product_reference, true)
  build_file.settings = { "ATTRIBUTES" => ["RemoveHeadersOnCopy"] }
end

widget_target.build_configurations.each do |configuration|
  settings = configuration.build_settings
  settings["APPLICATION_EXTENSION_API_ONLY"] = "YES"
  settings["CODE_SIGN_ENTITLEMENTS"] = "WeatherONWidget/WeatherONWidget.entitlements"
  settings["CURRENT_PROJECT_VERSION"] = "22"
  settings["GENERATE_INFOPLIST_FILE"] = "NO"
  settings["INFOPLIST_FILE"] = "WeatherONWidget/Info.plist"
  settings["IPHONEOS_DEPLOYMENT_TARGET"] = "17.0"
  settings["LD_RUNPATH_SEARCH_PATHS"] = ["$(inherited)", "@executable_path/Frameworks", "@executable_path/../../Frameworks"]
  settings["MARKETING_VERSION"] = "1.0.0"
  settings["PRODUCT_BUNDLE_IDENTIFIER"] = "com.weatheron.mobile.widget"
  settings["PRODUCT_NAME"] = "$(TARGET_NAME)"
  settings["SKIP_INSTALL"] = "YES"
  settings["SWIFT_VERSION"] = "5.0"
  settings["TARGETED_DEVICE_FAMILY"] = "1"
end

project.save
