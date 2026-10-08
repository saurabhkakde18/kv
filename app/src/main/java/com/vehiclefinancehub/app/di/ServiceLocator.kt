package com.vehiclefinancehub.app.di

import android.content.Context
import com.vehiclefinancehub.app.data.local.AppDatabase
import com.vehiclefinancehub.app.data.local.DataStoreManager
import com.vehiclefinancehub.app.data.repository.FinanceRepository

object ServiceLocator {

    @Volatile
    private var repository: FinanceRepository? = null

    @Volatile
    private var dataStoreManager: DataStoreManager? = null

    fun provideRepository(context: Context): FinanceRepository {
        return repository ?: synchronized(this) {
            val db = AppDatabase.getInstance(context)
            val dsm = provideDataStoreManager(context)
            val repo = FinanceRepository(context.applicationContext, db, dsm)
            repository = repo
            repo
        }
    }

    fun provideDataStoreManager(context: Context): DataStoreManager {
        return dataStoreManager ?: synchronized(this) {
            val dsm = DataStoreManager(context.applicationContext)
            dataStoreManager = dsm
            dsm
        }
    }
}
