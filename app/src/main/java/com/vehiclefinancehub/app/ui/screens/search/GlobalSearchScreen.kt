package com.vehiclefinancehub.app.ui.screens.search

import androidx.compose.animation.AnimatedVisibility
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.SearchOff
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.data.model.GroupedSearchResult
import com.vehiclefinancehub.app.data.model.SearchCategoryFilter
import com.vehiclefinancehub.app.data.model.SearchResultItem
import com.vehiclefinancehub.app.ui.components.DetailBottomSheet
import com.vehiclefinancehub.app.ui.components.EmptyStateView
import com.vehiclefinancehub.app.ui.components.LuxuryBadge
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import java.util.Locale

@Composable
fun GlobalSearchScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val searchFilter by viewModel.searchFilter.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val isSearching by viewModel.isSearching.collectAsState()
    val recentSearches by viewModel.recentSearches.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()
    val allDatasets by viewModel.allDatasets.collectAsState()

    var selectedDetailItem by remember { mutableStateOf<SearchResultItem?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP SEARCH BAR WITH BACK BUTTON
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp, start = 8.dp, end = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { navController.popBackStack() },
                modifier = Modifier.size(38.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = GoldPrimary
                )
            }

            LuxurySearchBar(
                query = searchQuery,
                onQueryChange = { newQuery ->
                    viewModel.onSearchQueryChanged(newQuery)
                },
                onSearchSubmit = { submitted ->
                    viewModel.addRecentSearch(submitted)
                },
                modifier = Modifier.weight(1f)
            )
        }

        // CATEGORY FILTER CHIPS UNDER SEARCH BAR
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(SearchCategoryFilter.values()) { filter ->
                val isSelected = filter == searchFilter

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isSelected) GoldContainer else MaterialTheme.colorScheme.surfaceVariant)
                        .border(
                            1.dp,
                            if (isSelected) GoldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                            RoundedCornerShape(14.dp)
                        )
                        .clickable {
                            viewModel.onSearchFilterChanged(filter)
                        }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = filter.label,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = if (isSelected) GoldLight else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 11.5.sp
                        )
                    )
                }
            }
        }

        Divider(
            color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
            modifier = Modifier.padding(vertical = 4.dp)
        )

        // CONTENT AREA
        when {
            isSearching -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        CircularProgressIndicator(color = GoldPrimary)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(
                            text = "Searching across all grids & policies…",
                            style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant)
                        )
                    }
                }
            }

            searchQuery.isBlank() -> {
                // SHOW RECENT SEARCHES OR QUICK GUIDES
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    if (recentSearches.isNotEmpty()) {
                        item {
                            Text(
                                text = "Recent Searches",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }

                        items(recentSearches) { recent ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(MaterialTheme.colorScheme.surfaceVariant)
                                    .clickable {
                                        viewModel.onSearchQueryChanged(recent.query)
                                    }
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.History,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = recent.query,
                                    style = MaterialTheme.typography.bodyMedium.copy(
                                        color = MaterialTheme.colorScheme.onSurface
                                    ),
                                    modifier = Modifier.weight(1f)
                                )
                                Icon(
                                    imageVector = Icons.Default.ArrowForward,
                                    contentDescription = null,
                                    tint = GoldPrimary,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    } else {
                        item {
                            EmptyStateView(
                                title = "Unified Global Search",
                                description = "Type any car name (e.g. 'Swift', 'Innova'), CV model ('Tata 407', 'Ace'), Bolero variant, policy rule, or slab to search across all databases.",
                                icon = Icons.Default.Search
                            )
                        }
                    }
                }
            }

            searchResults.isEmpty() -> {
                EmptyStateView(
                    title = "No Matches Found",
                    description = "We couldn't find any results for \"$searchQuery\". Try checking the spelling or using broader search terms.",
                    icon = Icons.Default.SearchOff
                )
            }

            else -> {
                // GROUPED SEARCH RESULTS
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    searchResults.forEach { group ->
                        // SECTION HEADER WITH RESULT COUNT
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${group.datasetTitle} (${group.items.size})",
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = GoldLight
                                    )
                                )

                                Text(
                                    text = "View Full Grid →",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = SapphireGlow,
                                        fontWeight = FontWeight.SemiBold
                                    ),
                                    modifier = Modifier
                                        .clickable {
                                            viewModel.addRecentSearch(searchQuery)
                                            navigateToModule(navController, group.datasetId, searchQuery)
                                        }
                                        .padding(4.dp)
                                )
                            }
                        }

                        // RESULT ITEMS
                        items(group.items) { item ->
                            SearchResultCard(
                                item = item,
                                query = searchQuery,
                                onClick = {
                                    viewModel.addRecentSearch(searchQuery)
                                    selectedDetailItem = item
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    // DETAIL BOTTOM SHEET ON TAP
    selectedDetailItem?.let { item ->
        val schema = allDatasets.find { it.datasetId == item.datasetId }
        val columns = schema?.columns ?: emptyList()

        DetailBottomSheet(
            title = "${item.datasetTitle}: ${item.primaryTitle}",
            columns = columns,
            rowMap = item.rowMap,
            isFavorite = favoriteIds.contains(item.id),
            onToggleFavorite = {
                viewModel.toggleFavorite(
                    id = item.id,
                    datasetId = item.datasetId,
                    datasetTitle = item.datasetTitle,
                    primaryTitle = item.primaryTitle,
                    secondaryText = item.secondaryText,
                    rowJson = item.fullDataJson
                )
            },
            onDismiss = { selectedDetailItem = null }
        )
    }
}

@Composable
fun SearchResultCard(
    item: SearchResultItem,
    query: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(0.6.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
            .clickable { onClick() }
            .padding(12.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.primaryTitle,
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    ),
                    modifier = Modifier.weight(1f)
                )

                item.badge?.let {
                    LuxuryBadge(text = it)
                }
            }

            if (item.secondaryText.isNotBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.secondaryText,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 12.sp
                    ),
                    maxLines = 2
                )
            }

            if (item.matchSnippet.isNotBlank()) {
                Spacer(modifier = Modifier.height(6.dp))
                HighlightMatchText(
                    snippet = item.matchSnippet,
                    query = query
                )
            }
        }
    }
}

