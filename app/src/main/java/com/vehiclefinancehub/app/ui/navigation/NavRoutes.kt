package com.vehiclefinancehub.app.ui.navigation

sealed class NavRoutes(val route: String) {
    object Home : NavRoutes("home")
    object GlobalSearch : NavRoutes("global_search")
    object Dataset : NavRoutes("dataset/{datasetId}?highlight={highlight}") {
        fun createRoute(datasetId: String, highlight: String? = null): String {
            return if (highlight != null) "dataset/$datasetId?highlight=$highlight" else "dataset/$datasetId"
        }
    }
    object Payout : NavRoutes("payout")
    object Irr : NavRoutes("irr")
    object Emi : NavRoutes("emi?amount={amount}&rate={rate}&tenure={tenure}") {
        fun createRoute(amount: Double? = null, rate: Double? = null, tenure: Int? = null): String {
            val params = mutableListOf<String>()
            if (amount != null) params.add("amount=$amount")
            if (rate != null) params.add("rate=$rate")
            if (tenure != null) params.add("tenure=$tenure")
            return if (params.isNotEmpty()) "emi?${params.joinToString("&")}" else "emi"
        }
    }
    object Documents : NavRoutes("documents")
    object Schemes : NavRoutes("schemes")
    object Contacts : NavRoutes("contacts")
    object Favorites : NavRoutes("favorites")
    object Settings : NavRoutes("settings")
    object ImportData : NavRoutes("import_data")
    object AppLock : NavRoutes("app_lock")
}
