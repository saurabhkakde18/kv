package com.vehiclefinancehub.app.ui.screens.favorites

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.vehiclefinancehub.app.data.local.FavoriteEntity
import com.vehiclefinancehub.app.ui.components.DetailBottomSheet
import com.vehiclefinancehub.app.ui.components.EmptyStateView
import com.vehiclefinancehub.app.ui.components.LuxuryBadge
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.components.LuxuryTabRow
import com.vehiclefinancehub.app.ui.components.LuxuryTopBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary

@Composable
fun FavoritesScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()
    val allDatasets by viewModel.allDatasets.collectAsState()

    var selectedDetailFav by remember { mutableStateOf<FavoriteEntity?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        LuxuryTopBar(
            title = "Starred Favorites",
            dataVersion = dataVersion,
            lastUpdated = lastUpdated,
            favoriteCount = favorites.size,
            onFavoritesClick = {
                viewModel.setSelectedTabIndex(11)
            },
            onSettingsClick = {
                navController.navigate(NavRoutes.Settings.route)
            }
        )

        // SEARCH BAR
        LuxurySearchBar(
            query = searchQuery,
            onQueryChange = { newQuery ->
                viewModel.onSearchQueryChanged(newQuery)
                if (newQuery.isNotBlank()) navController.navigate(NavRoutes.GlobalSearch.route)
            },
            onSearchSubmit = { submitted ->
                viewModel.addRecentSearch(submitted)
                navController.navigate(NavRoutes.GlobalSearch.route)
            }
        )

        // TAB ROW
        LuxuryTabRow(
            selectedTabIndex = selectedTabIndex,
            onTabSelected = { index, tab ->
                viewModel.setSelectedTabIndex(index)
                navController.navigate(tab.route)
            }
        )

        // FAVORITES LIST
        if (favorites.isEmpty()) {
            EmptyStateView(
                title = "No Favorites Saved",
                description = "Tap the star (★) icon on any car, CV model, policy rule, or payout row to pin it here for rapid access.",
                icon = Icons.Default.StarBorder
            )
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(favorites) { fav ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(MaterialTheme.colorScheme.surfaceVariant)
                            .border(0.6.dp, GoldPrimary.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                            .clickable { selectedDetailFav = fav }
                            .padding(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = fav.primaryTitle,
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    LuxuryBadge(text = fav.datasetTitle)
                                }

                                if (fav.secondaryText.isNotBlank()) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = fav.secondaryText,
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            fontSize = 11.5.sp
                                        ),
                                        maxLines = 2
                                    )
                                }
                            }

                            // Unstar Button
                            IconButton(
                                onClick = {
                                    viewModel.toggleFavorite(
                                        id = fav.id,
                                        datasetId = fav.datasetId,
                                        datasetTitle = fav.datasetTitle,
                                        primaryTitle = fav.primaryTitle,
                                        secondaryText = fav.secondaryText,
                                        rowJson = fav.rowJson
                                    )
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Star,
                                    contentDescription = "Remove Star",
                                    tint = GoldPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    selectedDetailFav?.let { fav ->
        val schema = allDatasets.find { it.datasetId == fav.datasetId }
        val columns = schema?.columns ?: emptyList()
        val rowMap: Map<String, Any?> = try {
            val mapType = object : TypeToken<Map<String, Any?>>() {}.type
            Gson().fromJson(fav.rowJson, mapType)
        } catch (e: Exception) {
            emptyMap()
        }

        DetailBottomSheet(
            title = "${fav.datasetTitle}: ${fav.primaryTitle}",
            columns = columns,
            rowMap = rowMap,
            isFavorite = true,
            onToggleFavorite = {
                viewModel.toggleFavorite(
                    id = fav.id,
                    datasetId = fav.datasetId,
                    datasetTitle = fav.datasetTitle,
                    primaryTitle = fav.primaryTitle,
                    secondaryText = fav.secondaryText,
                    rowJson = fav.rowJson
                )
                selectedDetailFav = null
            },
            onDismiss = { selectedDetailFav = null }
        )
    }
}
