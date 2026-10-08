package com.vehiclefinancehub.app.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.ui.components.LuxuryBadge
import com.vehiclefinancehub.app.ui.components.LuxuryCard
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.components.LuxuryTabRow
import com.vehiclefinancehub.app.ui.components.LuxuryTopBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.SapphireGlow

data class QuickActionCard(
    val title: String,
    val subtitle: String,
    val countBadge: String,
    val icon: ImageVector,
    val route: String,
    val tabIndex: Int,
    val gradientColors: List<Color>
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HomeScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val recentSearches by viewModel.recentSearches.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()
    val datasets by viewModel.allDatasets.collectAsState()

    val quickCards = listOf(
        QuickActionCard(
            title = "Approved Cars",
            subtitle = "54+ OEM Models & Limits",
            countBadge = "54 Models",
            icon = Icons.Default.VerifiedUser,
            route = "dataset/approved_cars",
            tabIndex = 1,
            gradientColors = listOf(Color(0xFF1E3A8A), Color(0xFF172554))
        ),
        QuickActionCard(
            title = "Bolero Pik-Up Grid",
            subtitle = "Maxx City, HD & ExtraLong",
            countBadge = "13 Variants",
            icon = Icons.Default.DirectionsCar,
            route = "dataset/bolero_pickup_grid",
            tabIndex = 4,
            gradientColors = listOf(Color(0xFF78350F), Color(0xFF451A03))
        ),
        QuickActionCard(
            title = "CV Master Grid",
            subtitle = "SCV, LCV, MHCV & Bus",
            countBadge = "16 Grids",
            icon = Icons.Default.LocalShipping,
            route = "dataset/cv_grid",
            tabIndex = 2,
            gradientColors = listOf(Color(0xFF064E3B), Color(0xFF022C22))
        ),
        QuickActionCard(
            title = "Car Policy Norms",
            subtitle = "LTV, FOIR & Eligibility",
            countBadge = "13 Rules",
            icon = Icons.Default.Policy,
            route = "dataset/car_policy",
            tabIndex = 0,
            gradientColors = listOf(Color(0xFF581C87), Color(0xFF3B0764))
        ),
        QuickActionCard(
            title = "DSA Payout Calculator",
            subtitle = "Slabs & Commission Calculator",
            countBadge = "Calculator",
            icon = Icons.Default.MonetizationOn,
            route = NavRoutes.Payout.route,
            tabIndex = 5,
            gradientColors = listOf(Color(0xFF831843), Color(0xFF500724))
        ),
        QuickActionCard(
            title = "IRR & Rate Matrix",
            subtitle = "CIBIL Tier Matrix & Rates",
            countBadge = "Rates Grid",
            icon = Icons.Default.TableChart,
            route = NavRoutes.Irr.route,
            tabIndex = 6,
            gradientColors = listOf(Color(0xFF1E293B), Color(0xFF0F172A))
        ),
        QuickActionCard(
            title = "EMI Calculator",
            subtitle = "Amortization & Quote Share",
            countBadge = "Interactive",
            icon = Icons.Default.Calculate,
            route = NavRoutes.Emi.route,
            tabIndex = 7,
            gradientColors = listOf(Color(0xFF14532D), Color(0xFF052E16))
        ),
        QuickActionCard(
            title = "Documents Checklist",
            subtitle = "KYC & Income Proofs by Profile",
            countBadge = "15 Items",
            icon = Icons.Default.Folder,
            route = NavRoutes.Documents.route,
            tabIndex = 8,
            gradientColors = listOf(Color(0xFF312E81), Color(0xFF1E1B4B))
        ),
        QuickActionCard(
            title = "Promotions & Schemes",
            subtitle = "Festive Subventions & Offers",
            countBadge = "Active",
            icon = Icons.Default.LocalOffer,
            route = NavRoutes.Schemes.route,
            tabIndex = 9,
            gradientColors = listOf(Color(0xFF713F12), Color(0xFF422006))
        ),
        QuickActionCard(
            title = "Directory & Contacts",
            subtitle = "Direct Dial, WhatsApp & Email",
            countBadge = "Direct Dial",
            icon = Icons.Default.Call,
            route = NavRoutes.Contacts.route,
            tabIndex = 10,
            gradientColors = listOf(Color(0xFF134E4A), Color(0xFF042F2E))
        )
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        item {
            LuxuryTopBar(
                dataVersion = dataVersion,
                lastUpdated = lastUpdated,
                favoriteCount = favorites.size,
                onFavoritesClick = {
                    viewModel.setSelectedTabIndex(11)
                    navController.navigate(NavRoutes.Favorites.route)
                },
                onSettingsClick = {
                    navController.navigate(NavRoutes.Settings.route)
                }
            )
        }

        // GLOBAL SEARCH BAR
        item {
            LuxurySearchBar(
                query = searchQuery,
                onQueryChange = { newQuery ->
                    viewModel.onSearchQueryChanged(newQuery)
                    if (newQuery.isNotBlank()) {
                        navController.navigate(NavRoutes.GlobalSearch.route) {
                            launchSingleTop = true
                        }
                    }
                },
                onSearchSubmit = { submitted ->
                    viewModel.addRecentSearch(submitted)
                    navController.navigate(NavRoutes.GlobalSearch.route) {
                        launchSingleTop = true
                    }
                },
                onFocusChange = { isFocused ->
                    if (isFocused && searchQuery.isNotBlank()) {
                        navController.navigate(NavRoutes.GlobalSearch.route) {
                            launchSingleTop = true
                        }
                    }
                }
            )
        }

        // HORIZONTALLY SCROLLABLE HEADER TAB ROW
        item {
            LuxuryTabRow(
                selectedTabIndex = selectedTabIndex,
                onTabSelected = { index, tab ->
                    viewModel.setSelectedTabIndex(index)
                    navController.navigate(tab.route)
                }
            )
        }

        // RECENT SEARCHES SECTION (if any)
        if (recentSearches.isNotEmpty()) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.History,
                                contentDescription = null,
                                tint = GoldPrimary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Recent Searches",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                            )
                        }

                        Text(
                            text = "Clear",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GoldLight,
                                fontWeight = FontWeight.SemiBold
                            ),
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .clickable { viewModel.clearRecentSearches() }
                                .padding(4.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        recentSearches.take(6).forEach { recent ->
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(MaterialTheme.colorScheme.surfaceVariant)
                                    .border(0.5.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                    .clickable {
                                        viewModel.onSearchQueryChanged(recent.query)
                                        navController.navigate(NavRoutes.GlobalSearch.route)
                                    }
                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = recent.query,
                                    style = MaterialTheme.typography.bodySmall.copy(
                                        color = MaterialTheme.colorScheme.onSurface,
                                        fontSize = 12.sp
                                    )
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Delete",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier
                                        .size(14.dp)
                                        .clickable { viewModel.deleteRecentSearch(recent.query) }
                                )
                            }
                        }
                    }
                }
            }
        }

        // QUICK METRICS HIGHLIGHT BANNER
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF1E2D4A), Color(0xFF0F1A2E))
                        )
                    )
                    .border(1.dp, GoldPrimary.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Executive Reference Portal",
                            style = MaterialTheme.typography.labelMedium.copy(
                                color = GoldLight,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Instant loan norms, approved car models, commercial grids & payout calculations at your fingertips.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                fontSize = 12.sp
                            )
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(GoldPrimary)
                            .padding(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = Color(0xFF1A1200),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }

        // MODULES TITLE
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Lending Reference Modules",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )
            }
        }

        // QUICK ACCESS MODULES GRID
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                quickCards.chunked(2).forEach { rowCards ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        rowCards.forEach { card ->
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(
                                        Brush.linearGradient(card.gradientColors)
                                    )
                                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                                    .clickable {
                                        viewModel.setSelectedTabIndex(card.tabIndex)
                                        navController.navigate(card.route)
                                    }
                                    .padding(14.dp)
                            ) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(Color.White.copy(alpha = 0.15f))
                                                .padding(8.dp)
                                        ) {
                                            Icon(
                                                imageVector = card.icon,
                                                contentDescription = card.title,
                                                tint = GoldLight,
                                                modifier = Modifier.size(22.dp)
                                            )
                                        }

                                        LuxuryBadge(text = card.countBadge)
                                    }

                                    Spacer(modifier = Modifier.height(12.dp))

                                    Text(
                                        text = card.title,
                                        style = MaterialTheme.typography.titleSmall.copy(
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        ),
                                        maxLines = 1
                                    )

                                    Spacer(modifier = Modifier.height(2.dp))

                                    Text(
                                        text = card.subtitle,
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = Color.White.copy(alpha = 0.7f),
                                            fontSize = 11.5.sp
                                        ),
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        // If single card in last row, add dummy spacer
                        if (rowCards.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}
