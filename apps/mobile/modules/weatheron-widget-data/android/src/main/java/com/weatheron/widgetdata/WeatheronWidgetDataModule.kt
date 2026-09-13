package com.weatheron.widgetdata

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WeatheronWidgetDataModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WeatheronWidgetData")

    Function("saveSnapshot") { snapshotJson: String ->
      val context = appContext.reactContext ?: return@Function false
      val preferences = context.getSharedPreferences(WIDGET_PREFERENCES, Context.MODE_PRIVATE)
      if (preferences.getString(WIDGET_SNAPSHOT_KEY, null) != snapshotJson) {
        preferences.edit().putString(WIDGET_SNAPSHOT_KEY, snapshotJson).apply()
        WeatherONWidgetProvider.updateAll(context)
      }
      true
    }

    Function("getDepartureActivityStatus") {
      val context = appContext.reactContext ?: return@Function WeatherONDepartureNotification.unavailableStatus()
      WeatherONDepartureNotification.status(context)
    }

    Function("startDepartureActivity") { payloadJson: String ->
      val context = appContext.reactContext ?: return@Function WeatherONDepartureNotification.unavailableStatus()
      WeatherONDepartureNotification.startOrSchedule(context, payloadJson)
    }

    Function("endDepartureActivity") {
      val context = appContext.reactContext ?: return@Function false
      WeatherONDepartureNotification.end(context, clearDismissal = true)
      true
    }
  }
}

internal const val WIDGET_PREFERENCES = "weatheron_widget"
internal const val WIDGET_SNAPSHOT_KEY = "weatheron.widget.store.v2"
