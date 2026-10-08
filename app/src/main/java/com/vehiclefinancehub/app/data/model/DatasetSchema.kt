package com.vehiclefinancehub.app.data.model

import com.google.gson.annotations.SerializedName

/**
 * Generic, data-driven schema supporting any dataset.
 * Allows columns, filters, rows, and policy sections to change without altering UI code.
 */
data class DatasetSchema(
    @SerializedName("datasetId") val datasetId: String,
    @SerializedName("title") val title: String,
    @SerializedName("category") val category: String,
    @SerializedName("version") val version: Int = 1,
    @SerializedName("lastUpdated") val lastUpdated: String = "",
    @SerializedName("description") val description: String = "",
    @SerializedName("columns") val columns: List<DataColumn> = emptyList(),
    @SerializedName("rows") val rows: List<Map<String, Any?>> = emptyList(),
    @SerializedName("sections") val sections: List<PolicySection>? = null
)

data class DataColumn(
    @SerializedName("key") val key: String,
    @SerializedName("label") val label: String,
    @SerializedName("type") val type: String = "text", // text, number, currency, badge, status, percentage, date, phone, email
    @SerializedName("isPrimary") val isPrimary: Boolean = false,
    @SerializedName("isSortable") val isSortable: Boolean = true,
    @SerializedName("isFilterable") val isFilterable: Boolean = false,
    @SerializedName("widthDp") val widthDp: Int = 120
)

data class PolicySection(
    @SerializedName("title") val title: String,
    @SerializedName("summary") val summary: String = "",
    @SerializedName("items") val items: List<String> = emptyList()
)

data class FilterOption(
    val columnKey: String,
    val columnLabel: String,
    val selectedValue: String? = null,
    val availableValues: List<String> = emptyList()
)

enum class SortDirection {
    ASC, DESC, NONE
}

data class ActiveSort(
    val columnKey: String,
    val direction: SortDirection
)
