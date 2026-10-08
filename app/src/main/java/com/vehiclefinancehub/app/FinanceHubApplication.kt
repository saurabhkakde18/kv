package com.vehiclefinancehub.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class FinanceHubApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        // Application initialized
    }
}
