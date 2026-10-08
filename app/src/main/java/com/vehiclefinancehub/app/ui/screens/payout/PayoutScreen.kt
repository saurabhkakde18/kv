package com.vehiclefinancehub.app.ui.screens.payout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.data.model.EmiCalculatorHelper
import com.vehiclefinancehub.app.ui.components.DynamicTableView
import com.vehiclefinancehub.app.ui.components.LuxuryCard
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
fun PayoutScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val allDatasets by viewModel.allDatasets.collectAsState()
    val schema = allDatasets.find { it.datasetId == "dsa_payout" }

    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val favoriteIds by viewModel.favoriteIds.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    // Interactive Payout Calculator state
    val loanAmount by viewModel.payoutLoanAmount.collectAsState()
    val basePct by viewModel.payoutBasePct.collectAsState()
    val bonusPct by viewModel.payoutBonusPct.collectAsState()
    val payoutResult by viewModel.payoutResult.collectAsState()

    var loanAmountInput by remember(loanAmount) {
        mutableStateOf(String.format("%.0f", loanAmount))
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        LuxuryTopBar(
            title = "DSA Payout & Commissions",
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

        // DSA PAYOUT CALCULATOR CARD AT TOP
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(
                    Brush.linearGradient(
                        listOf(Color(0xFF2D1537), Color(0xFF13091B))
                    )
                )
                .border(1.dp, GoldPrimary.copy(alpha = 0.5f), RoundedCornerShape(16.dp))
                .padding(14.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Calculate,
                            contentDescription = null,
                            tint = GoldPrimary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Instant Commission Calculator",
                            style = MaterialTheme.typography.titleSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = GoldLight
                            )
                        )
                    }

                    // Total Earnings Badge
                    Text(
                        text = EmiCalculatorHelper.formatIndianCurrency(payoutResult.totalEarnings),
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = EmeraldGlow
                        )
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Input Loan Amount + Slabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = loanAmountInput,
                        onValueChange = { str ->
                            loanAmountInput = str
                            val amt = str.toDoubleOrNull() ?: 0.0
                            viewModel.updatePayoutParams(amt, basePct, bonusPct)
                        },
                        label = { Text("Loan Amount (₹)", fontSize = 10.sp) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        shape = RoundedCornerShape(10.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline
                        ),
                        textStyle = MaterialTheme.typography.bodySmall.copy(color = Color.White, fontWeight = FontWeight.Bold),
                        modifier = Modifier
                            .weight(1.2f)
                            .height(52.dp)
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Payout: ${String.format("%.2f", payoutResult.totalPayoutPct)}%",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = GoldLight,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "Base (${basePct}%) + Bonus (${bonusPct}%)",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = Color.White.copy(alpha = 0.7f),
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }
        }

        // DYNAMIC PAYOUT GRID TABLE
        DynamicTableView(
            schema = schema,
            isLoading = schema == null,
            favoriteIds = favoriteIds.toSet(),
            onToggleFavorite = { rowId, rowMap ->
                val primaryTitle = rowMap["product"]?.toString() ?: "Payout"
                val secondaryText = "Slab: ${rowMap["volumeSlab"]} | Payout: ${rowMap["totalPayoutPct"]}"
                viewModel.toggleFavorite(
                    id = rowId,
                    datasetId = "dsa_payout",
                    datasetTitle = "DSA Payout",
                    primaryTitle = primaryTitle,
                    secondaryText = secondaryText,
                    rowJson = com.google.gson.Gson().toJson(rowMap)
                )
            },
            modifier = Modifier.weight(1f)
        )
    }
}
