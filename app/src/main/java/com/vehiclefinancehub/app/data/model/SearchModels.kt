package com.vehiclefinancehub.app.data.model

data class SearchResultItem(
    val id: String,
    val datasetId: String,
    val datasetTitle: String,
    val category: String,
    val primaryTitle: String,
    val secondaryText: String,
    val badge: String? = null,
    val fullDataJson: String,
    val matchSnippet: String,
    val rowMap: Map<String, Any?> = emptyMap()
)

data class GroupedSearchResult(
    val category: String,
    val datasetId: String,
    val datasetTitle: String,
    val items: List<SearchResultItem>
)

enum class SearchCategoryFilter(val label: String, val datasetId: String?) {
    ALL("All Results", null),
    CARS("Approved Cars", "approved_cars"),
    CAR_POLICY("Car Policy", "car_policy"),
    CV_GRID("CV Grid", "cv_grid"),
    CV_POLICY("CV Policy", "cv_policy"),
    BOLERO("Bolero Pik-Up", "bolero_pickup_grid"),
    PAYOUT("DSA Payout", "dsa_payout"),
    IRR("IRR Matrix", "irr_matrix"),
    DOCS("Documents", "documents"),
    SCHEMES("Schemes", "schemes"),
    CONTACTS("Contacts", "contacts")
}
