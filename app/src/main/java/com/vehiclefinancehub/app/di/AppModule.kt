package com.vehiclefinancehub.app.di

import android.content.Context
import com.vehiclefinancehub.app.data.local.AppDatabase
import com.vehiclefinancehub.app.data.local.DataStoreManager
import com.vehiclefinancehub.app.data.repository.FinanceRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return AppDatabase.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideDataStoreManager(@ApplicationContext context: Context): DataStoreManager {
        return DataStoreManager(context)
    }

    @Provides
    @Singleton
    fun provideFinanceRepository(
        @ApplicationContext context: Context,
        database: AppDatabase,
        dataStoreManager: DataStoreManager
    ): FinanceRepository {
        return FinanceRepository(context, database, dataStoreManager)
    }
}
