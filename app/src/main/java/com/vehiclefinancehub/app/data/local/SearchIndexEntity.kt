package com.vehiclefinancehub.app.data.local

import androidx.room.Entity
import androidx.room.Fts4
import androidx.room.PrimaryKey

@Entity(tableName = "search_index")
data class SearchIndexEntity(
    @PrimaryKey val id: String, // format: "datasetId_rowIndex" or unique key
    val datasetId: String,
    val datasetTitle: String,
    val category: String,
    val primaryTitle: String,
    val secondaryText: String,
    val badge: String? = null,
    val searchableContent: String, // Flattened text of all row keys/values for FTS
    val rowJson: String
)

@Fts4(contentEntity = SearchIndexEntity::class)
@Entity(tableName = "search_fts")
data class SearchFtsEntity(
    val id: String,
    val datasetId: String,
    val datasetTitle: String,
    val category: String,
    val primaryTitle: String,
    val secondaryText: String,
    val badge: String?,
    val searchableContent: String,
    val rowJson: String
)
