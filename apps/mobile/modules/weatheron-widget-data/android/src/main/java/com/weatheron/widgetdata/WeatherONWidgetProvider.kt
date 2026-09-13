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
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

class WeatherONWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, widgetIds: IntArray) {
    widgetIds.forEach { update(context, manager, it) }
  }

  companion object {
    private val updateTimeFormatter = DateTimeFormatter.ofPattern("HH:mm")

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
      views.setTextViewText(R.id.weatheron_widget_temperature, "${snapshot.temperatureC}°")
      views.setTextViewText(R.id.weatheron_widget_condition, snapshot.conditionLabel)
      views.setTextViewText(
        R.id.weatheron_widget_detail,
        "체감 ${snapshot.feelsLikeC}° · 강수 ${snapshot.rainProbabilityPct}%"
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
        ?: return WidgetViewData.placeholder
      return runCatching {
        val store = JSONObject(raw)
        val selectedId = store.optString("selectedDestinationId")
        val destinations = store.optJSONArray("destinations")
        val selected = (0 until (destinations?.length() ?: 0))
          .mapNotNull { destinations?.optJSONObject(it) }
          .firstOrNull { selectedId.isNotEmpty() && it.optString("id") == selectedId }
        val location = selected ?: store.getJSONObject("current")
        WidgetViewData(
          locationName = location.optString("locationName", "WeatherON"),
          temperatureC = location.optDouble("temperatureC", 0.0).roundToInt(),
          feelsLikeC = location.optDouble("feelsLikeC", 0.0).roundToInt(),
          conditionLabel = location.optString("conditionLabel", "날씨 확인 중"),
          rainProbabilityPct = location.optDouble("rainProbabilityPct", 0.0).roundToInt(),
          preparation = preparation(location),
          outfitSummary = location.optString("outfitSummary").ifBlank { "코디를 확인해 보세요" },
          updatedLabel = formatUpdatedAt(store.optString("updatedAt")),
          deepLink = location.optString("deepLink", "weatheron://home")
        )
      }.getOrDefault(WidgetViewData.placeholder)
    }

    private fun preparation(location: JSONObject): String {
      val items = buildList {
        if (location.optBoolean("umbrellaNeeded")) add("우산")
        if (location.optBoolean("outerNeeded")) add("겉옷")
        if (location.optBoolean("maskNeeded")) add("마스크")
      }
      return if (items.isEmpty()) "준비 부담 낮음" else items.joinToString(" · ") + " 챙기기"
    }

    private fun formatUpdatedAt(value: String): String = runCatching {
      val time = Instant.parse(value).atZone(ZoneId.systemDefault()).format(updateTimeFormatter)
      "WeatherON · $time 갱신"
    }.getOrDefault("WeatherON")
  }
}

private data class WidgetViewData(
  val locationName: String,
  val temperatureC: Int,
  val feelsLikeC: Int,
  val conditionLabel: String,
  val rainProbabilityPct: Int,
  val preparation: String,
  val outfitSummary: String,
  val updatedLabel: String,
  val deepLink: String,
) {
  companion object {
    val placeholder = WidgetViewData(
      locationName = "WeatherON",
      temperatureC = 0,
      feelsLikeC = 0,
      conditionLabel = "앱에서 날씨를 확인해 주세요",
      rainProbabilityPct = 0,
      preparation = "외출 준비를 확인해 보세요",
      outfitSummary = "최신 코디가 여기에 표시됨",
      updatedLabel = "WeatherON",
      deepLink = "weatheron://home",
    )
  }
}