@Composable
fun HighlightMatchText(snippet: String, query: String) {
    val annotatedString = buildAnnotatedString {
        val lowerSnippet = snippet.lowercase(Locale.ROOT)
        val lowerQuery = query.trim().lowercase(Locale.ROOT)

        var currentIndex = 0
        while (currentIndex < snippet.length) {
            val matchIndex = lowerSnippet.indexOf(lowerQuery, currentIndex)
            if (matchIndex == -1 || lowerQuery.isBlank()) {
                append(snippet.substring(currentIndex))
                break
            } else {
                append(snippet.substring(currentIndex, matchIndex))
                withStyle(
                    style = SpanStyle(
                        color = GoldPrimary,
                        fontWeight = FontWeight.Bold,
                        background = GoldContainer
                    )
                ) {
                    append(snippet.substring(matchIndex, matchIndex + lowerQuery.length))
                }
                currentIndex = matchIndex + lowerQuery.length
            }
        }
    }

    Text(
        text = annotatedString,
        style = MaterialTheme.typography.bodySmall.copy(
            fontSize = 11.5.sp,
            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
        ),
        maxLines = 2
    )
}

private fun navigateToModule(navController: NavController, datasetId: String, query: String) {
    when (datasetId) {
        "dsa_payout" -> navController.navigate(NavRoutes.Payout.route)
        "irr_matrix" -> navController.navigate(NavRoutes.Irr.route)
        "documents" -> navController.navigate(NavRoutes.Documents.route)
        "schemes" -> navController.navigate(NavRoutes.Schemes.route)
        "contacts" -> navController.navigate(NavRoutes.Contacts.route)
        else -> navController.navigate(NavRoutes.Dataset.createRoute(datasetId, query))
    }
}
