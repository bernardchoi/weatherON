package com.weatheron.widgetdata

import android.Manifest
import android.app.AlarmManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Build
import android.os.Bundle
import org.json.JSONObject
import java.time.Instant
import kotlin.math.ceil

class WeatherONDepartureReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    when (intent.action) {
      ACTION_START -> WeatherONDepartureNotification.startStored(context)
      ACTION_END -> WeatherONDepartureNotification.end(context)
      ACTION_STOP -> WeatherONDepartureNotification.end(context, dismissed = true)
      Intent.ACTION_BOOT_COMPLETED, Intent.ACTION_MY_PACKAGE_REPLACED -> WeatherONDepartureNotification.restore(context)
    }
  }
}

internal object WeatherONDepartureNotification {
  private const val CHANNEL_ID = "weatheron-departure-live"
  private const val NOTIFICATION_ID = 1206
  private const val LEAD_MILLIS = 60 * 60 * 1_000L
  private const val PREFERENCES = "weatheron_departure"
  private const val PAYLOAD_KEY = "payload"
  private const val ACTIVE_KEY = "active"
  private const val DISMISSED_KEY = "dismissed_plan"
  private const val PROMOTED_EXTRA = "android.requestPromotedOngoing"

  fun unavailableStatus() = statusJson(supported = false, enabled = false)

  fun startOrSchedule(context: Context, raw: String): String {
    val payload = DeparturePayload.parse(raw) ?: throw IllegalArgumentException("Invalid departure payload")
    val now = System.currentTimeMillis()
    if (payload.departureAtMs <= now) {
      end(context)
      return status(context)
    }
    val preferences = preferences(context)
    val dismissedPlan = preferences.getString(DISMISSED_KEY, null)
    if (dismissedPlan == payload.planKey) return statusJson(enabled = notificationsEnabled(context))
    preferences.edit().putString(PAYLOAD_KEY, raw).remove(DISMISSED_KEY).apply()
    return if (payload.departureAtMs - LEAD_MILLIS <= now) {
      post(context, payload)
      schedule(context, ACTION_END, payload.departureAtMs, END_REQUEST_CODE)
      preferences.edit().putBoolean(ACTIVE_KEY, true).apply()
      statusJson(enabled = notificationsEnabled(context), active = true, payload = payload)
    } else {
      // ponytail: 일반 알람은 절전 모드에서 늦어질 수 있음. 실제 지연이 문제일 때만 exact-alarm 권한을 추가한다.
      schedule(context, ACTION_START, payload.departureAtMs - LEAD_MILLIS, START_REQUEST_CODE)
      schedule(context, ACTION_END, payload.departureAtMs, END_REQUEST_CODE)
      preferences.edit().putBoolean(ACTIVE_KEY, false).apply()
      statusJson(enabled = notificationsEnabled(context), scheduled = true, payload = payload)
    }
  }

  fun status(context: Context): String {
    val enabled = notificationsEnabled(context)
    if (!enabled) return statusJson(enabled = false)
    val raw = preferences(context).getString(PAYLOAD_KEY, null) ?: return statusJson(enabled = notificationsEnabled(context))
    val payload = DeparturePayload.parse(raw) ?: run {
      end(context)
      return statusJson(enabled = notificationsEnabled(context))
    }
    if (payload.departureAtMs <= System.currentTimeMillis()) {
      end(context)
      return statusJson(enabled = notificationsEnabled(context))
    }
    if (preferences(context).getString(DISMISSED_KEY, null) == payload.planKey) {
      return statusJson(enabled = notificationsEnabled(context))
    }
    val active = preferences(context).getBoolean(ACTIVE_KEY, false)
    return statusJson(
      enabled = notificationsEnabled(context),
      active = active,
      scheduled = !active,
      payload = payload,
    )
  }

  fun startStored(context: Context) {
    val raw = preferences(context).getString(PAYLOAD_KEY, null) ?: return
    startOrSchedule(context, raw)
  }

  fun restore(context: Context) {
    val raw = preferences(context).getString(PAYLOAD_KEY, null) ?: return
    startOrSchedule(context, raw)
  }

  fun end(context: Context, dismissed: Boolean = false, clearDismissal: Boolean = false) {
    val preferences = preferences(context)
    val payload = preferences.getString(PAYLOAD_KEY, null)?.let(DeparturePayload::parse)
    cancelAlarm(context, ACTION_START, START_REQUEST_CODE)
    cancelAlarm(context, ACTION_END, END_REQUEST_CODE)
    context.getSystemService(NotificationManager::class.java).cancel(NOTIFICATION_ID)
    val editor = preferences.edit().remove(PAYLOAD_KEY).remove(ACTIVE_KEY)
    if (dismissed && payload != null) editor.putString(DISMISSED_KEY, payload.planKey)
    if (clearDismissal) editor.remove(DISMISSED_KEY)
    editor.apply()
  }

