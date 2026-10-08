package com.vehiclefinancehub.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.vehiclefinancehub.app.data.local.dao.DatasetDao
import com.vehiclefinancehub.app.data.local.dao.FavoriteDao
import com.vehiclefinancehub.app.data.local.dao.RecentSearchDao
import com.vehiclefinancehub.app.data.local.dao.SearchDao

@Database(
    entities = [
        DatasetEntity::class,
        SearchIndexEntity::class,
        SearchFtsEntity::class,
        FavoriteEntity::class,
        RecentSearchEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun datasetDao(): DatasetDao
    abstract fun searchDao(): SearchDao
    abstract fun favoriteDao(): FavoriteDao
    abstract fun recentSearchDao(): RecentSearchDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "vehicle_finance_hub.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
