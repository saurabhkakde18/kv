package com.vehiclefinancehub.app.ui.screens.irr

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.ui.components.DynamicTableView
import com.vehiclefinancehub.app.ui.components.LuxuryBadge
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.components.LuxuryTabRow
import com.vehiclefinancehub.app.ui.components.LuxuryTopBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.SapphireGlow

@Composable
fun IrrMatrixScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val allDatasets by viewModel.allDatasets.collectAsState()
    val schema = allDatasets.find { it.datasetId == "irr_matrix" }

    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    var selectedRowIndex by remember { mutableStateOf(0) }
    var selectedTenureCol by remember { mutableStateOf("tenure60m") } // 36m, 48m, 60m, 84m

    val rows = schema?.rows ?: emptyList()
    val selectedRow = rows.getOrNull(selectedRowIndex)

    val selectedRateStr = selectedRow?.get(selectedTenureCol)?.toString() ?: "9.10%"
    val selectedRateNum = selectedRateStr.replace("%", "").trim().toDoubleOrNull() ?: 9.10
    val selectedTenureMonths = when (selectedTenureCol) {
        "tenure36m" -> 36
        "tenure48m" -> 48
        "tenure60m" -> 60
        "tenure84m" -> 84
        else -> 60
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP BAR
        LuxuryTopBar(
            title = "IRR & Interest Rate Matrix",
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

        // 2D MATRIX INTERACTIVE SELECTION SUMMARY BANNER
        if (selectedRow != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, GoldPrimary.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Selected Loan Parameter",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            )
                            Text(
                                text = "${selectedRow["product"]} • ${selectedRow["cibilTier"]}",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = GoldLight
                                )
                            )
                        }

                        // Applicable Rate Badge
                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "Applicable ROI",
                                style = MaterialTheme.typography.labelSmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant)
                            )
                            Text(
                                text = selectedRateStr,
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = EmeraldGlow
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            viewModel.updateEmiParams(
                                loanAmount = 800000.0,
                                rate = selectedRateNum,
                                tenureMonths = selectedTenureMonths
                            )
                            viewModel.setSelectedTabIndex(7)
                            navController.navigate(NavRoutes.Emi.route)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = GoldPrimary,
                            contentColor = Color(0xFF1A1200)
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Calculate, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Calculate EMI with this Rate ($selectedRateStr)", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }
        }

        // 2D MATRIX TABLE
        val hScrollState = rememberScrollState()

        Box(
            modifier = Modifier
                .fillMaxSize()
                .horizontalScroll(hScrollState)
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp)
            ) {
                // Table Header
                item {
                    Row(
                        modifier = Modifier
                            .background(MaterialTheme.colorScheme.surface)
                            .border(0.5.dp, MaterialTheme.colorScheme.outline)
                            .padding(vertical = 10.dp, horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Product", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, modifier = Modifier.width(100.dp))
                        Text("CIBIL Tier", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, modifier = Modifier.width(110.dp))
                        Text("Slab", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, modifier = Modifier.width(90.dp))
                        Text("36M ROI", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.width(80.dp))
                        Text("48M ROI", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.width(80.dp))
                        Text("60M ROI", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.width(80.dp))
                        Text("84M ROI", fontWeight = FontWeight.Bold, color = GoldLight, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.width(80.dp))
                    }
                }

                // Matrix Rows
                items(rows.indices.toList()) { index ->
                    val row = rows[index]
                    val isRowSelected = index == selectedRowIndex

                    Row(
                        modifier = Modifier
                            .background(if (isRowSelected) GoldPrimary.copy(alpha = 0.12f) else MaterialTheme.colorScheme.surfaceVariant)
                            .border(0.2.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                            .clickable { selectedRowIndex = index }
                            .padding(vertical = 12.dp, horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(row["product"]?.toString() ?: "", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.width(100.dp))
                        Text(row["cibilTier"]?.toString() ?: "", fontSize = 11.5.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(110.dp))
                        Text(row["slab"]?.toString() ?: "", fontSize = 11.5.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(90.dp))

                        // Clickable Rate Cells
                        listOf("tenure36m", "tenure48m", "tenure60m", "tenure84m").forEach { colKey ->
                            val rateVal = row[colKey]?.toString() ?: "-"
                            val isCellSelected = isRowSelected && selectedTenureCol == colKey

                            Box(
                                modifier = Modifier
                                    .width(80.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isCellSelected) GoldPrimary else Color.Transparent)
                                    .clickable {
                                        selectedRowIndex = index
                                        selectedTenureCol = colKey
                                    }
                                    .padding(vertical = 4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = rateVal,
                                    fontSize = 12.sp,
                                    fontWeight = if (isCellSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isCellSelected) Color(0xFF1A1200) else EmeraldGlow,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
