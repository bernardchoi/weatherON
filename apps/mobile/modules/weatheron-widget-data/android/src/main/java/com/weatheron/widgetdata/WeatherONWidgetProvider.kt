package com.weatheron.widgetdata

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import org.json.JSONObject
import java.time.Instant
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

class WeatherONWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, widgetIds: IntArray) {
    widgetIds.forEach { update(context, manager, it) }
  }

  companion object {
    fun updateAll(context: Context) {
      val manager = AppWidgetManager.getInstance(context)
      val widgetIds = manager.getAppWidgetIds(ComponentName(context, WeatherONWidgetProvider::class.java))
      widgetIds.forEach { update(context, manager, it) }
    }

    private fun update(context: Context, manager: AppWidgetManager, widgetId: Int) {
      val snapshot = readSnapshot(context)
      val views = RemoteViews(context.packageName, R.layout.weatheron_widget)
      views.setTextViewText(R.id.weatheron_widget_location, snapshot.locationName)
      views.setTextViewText(R.id.weatheron_widget_updated, snapshot.updatedLabel)
      views.setTextViewText(R.id.weatheron_widget_temperature, temperature(snapshot.temperatureC, snapshot.temperatureUnit))
      views.setTextViewText(R.id.weatheron_widget_condition, conditionLabel(context, snapshot.condition))
      views.setTextViewText(
        R.id.weatheron_widget_detail,
        context.getString(R.string.weatheron_widget_feels_rain, temperature(snapshot.feelsLikeC, snapshot.temperatureUnit), snapshot.rainProbabilityPct)
      )
      views.setTextViewText(R.id.weatheron_widget_preparation, snapshot.preparation)
      views.setTextViewText(R.id.weatheron_widget_outfit, snapshot.outfitSummary)

      val intent = Intent(Intent.ACTION_VIEW, Uri.parse(snapshot.deepLink)).apply {
        setPackage(context.packageName)
      }
      val pendingIntent = PendingIntent.getActivity(
        context,
        widgetId,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
      )
      views.setOnClickPendingIntent(R.id.weatheron_widget_root, pendingIntent)
      manager.updateAppWidget(widgetId, views)
    }

    private fun readSnapshot(context: Context): WidgetViewData {
      // ponytail: 앱이 저장한 스냅샷만 사용함. 앱 미실행 중 독립 갱신이 필요하면 WorkManager에 기존 weather provider를 연결한다.
      val raw = context.getSharedPreferences(WIDGET_PREFERENCES, Context.MODE_PRIVATE)
        .getString(WIDGET_SNAPSHOT_KEY, null)
        ?: return WidgetViewData.placeholder(context)
      return runCatching {
        val store = JSONObject(raw)
        val selectedId = store.optString("selectedDestinationId")
        val destinations = store.optJSONArray("destinations")
        val selected = (0 until (destinations?.length() ?: 0))
          .mapNotNull { destinations?.optJSONObject(it) }
          .firstOrNull { selectedId.isNotEmpty() && it.optString("id") == selectedId }
        val location = selected ?: store.getJSONObject("current")
        val temperatureUnit = store.optJSONObject("localization")?.optString("temperatureUnit", "celsius") ?: "celsius"
        WidgetViewData(
          locationName = location.optString("locationName", "WeatherON"),
          temperatureC = location.optDouble("temperatureC", 0.0).roundToInt(),
          feelsLikeC = location.optDouble("feelsLikeC", 0.0).roundToInt(),
          condition = location.optString("condition", "cloud"),
          rainProbabilityPct = location.optDouble("rainProbabilityPct", 0.0).roundToInt(),
          preparation = preparation(context, location),
          outfitSummary = location.optString("outfitSummary").ifBlank { context.getString(R.string.weatheron_widget_outfit_empty) },
          updatedLabel = formatUpdatedAt(context, store.optString("updatedAt")),
          deepLink = location.optString("deepLink", "weatheron://home"),
          temperatureUnit = temperatureUnit,
        )
      }.getOrDefault(WidgetViewData.placeholder(context))
    }

    private fun preparation(context: Context, location: JSONObject): String {
      val items = buildList {
        if (location.optBoolean("umbrellaNeeded")) add(context.getString(R.string.weatheron_widget_umbrella))
        if (location.optBoolean("outerNeeded")) add(context.getString(R.string.weatheron_widget_outer))
        if (location.optBoolean("maskNeeded")) add(context.getString(R.string.weatheron_widget_mask))
      }
      return if (items.isEmpty()) context.getString(R.string.weatheron_widget_prep_low) else context.getString(R.string.weatheron_widget_pack, items.joinToString(" · "))
    }

    private fun formatUpdatedAt(context: Context, value: String): String = runCatching {
      val locale = context.resources.configuration.locales[0] ?: Locale.ENGLISH
      val pattern = if (android.text.format.DateFormat.is24HourFormat(context)) "HH:mm" else "h:mm a"
      val formatter = java.text.SimpleDateFormat(pattern, locale)
      val time = formatter.format(Date.from(Instant.parse(value)))
      context.getString(R.string.weatheron_widget_updated, time)
    }.getOrDefault("WeatherON")

    private fun temperature(valueC: Int, unit: String): String = if (unit == "fahrenheit") "${(valueC * 9.0 / 5.0 + 32).roundToInt()}°F" else "${valueC}°C"

    private fun conditionLabel(context: Context, condition: String): String = context.getString(when (condition) {
      "checking" -> R.string.weatheron_widget_checking
      "clear" -> R.string.weatheron_condition_clear
      "rain" -> R.string.weatheron_condition_rain
      "snow" -> R.string.weatheron_condition_snow
      "storm" -> R.string.weatheron_condition_storm
      "dust" -> R.string.weatheron_condition_dust
      else -> R.string.weatheron_condition_cloud
    })
  }
}

private data class WidgetViewData(
  val locationName: String,
  val temperatureC: Int,
  val feelsLikeC: Int,
  val condition: String,
  val rainProbabilityPct: Int,
  val preparation: String,
  val outfitSummary: String,
  val updatedLabel: String,
  val deepLink: String,
  val temperatureUnit: String,
) {
  companion object {
    fun placeholder(context: Context) = WidgetViewData(
      locationName = "WeatherON",
      temperatureC = 0,
      feelsLikeC = 0,
      condition = "checking",
      rainProbabilityPct = 0,
      preparation = context.getString(R.string.weatheron_widget_open_prep),
      outfitSummary = context.getString(R.string.weatheron_widget_outfit_latest),
      updatedLabel = "WeatherON",
      deepLink = "weatheron://home",
      temperatureUnit = "celsius",
    )
  }
}
