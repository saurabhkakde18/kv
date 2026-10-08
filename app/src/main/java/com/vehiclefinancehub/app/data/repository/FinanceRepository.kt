package com.vehiclefinancehub.app.data.repository

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.vehiclefinancehub.app.data.local.AppDatabase
import com.vehiclefinancehub.app.data.local.DatasetEntity
import com.vehiclefinancehub.app.data.local.FavoriteEntity
import com.vehiclefinancehub.app.data.local.RecentSearchEntity
import com.vehiclefinancehub.app.data.local.SearchIndexEntity
import com.vehiclefinancehub.app.data.local.DataStoreManager
import com.vehiclefinancehub.app.data.model.DatasetSchema
import com.vehiclefinancehub.app.data.model.GroupedSearchResult
import com.vehiclefinancehub.app.data.model.SearchCategoryFilter
import com.vehiclefinancehub.app.data.model.SearchResultItem
import com.vehiclefinancehub.app.data.parser.DataParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.Locale

class FinanceRepository(
    private val context: Context,
    private val database: AppDatabase,
    private val dataStoreManager: DataStoreManager
) {
    private val gson = Gson()

    private val defaultAssetFiles = listOf(
        "data/approved_cars.json",
        "data/car_policy.json",
        "data/cv_grid.json",
        "data/cv_policy.json",
        "data/bolero_pickup_grid.json",
        "data/dsa_payout.json",
        "data/irr_matrix.json",
        "data/charges.json",
        "data/documents.json",
        "data/contacts.json",
        "data/schemes.json"
    )

    /**
     * Initializes database on app startup if empty, or forces reload from assets.
     */
    suspend fun initializeDatabaseIfNeeded(forceReset: Boolean = false) = withContext(Dispatchers.IO) {
        val count = database.datasetDao().getDatasetCount()
        if (count == 0 || forceReset) {
            if (forceReset) {
                database.datasetDao().clearAllDatasets()
                database.searchDao().clearSearchIndex()
            }
            loadDatasetsFromAssets()
        }
    }

    private suspend fun loadDatasetsFromAssets() {
        val datasetEntities = mutableListOf<DatasetEntity>()
        val searchItems = mutableListOf<SearchIndexEntity>()

        for (assetPath in defaultAssetFiles) {
            try {
                val jsonString = context.assets.open(assetPath).bufferedReader().use { it.readText() }
                val parseResult = DataParser.parseJson(jsonString)
                if (parseResult.isSuccess && parseResult.schema != null) {
                    val schema = parseResult.schema
                    val entity = DatasetEntity(
                        datasetId = schema.datasetId,
                        title = schema.title,
                        category = schema.category,
                        version = schema.version,
                        lastUpdated = schema.lastUpdated,
                        description = schema.description,
                        rawJson = jsonString,
                        rowCount = schema.rows.size
                    )
                    datasetEntities.add(entity)

                    // Index rows for search
                    searchItems.addAll(buildSearchItemsFromSchema(schema))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        database.datasetDao().insertAllDatasets(datasetEntities)
        database.searchDao().insertSearchIndexItems(searchItems)
    }

    fun getDatasetFlow(datasetId: String): Flow<DatasetSchema?> {
        return database.datasetDao().getDatasetByIdFlow(datasetId).map { entity ->
            entity?.let {
                gson.fromJson(it.rawJson, DatasetSchema::class.java)
            }
        }.flowOn(Dispatchers.IO)
    }

    fun getAllDatasetsFlow(): Flow<List<DatasetSchema>> {
        return database.datasetDao().getAllDatasetsFlow().map { list ->
            list.map { gson.fromJson(it.rawJson, DatasetSchema::class.java) }
        }.flowOn(Dispatchers.IO)
    }

    /**
     * Global Multi-Dataset Search Engine
     * Handles FTS4 matching, typo tolerance, multi-token splitting, and category filtering.
     */
    suspend fun search(query: String, categoryFilter: SearchCategoryFilter = SearchCategoryFilter.ALL): List<GroupedSearchResult> = withContext(Dispatchers.IO) {
        val cleanQuery = query.trim()
        if (cleanQuery.isBlank()) return@withContext emptyList()

        // Tokenize query (e.g. "bolero pik" -> ["bolero*", "pik*"])
        val tokens = cleanQuery.split("\\s+".toRegex()).filter { it.isNotBlank() }
        val ftsQuery = tokens.joinToString(" ") { "$it*" }

        val ftsResults = try {
            database.searchDao().searchWithFts(ftsQuery)
        } catch (e: Exception) {
            emptyList()
        }

        val likeResults = if (ftsResults.isEmpty()) {
            database.searchDao().searchWithLike(cleanQuery)
        } else {
            ftsResults
        }

        // Filter by category if selected
        val filtered = if (categoryFilter.datasetId != null) {
            likeResults.filter { it.datasetId == categoryFilter.datasetId }
        } else {
            likeResults
        }

        // Convert entities to SearchResultItem and group by Dataset/Category
        val grouped = filtered.groupBy { it.datasetId }
        val resultGroups = mutableListOf<GroupedSearchResult>()

        for ((datasetId, items) in grouped) {
            val first = items.first()
            val resultItems = items.map { entity ->
                val rowMap: Map<String, Any?> = try {
                    val mapType = object : TypeToken<Map<String, Any?>>() {}.type
                    gson.fromJson(entity.rowJson, mapType)
                } catch (e: Exception) {
                    emptyMap()
                }

                SearchResultItem(
                    id = entity.id,
                    datasetId = entity.datasetId,
                    datasetTitle = entity.datasetTitle,
                    category = entity.category,
                    primaryTitle = entity.primaryTitle,
                    secondaryText = entity.secondaryText,
                    badge = entity.badge,
                    fullDataJson = entity.rowJson,
                    matchSnippet = buildMatchSnippet(entity.searchableContent, cleanQuery),
                    rowMap = rowMap
                )
            }

            resultGroups.add(
                GroupedSearchResult(
                    category = first.category,
                    datasetId = datasetId,
                    datasetTitle = first.datasetTitle,
                    items = resultItems
                )
            )
        }

        return@withContext resultGroups
    }

    private fun buildMatchSnippet(content: String, query: String): String {
        val lowerContent = content.lowercase(Locale.ROOT)
        val lowerQuery = query.lowercase(Locale.ROOT)
        val index = lowerContent.indexOf(lowerQuery)
        return if (index >= 0) {
            val start = (index - 25).coerceAtLeast(0)
            val end = (index + query.length + 35).coerceAtMost(content.length)
            (if (start > 0) "…" else "") + content.substring(start, end).trim() + (if (end < content.length) "…" else "")
        } else {
            content.take(80)
        }
    }

    /**
     * Imports a new/updated DatasetSchema, persists to Room, and updates Search Index.
     */
    suspend fun importDataset(schema: DatasetSchema): Boolean = withContext(Dispatchers.IO) {
        try {
            val jsonString = gson.toJson(schema)
            val entity = DatasetEntity(
                datasetId = schema.datasetId,
                title = schema.title,
                category = schema.category,
                version = schema.version,
                lastUpdated = schema.lastUpdated,
                description = schema.description,
                rawJson = jsonString,
                rowCount = schema.rows.size
            )

            // Save dataset
            database.datasetDao().insertOrUpdateDataset(entity)

            // Refresh search index for this dataset
            database.searchDao().deleteSearchItemsByDataset(schema.datasetId)
            val searchItems = buildSearchItemsFromSchema(schema)
            database.searchDao().insertSearchIndexItems(searchItems)

            // Update settings
            dataStoreManager.updateDataVersion(schema.version, schema.lastUpdated)
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun buildSearchItemsFromSchema(schema: DatasetSchema): List<SearchIndexEntity> {
        val items = mutableListOf<SearchIndexEntity>()

        // Index Data Rows
        schema.rows.forEachIndexed { index, row ->
            val primaryKeys = schema.columns.filter { it.isPrimary }.map { it.key }
            val primaryTitle = if (primaryKeys.isNotEmpty()) {
                primaryKeys.mapNotNull { row[it]?.toString() }.joinToString(" • ")
            } else {
                row.values.firstOrNull()?.toString() ?: "Row #${index + 1}"
            }

            val otherColumns = schema.columns.filter { !it.isPrimary }
            val secondaryText = otherColumns.take(3).mapNotNull { col ->
                val v = row[col.key]
                if (v != null) "${col.label}: $v" else null
            }.joinToString(" | ")

            val badgeCol = schema.columns.firstOrNull { it.type == "badge" || it.type == "status" }
            val badge = badgeCol?.let { row[it.key]?.toString() }

            val allValues = row.entries.joinToString(" ") { "${it.key} ${it.value}" }
            val searchableText = "${schema.title} ${schema.category} $primaryTitle $secondaryText $allValues"

            items.add(
                SearchIndexEntity(
                    id = "${schema.datasetId}_row_$index",
                    datasetId = schema.datasetId,
                    datasetTitle = schema.title,
                    category = schema.category,
                    primaryTitle = primaryTitle,
                    secondaryText = secondaryText,
                    badge = badge,
                    searchableContent = searchableText,
                    rowJson = gson.toJson(row)
                )
            )
        }

        // Index Policy Sections (if any)
        schema.sections?.forEachIndexed { sIndex, section ->
            val content = "${section.title} ${section.summary} ${section.items.joinToString(" ")}"
            items.add(
                SearchIndexEntity(
                    id = "${schema.datasetId}_sec_$sIndex",
                    datasetId = schema.datasetId,
                    datasetTitle = schema.title,
                    category = schema.category,
                    primaryTitle = section.title,
                    secondaryText = section.summary.ifBlank { section.items.firstOrNull() ?: "" },
                    badge = "Policy Rule",
                    searchableContent = "${schema.title} Policy Section $content",
                    rowJson = gson.toJson(section)
                )
            )
        }

        return items
    }

    // Favorite Management
    fun getFavoritesFlow(): Flow<List<FavoriteEntity>> = database.favoriteDao().getAllFavoritesFlow()
    fun getFavoriteIdsFlow(): Flow<List<String>> = database.favoriteDao().getAllFavoriteIdsFlow()

    suspend fun toggleFavorite(
        id: String,
        datasetId: String,
        datasetTitle: String,
        primaryTitle: String,
        secondaryText: String,
        rowJson: String
    ) = withContext(Dispatchers.IO) {
        val isFav = database.favoriteDao().isFavorite(id)
        if (isFav) {
            database.favoriteDao().deleteFavoriteById(id)
        } else {
            database.favoriteDao().insertFavorite(
                FavoriteEntity(
                    id = id,
                    datasetId = datasetId,
                    datasetTitle = datasetTitle,
                    primaryTitle = primaryTitle,
                    secondaryText = secondaryText,
                    rowJson = rowJson
                )
            )
        }
    }

    // Recent Searches
    fun getRecentSearchesFlow(): Flow<List<RecentSearchEntity>> = database.recentSearchDao().getRecentSearchesFlow()

    suspend fun addRecentSearch(query: String) = withContext(Dispatchers.IO) {
        if (query.isNotBlank()) {
            database.recentSearchDao().insertRecentSearch(RecentSearchEntity(query.trim()))
        }
    }

    suspend fun deleteRecentSearch(query: String) = withContext(Dispatchers.IO) {
        database.recentSearchDao().deleteRecentSearch(query)
    }

    suspend fun clearRecentSearches() = withContext(Dispatchers.IO) {
        database.recentSearchDao().clearRecentSearches()
    }
}
