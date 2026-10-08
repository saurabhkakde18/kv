package com.vehiclefinancehub.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "datasets")
data class DatasetEntity(
    @PrimaryKey val datasetId: String,
    val title: String,
    val category: String,
    val version: Int,
    val lastUpdated: String,
    val description: String,
    val rawJson: String,
    val rowCount: Int
)
