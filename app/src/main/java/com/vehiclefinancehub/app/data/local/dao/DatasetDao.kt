package com.vehiclefinancehub.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.vehiclefinancehub.app.data.local.DatasetEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DatasetDao {

    @Query("SELECT * FROM datasets")
    fun getAllDatasetsFlow(): Flow<List<DatasetEntity>>

    @Query("SELECT * FROM datasets WHERE datasetId = :datasetId LIMIT 1")
    fun getDatasetByIdFlow(datasetId: String): Flow<DatasetEntity?>

    @Query("SELECT * FROM datasets WHERE datasetId = :datasetId LIMIT 1")
    suspend fun getDatasetById(datasetId: String): DatasetEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateDataset(dataset: DatasetEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllDatasets(datasets: List<DatasetEntity>)

    @Query("DELETE FROM datasets WHERE datasetId = :datasetId")
    suspend fun deleteDataset(datasetId: String)

    @Query("DELETE FROM datasets")
    suspend fun clearAllDatasets()

    @Query("SELECT COUNT(*) FROM datasets")
    suspend fun getDatasetCount(): Int
}
