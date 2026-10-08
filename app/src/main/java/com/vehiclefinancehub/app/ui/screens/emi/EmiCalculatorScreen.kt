package com.vehiclefinancehub.app.ui.screens.emi

import android.content.Context
import android.content.Intent
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.data.model.EmiCalculatorHelper
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
fun EmiCalculatorScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    val loanAmount by viewModel.emiLoanAmount.collectAsState()
    val rate by viewModel.emiInterestRate.collectAsState()
    val tenureMonths by viewModel.emiTenureMonths.collectAsState()
    val emiResult by viewModel.emiResult.collectAsState()

    var showAmortization by remember { mutableStateOf(false) }

    var amountInput by remember(loanAmount) { mutableStateOf(String.format("%.0f", loanAmount)) }
    var rateInput by remember(rate) { mutableStateOf(String.format("%.2f", rate)) }
    var tenureInput by remember(tenureMonths) { mutableStateOf(tenureMonths.toString()) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        item {
            LuxuryTopBar(
                title = "EMI & Amortization Calculator",
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
                    if (newQuery.isNotBlank()) navController.navigate(NavRoutes.GlobalSearch.route)
                },
                onSearchSubmit = { submitted ->
                    viewModel.addRecentSearch(submitted)
                    navController.navigate(NavRoutes.GlobalSearch.route)
                }
            )
        }

        // TAB ROW
        item {
            LuxuryTabRow(
                selectedTabIndex = selectedTabIndex,
                onTabSelected = { index, tab ->
                    viewModel.setSelectedTabIndex(index)
                    navController.navigate(tab.route)
                }
            )
        }

        // MAIN SUMMARY HERO CARD
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF1E2D4A), Color(0xFF0F172A))
                        )
                    )
                    .border(1.2.dp, GoldPrimary.copy(alpha = 0.6f), RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "MONTHLY EMI",
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = GoldLight,
                            letterSpacing = 1.sp
                        )
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = EmiCalculatorHelper.formatIndianCurrency(emiResult.monthlyEmi),
                        style = MaterialTheme.typography.displayMedium.copy(
                            color = GoldPrimary,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Principal vs Interest Breakdown Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Principal Loan", style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.7f)))
                            Text(EmiCalculatorHelper.formatIndianCurrency(loanAmount), style = MaterialTheme.typography.titleSmall.copy(color = SapphireGlow, fontWeight = FontWeight.Bold))
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Total Interest", style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.7f)))
                            Text(EmiCalculatorHelper.formatIndianCurrency(emiResult.totalInterest), style = MaterialTheme.typography.titleSmall.copy(color = EmeraldGlow, fontWeight = FontWeight.Bold))
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("Total Payable", style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.7f)))
                            Text(EmiCalculatorHelper.formatIndianCurrency(emiResult.totalPayment), style = MaterialTheme.typography.titleSmall.copy(color = Color.White, fontWeight = FontWeight.Bold))
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Interactive Progress Bar (Principal vs Interest)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(10.dp)
                            .clip(RoundedCornerShape(5.dp))
                            .background(Color(0xFF334155))
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(emiResult.principalPct.coerceAtLeast(0.01f))
                                .fillMaxSize()
                                .background(SapphireGlow)
                        )
                        Box(
                            modifier = Modifier
                                .weight(emiResult.interestPct.coerceAtLeast(0.01f))
                                .fillMaxSize()
                                .background(EmeraldGlow)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Share Quote Button
                    Button(
                        onClick = {
                            val shareText = buildEmiQuoteText(loanAmount, rate, tenureMonths, emiResult)
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share EMI Quote via"))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = Color(0xFF1A1200)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share Quotation via WhatsApp", fontWeight = FontWeight.Bold, fontSize = 13.5.sp)
                    }
                }
            }
        }

        // SLIDER CONTROLS SECTION
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Loan Amount Control
                ControlSliderCard(
                    title = "Loan Amount",
                    displayValue = EmiCalculatorHelper.formatIndianCurrency(loanAmount),
                    inputValue = amountInput,
                    onInputChange = { str ->
                        amountInput = str
                        val amt = str.toDoubleOrNull() ?: 0.0
                        viewModel.updateEmiParams(amt, rate, tenureMonths)
                    },
                    sliderValue = loanAmount.toFloat(),
                    valueRange = 50000f..5000000f,
                    onSliderChange = { newAmt ->
                        viewModel.updateEmiParams(newAmt.toDouble(), rate, tenureMonths)
                    }
                )

                // Interest Rate Control
                ControlSliderCard(
                    title = "Interest Rate (p.a.)",
                    displayValue = "${String.format("%.2f", rate)}%",
                    inputValue = rateInput,
                    onInputChange = { str ->
                        rateInput = str
                        val r = str.toDoubleOrNull() ?: 0.0
                        viewModel.updateEmiParams(loanAmount, r, tenureMonths)
                    },
                    sliderValue = rate.toFloat(),
                    valueRange = 7.0f..24.0f,
                    onSliderChange = { newRate ->
                        viewModel.updateEmiParams(loanAmount, newRate.toDouble(), tenureMonths)
                    }
                )

                // Tenure Control (Months / Years)
                ControlSliderCard(
                    title = "Loan Tenure",
                    displayValue = "$tenureMonths Months (${tenureMonths / 12} Yrs ${tenureMonths % 12} M)",
                    inputValue = tenureInput,
                    onInputChange = { str ->
                        tenureInput = str
                        val t = str.toIntOrNull() ?: 12
                        viewModel.updateEmiParams(loanAmount, rate, t)
                    },
                    sliderValue = tenureMonths.toFloat(),
                    valueRange = 12f..84f,
                    steps = 5,
                    onSliderChange = { newTenure ->
                        viewModel.updateEmiParams(loanAmount, rate, newTenure.toInt())
                    }
                )
            }
        }

        // AMORTIZATION SCHEDULE EXPANDABLE SECTION
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                    .clickable { showAmortization = !showAmortization }
                    .padding(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Amortization Breakdown (${emiResult.schedule.size} Months)",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = GoldLight
                        )
                    )

                    Icon(
                        imageVector = if (showAmortization) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = null,
                        tint = GoldPrimary
                    )
                }
            }
        }

        if (showAmortization) {
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp)
                        .background(MaterialTheme.colorScheme.surface)
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Month", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = GoldLight, modifier = Modifier.width(45.dp))
                    Text("Principal", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = GoldLight, modifier = Modifier.weight(1f))
                    Text("Interest", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = GoldLight, modifier = Modifier.weight(1f))
                    Text("Balance", fontWeight = FontWeight.Bold, fontSize = 11.sp, color = GoldLight, modifier = Modifier.weight(1f))
                }
            }

            items(emiResult.schedule) { monthItem ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 1.dp)
                        .background(if (monthItem.month % 2 == 1) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f) else MaterialTheme.colorScheme.background)
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("M${monthItem.month}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.width(45.dp))
                    Text(EmiCalculatorHelper.formatIndianCurrency(monthItem.principal), fontSize = 11.sp, color = SapphireGlow, modifier = Modifier.weight(1f))
                    Text(EmiCalculatorHelper.formatIndianCurrency(monthItem.interest), fontSize = 11.sp, color = EmeraldGlow, modifier = Modifier.weight(1f))
                    Text(EmiCalculatorHelper.formatIndianCurrency(monthItem.closingBalance), fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.weight(1f))
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun ControlSliderCard(
    title: String,
    displayValue: String,
    inputValue: String,
    onInputChange: (String) -> Unit,
    sliderValue: Float,
    valueRange: ClosedFloatingPointRange<Float>,
    steps: Int = 0,
    onSliderChange: (Float) -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .border(0.6.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )

                Text(
                    text = displayValue,
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = GoldLight
                    )
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Slider(
                value = sliderValue.coerceIn(valueRange.start, valueRange.endInclusive),
                onValueChange = onSliderChange,
                valueRange = valueRange,
                steps = steps,
                colors = SliderDefaults.colors(
                    thumbColor = GoldPrimary,
                    activeTrackColor = GoldPrimary,
                    inactiveTrackColor = MaterialTheme.colorScheme.outline
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

private fun buildEmiQuoteText(
    amount: Double,
    rate: Double,
    tenure: Int,
    result: EmiCalculatorHelper.EmiResult
): String {
    val sb = StringBuilder()
    sb.append("📊 *VEHICLE LOAN EMI QUOTATION*\n")
    sb.append("━━━━━━━━━━━━━━━━━━━━\n")
    sb.append("💰 *Loan Amount:* ").append(EmiCalculatorHelper.formatIndianCurrency(amount)).append("\n")
    sb.append("📈 *Interest Rate:* ").append(String.format("%.2f", rate)).append("% p.a.\n")
    sb.append("⏳ *Tenure:* ").append(tenure).append(" Months (").append(tenure / 12).append(" Years)\n")
    sb.append("━━━━━━━━━━━━━━━━━━━━\n")
    sb.append("⭐ *Monthly EMI:* ").append(EmiCalculatorHelper.formatIndianCurrency(result.monthlyEmi)).append("\n")
    sb.append("🔹 *Total Interest:* ").append(EmiCalculatorHelper.formatIndianCurrency(result.totalInterest)).append("\n")
    sb.append("🔹 *Total Payable:* ").append(EmiCalculatorHelper.formatIndianCurrency(result.totalPayment)).append("\n")
    sb.append("━━━━━━━━━━━━━━━━━━━━\n")
    sb.append("Generated by Vehicle Finance Hub")
    return sb.toString()
}
