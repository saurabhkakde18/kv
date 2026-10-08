package com.vehiclefinancehub.app.ui.screens.generic

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.data.model.DatasetSchema
import com.vehiclefinancehub.app.data.model.PolicySection
import com.vehiclefinancehub.app.ui.components.DynamicTableView
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.components.LuxuryTabRow
import com.vehiclefinancehub.app.ui.components.LuxuryTopBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary

@Composable
fun DynamicDatasetScreen(
    datasetId: String,
    highlightQuery: String? = null,
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val allDatasets by viewModel.allDatasets.collectAsState()
    val schema = allDatasets.find { it.datasetId == datasetId }

    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    var viewModeTab by remember { mutableStateOf(0) } // 0: Table Grid, 1: Policy Guidelines (if sections present)
    val hasSections = schema?.sections != null && schema.sections.isNotEmpty()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        LuxuryTopBar(
            title = schema?.title ?: "Dataset Grid",
            dataVersion = dataVersion,
            lastUpdated = schema?.lastUpdated ?: lastUpdated,
            favoriteCount = favorites.size,
            onFavoritesClick = {
                viewModel.setSelectedTabIndex(11)
                navController.navigate(NavRoutes.Favorites.route)
            },
            onSettingsClick = {
                navController.navigate(NavRoutes.Settings.route)
            }
        )

        // GLOBAL SEARCH BAR
        LuxurySearchBar(
            query = searchQuery,
            onQueryChange = { newQuery ->
                viewModel.onSearchQueryChanged(newQuery)
                if (newQuery.isNotBlank()) {
                    navController.navigate(NavRoutes.GlobalSearch.route)
                }
            },
            onSearchSubmit = { submitted ->
                viewModel.addRecentSearch(submitted)
                navController.navigate(NavRoutes.GlobalSearch.route)
            }
        )

        // PERSISTENT LUXURY TAB ROW
        LuxuryTabRow(
            selectedTabIndex = selectedTabIndex,
            onTabSelected = { index, tab ->
                viewModel.setSelectedTabIndex(index)
                navController.navigate(tab.route)
            }
        )

        // If dataset has both Table Rows and Policy Guidelines Sections, offer Tab Switcher
        if (hasSections) {
            TabRow(
                selectedTabIndex = viewModeTab,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = GoldPrimary,
                indicator = { tabPositions ->
                    TabRowDefaults.Indicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[viewModeTab]),
                        color = GoldPrimary,
                        height = 3.dp
                    )
                }
            ) {
                Tab(
                    selected = viewModeTab == 0,
                    onClick = { viewModeTab = 0 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.TableChart, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Norms Grid (${schema?.rows?.size ?: 0})", fontWeight = FontWeight.SemiBold, fontSize = 12.5.sp)
                        }
                    }
                )
                Tab(
                    selected = viewModeTab == 1,
                    onClick = { viewModeTab = 1 },
                    text = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.ViewAgenda, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Policy Guidelines (${schema?.sections?.size ?: 0})", fontWeight = FontWeight.SemiBold, fontSize = 12.5.sp)
                        }
                    }
                )
            }
        }

        // CONTENT
        if (hasSections && viewModeTab == 1) {
            ExpandablePolicySectionView(sections = schema?.sections ?: emptyList())
        } else {
            DynamicTableView(
                schema = schema,
                isLoading = schema == null,
                highlightRowQuery = highlightQuery,
                favoriteIds = favoriteIds.toSet(),
                onToggleFavorite = { rowId, rowMap ->
                    val primaryTitle = schema?.columns?.find { it.isPrimary }?.let { rowMap[it.key]?.toString() }
                        ?: rowMap.values.firstOrNull()?.toString() ?: "Row"
                    val secondaryText = schema?.columns?.filter { !it.isPrimary }?.take(2)?.mapNotNull {
                        val v = rowMap[it.key]
                        if (v != null) "${it.label}: $v" else null
                    }?.joinToString(" | ") ?: ""

                    viewModel.toggleFavorite(
                        id = rowId,
                        datasetId = schema?.datasetId ?: datasetId,
                        datasetTitle = schema?.title ?: "Dataset",
                        primaryTitle = primaryTitle,
                        secondaryText = secondaryText,
                        rowJson = com.google.gson.Gson().toJson(rowMap)
                    )
                }
            )
        }
    }
}

@Composable
fun ExpandablePolicySectionView(
    sections: List<PolicySection>,
    modifier: Modifier = Modifier
) {
    val expandedStates = remember { mutableStateMapOf<Int, Boolean>() }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(sections.indices.toList()) { index ->
            val section = sections[index]
            val isExpanded = expandedStates[index] ?: true

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, GoldPrimary.copy(alpha = 0.3f), RoundedCornerShape(14.dp))
                    .clickable {
                        expandedStates[index] = !isExpanded
                    }
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = section.title,
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = GoldLight
                            ),
                            modifier = Modifier.weight(1f)
                        )

                        Icon(
                            imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                            contentDescription = null,
                            tint = GoldPrimary
                        )
                    }

                    if (section.summary.isNotBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = section.summary,
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        )
                    }

                    AnimatedVisibility(visible = isExpanded) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 10.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.4f))
                            Spacer(modifier = Modifier.height(4.dp))

                            section.items.forEach { itemText ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Text(
                                        text = "• ",
                                        color = GoldPrimary,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        text = itemText,
                                        style = MaterialTheme.typography.bodyMedium.copy(
                                            color = MaterialTheme.colorScheme.onSurface,
                                            fontSize = 13.sp
                                        )
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
