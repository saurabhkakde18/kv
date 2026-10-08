package com.vehiclefinancehub.app.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "finance_hub_settings")

class DataStoreManager(private val context: Context) {

    companion object {
        val KEY_THEME_MODE = stringPreferencesKey("theme_mode") // "DARK", "LIGHT", "SYSTEM"
        val KEY_APP_LOCK_ENABLED = booleanPreferencesKey("app_lock_enabled")
        val KEY_APP_LOCK_PIN = stringPreferencesKey("app_lock_pin")
        val KEY_BIOMETRIC_ENABLED = booleanPreferencesKey("biometric_enabled")
        val KEY_FLAG_SECURE = booleanPreferencesKey("flag_secure_enabled")
        val KEY_DATA_VERSION = intPreferencesKey("data_version")
        val KEY_LAST_UPDATED = stringPreferencesKey("last_updated_date")
    }

    val themeModeFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_THEME_MODE] ?: "DARK" // Default to Luxury Dark
    }

    val isAppLockEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_APP_LOCK_ENABLED] ?: false
    }

    val appLockPinFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_APP_LOCK_PIN]
    }

    val isBiometricEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_BIOMETRIC_ENABLED] ?: true
    }

    val isFlagSecureEnabledFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_FLAG_SECURE] ?: false
    }

    val dataVersionFlow: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[KEY_DATA_VERSION] ?: 1
    }

    val lastUpdatedFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_LAST_UPDATED] ?: "2026-10-07"
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_THEME_MODE] = mode
        }
    }

    suspend fun setAppLock(enabled: Boolean, pin: String? = null, biometric: Boolean = true) {
        context.dataStore.edit { prefs ->
            prefs[KEY_APP_LOCK_ENABLED] = enabled
            if (pin != null) prefs[KEY_APP_LOCK_PIN] = pin
            prefs[KEY_BIOMETRIC_ENABLED] = biometric
        }
    }

    suspend fun setFlagSecure(enabled: Boolean) {
        context.dataStore.edit { prefs ->
            prefs[KEY_FLAG_SECURE] = enabled
        }
    }

    suspend fun updateDataVersion(version: Int, date: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_DATA_VERSION] = version
            prefs[KEY_LAST_UPDATED] = date
        }
    }
}
