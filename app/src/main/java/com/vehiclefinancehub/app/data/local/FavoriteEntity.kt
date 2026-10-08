package com.vehiclefinancehub.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val id: String, // format: "datasetId_rowIdentifier"
    val datasetId: String,
    val datasetTitle: String,
    val primaryTitle: String,
    val secondaryText: String,
    val rowJson: String,
    val timestamp: Long = System.currentTimeMillis()
)