  private fun post(context: Context, payload: DeparturePayload) {
    if (!notificationsEnabled(context)) return
    val manager = context.getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(NotificationChannel(
      CHANNEL_ID,
      "출발 실시간 현황",
      NotificationManager.IMPORTANCE_DEFAULT,
    ).apply {
      description = "출발 전 카운트다운과 날씨 준비 안내"
      setSound(null, null)
      enableVibration(false)
    })

    val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse(payload.deepLink)).setPackage(context.packageName)
    val stopIntent = Intent(context, WeatherONDepartureReceiver::class.java).setAction(ACTION_STOP)
    val builder = Notification.Builder(context, CHANNEL_ID)
      .setSmallIcon(context.applicationInfo.icon)
      .setContentTitle("${payload.destinationName} 출발 준비")
      .setContentText(payload.guidance)
      .setSubText("${payload.departureTimeLabel} 출발")
      .setContentIntent(PendingIntent.getActivity(context, OPEN_REQUEST_CODE, openIntent, immutableFlags()))
      .addAction(Notification.Action.Builder(null, "종료", pendingBroadcast(context, STOP_REQUEST_CODE, stopIntent)).build())
      .setCategory(Notification.CATEGORY_NAVIGATION)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setShowWhen(true)
      .setWhen(payload.departureAtMs)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)

    if (Build.VERSION.SDK_INT >= 36) {
      val remainingMinutes = ceil((payload.departureAtMs - System.currentTimeMillis()) / 60_000.0).toInt().coerceIn(0, 60)
      builder
        .setShortCriticalText(payload.departureTimeLabel)
        .setStyle(Notification.ProgressStyle()
          .setProgress(60 - remainingMinutes)
          .setProgressSegments(listOf(Notification.ProgressStyle.Segment(60).setColor(Color.rgb(78, 157, 255))))
          .setStyledByProgress(true))
        .addExtras(Bundle().apply { putBoolean(PROMOTED_EXTRA, true) })
    } else {
      builder.setStyle(Notification.BigTextStyle().bigText("${payload.guidance}\n${payload.departureTimeLabel} 출발 예정"))
    }
    manager.notify(NOTIFICATION_ID, builder.build())
  }

  private fun notificationsEnabled(context: Context): Boolean =
    (Build.VERSION.SDK_INT < 33 || context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) &&
      context.getSystemService(NotificationManager::class.java).areNotificationsEnabled()

  private fun schedule(context: Context, action: String, at: Long, requestCode: Int) {
    val alarm = context.getSystemService(AlarmManager::class.java)
    alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pendingBroadcast(
      context,
      requestCode,
      Intent(context, WeatherONDepartureReceiver::class.java).setAction(action),
    ))
  }

  private fun cancelAlarm(context: Context, action: String, requestCode: Int) {
    context.getSystemService(AlarmManager::class.java).cancel(pendingBroadcast(
      context,
      requestCode,
      Intent(context, WeatherONDepartureReceiver::class.java).setAction(action),
    ))
  }

  private fun pendingBroadcast(context: Context, requestCode: Int, intent: Intent) = PendingIntent.getBroadcast(
    context,
    requestCode,
    intent,
    immutableFlags(),
  )

  private fun immutableFlags() = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  private fun preferences(context: Context) = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)

  private fun statusJson(
    supported: Boolean = true,
    enabled: Boolean = true,
    active: Boolean = false,
    scheduled: Boolean = false,
    payload: DeparturePayload? = null,
  ) = JSONObject().apply {
    put("supported", supported)
    put("enabled", enabled)
    put("active", active)
    put("scheduled", scheduled)
    put("automaticStartSupported", true)
    put("automaticEndScheduled", active || scheduled)
    put("lifecycle", if (active) "active" else if (scheduled) "scheduled" else "inactive")
    if (payload != null) {
      put("activityId", "android-departure")
      put("destinationId", payload.destinationId)
      put("departureAt", payload.departureAt)
      put("guidance", payload.guidance)
    }
  }.toString()
}

private const val ACTION_START = "com.weatheron.DEPARTURE_START"
private const val ACTION_END = "com.weatheron.DEPARTURE_END"
private const val ACTION_STOP = "com.weatheron.DEPARTURE_STOP"
private const val START_REQUEST_CODE = 12061
private const val END_REQUEST_CODE = 12062
private const val STOP_REQUEST_CODE = 12063
private const val OPEN_REQUEST_CODE = 12064

private data class DeparturePayload(
  val destinationId: String,
  val destinationName: String,
  val departureAt: String,
  val departureAtMs: Long,
  val departureTimeLabel: String,
  val guidance: String,
  val deepLink: String,
) {
  val planKey = "$destinationId:$departureAt"

  companion object {
    fun parse(raw: String): DeparturePayload? = runCatching {
      val json = JSONObject(raw)
      val departureAt = json.getString("departureAt")
      DeparturePayload(
        destinationId = json.getString("destinationId"),
        destinationName = json.getString("destinationName"),
        departureAt = departureAt,
        departureAtMs = Instant.parse(departureAt).toEpochMilli(),
        departureTimeLabel = json.getString("departureTimeLabel"),
        guidance = json.getString("guidance"),
        deepLink = json.getString("deepLink"),
      ).also {
        require(it.destinationId.isNotBlank() && it.destinationName.isNotBlank() && it.deepLink.startsWith("weatheron://"))
      }
    }.getOrNull()
  }
}
