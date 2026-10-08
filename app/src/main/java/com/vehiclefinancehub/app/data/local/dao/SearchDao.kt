package com.vehiclefinancehub.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import com.vehiclefinancehub.app.data.local.SearchIndexEntity

@Dao
interface SearchDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSearchIndexItems(items: List<SearchIndexEntity>)

    @Query("DELETE FROM search_index WHERE datasetId = :datasetId")
    suspend fun deleteSearchItemsByDataset(datasetId: String)

    @Query("DELETE FROM search_index")
    suspend fun clearSearchIndex()

    /**
     * FTS MATCH query - fast full text search across searchableContent
     */
    @Query("""
        SELECT search_index.* 
        FROM search_index 
        JOIN search_fts ON search_index.id = search_fts.id 
        WHERE search_fts MATCH :matchQuery
        ORDER BY search_index.category, search_index.primaryTitle
        LIMIT 100
    """)
    suspend fun searchWithFts(matchQuery: String): List<SearchIndexEntity>

    /**
     * Fallback partial/LIKE search when FTS prefix tokens need broad matching
     */
    @Query("""
        SELECT * FROM search_index 
        WHERE searchableContent LIKE '%' || :query || '%' 
           OR primaryTitle LIKE '%' || :query || '%'
           OR secondaryText LIKE '%' || :query || '%'
        ORDER BY category, primaryTitle
        LIMIT 100
    """)
    suspend fun searchWithLike(query: String): List<SearchIndexEntity>

    @Query("SELECT * FROM search_index WHERE datasetId = :datasetId")
    suspend fun getSearchItemsByDataset(datasetId: String): List<SearchIndexEntity>
}
