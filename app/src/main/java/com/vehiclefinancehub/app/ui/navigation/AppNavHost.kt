package com.vehiclefinancehub.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.vehiclefinancehub.app.ui.screens.auth.AppLockScreen
import com.vehiclefinancehub.app.ui.screens.contacts.ContactsScreen
import com.vehiclefinancehub.app.ui.screens.documents.DocumentsScreen
import com.vehiclefinancehub.app.ui.screens.emi.EmiCalculatorScreen
import com.vehiclefinancehub.app.ui.screens.favorites.FavoritesScreen
import com.vehiclefinancehub.app.ui.screens.generic.DynamicDatasetScreen
import com.vehiclefinancehub.app.ui.screens.home.HomeScreen
import com.vehiclefinancehub.app.ui.screens.irr.IrrMatrixScreen
import com.vehiclefinancehub.app.ui.screens.payout.PayoutScreen
import com.vehiclefinancehub.app.ui.screens.schemes.SchemesScreen
import com.vehiclefinancehub.app.ui.screens.search.GlobalSearchScreen
import com.vehiclefinancehub.app.ui.screens.settings.ImportDataScreen
import com.vehiclefinancehub.app.ui.screens.settings.SettingsScreen
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel

@Composable
fun AppNavHost(
    viewModel: FinanceViewModel,
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    val isAppLockEnabled by viewModel.isAppLockEnabled.collectAsState()
    val isAppUnlocked by viewModel.isAppUnlocked.collectAsState()

    val startDestination = if (isAppLockEnabled && !isAppUnlocked) {
        NavRoutes.AppLock.route
    } else {
        NavRoutes.Home.route
    }

    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(NavRoutes.AppLock.route) {
            AppLockScreen(
                viewModel = viewModel,
                onUnlocked = {
                    navController.navigate(NavRoutes.Home.route) {
                        popUpTo(NavRoutes.AppLock.route) { inclusive = true }
                    }
                }
            )
        }

        composable(NavRoutes.Home.route) {
            HomeScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.GlobalSearch.route) {
            GlobalSearchScreen(viewModel = viewModel, navController = navController)
        }

        composable(
            route = "dataset/{datasetId}?highlight={highlight}",
            arguments = listOf(
                navArgument("datasetId") { type = NavType.StringType },
                navArgument("highlight") {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) { backStackEntry ->
            val datasetId = backStackEntry.arguments?.getString("datasetId") ?: "approved_cars"
            val highlight = backStackEntry.arguments?.getString("highlight")
            DynamicDatasetScreen(
                datasetId = datasetId,
                highlightQuery = highlight,
                viewModel = viewModel,
                navController = navController
            )
        }

        composable(NavRoutes.Payout.route) {
            PayoutScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Irr.route) {
            IrrMatrixScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Emi.route) {
            EmiCalculatorScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Documents.route) {
            DocumentsScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Schemes.route) {
            SchemesScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Contacts.route) {
            ContactsScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Favorites.route) {
            FavoritesScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.Settings.route) {
            SettingsScreen(viewModel = viewModel, navController = navController)
        }

        composable(NavRoutes.ImportData.route) {
            ImportDataScreen(viewModel = viewModel, navController = navController)
        }
    }
}
