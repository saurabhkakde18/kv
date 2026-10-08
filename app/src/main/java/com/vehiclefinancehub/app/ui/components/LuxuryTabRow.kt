package com.vehiclefinancehub.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.LocalOffer
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.MonetizationOn
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.TableChart
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.ObsidianBorder
import com.vehiclefinancehub.app.ui.theme.ObsidianCard

data class HubTabItem(
    val id: String,
    val title: String,
    val icon: ImageVector,
    val route: String
)

val HUB_TABS = listOf(
    HubTabItem("car_policy", "Car Policy", Icons.Default.Policy, "dataset/car_policy"),
    HubTabItem("approved_cars", "Approved Car", Icons.Default.VerifiedUser, "dataset/approved_cars"),
    HubTabItem("cv_grid", "CV Grid", Icons.Default.LocalShipping, "dataset/cv_grid"),
    HubTabItem("cv_policy", "CV Policy", Icons.Default.Policy, "dataset/cv_policy"),
    HubTabItem("bolero_pickup_grid", "Bolero Pickup Grid", Icons.Default.DirectionsCar, "dataset/bolero_pickup_grid"),
    HubTabItem("dsa_payout", "DSA Payout", Icons.Default.MonetizationOn, "payout"),
    HubTabItem("irr_matrix", "IRR Matrix", Icons.Default.TableChart, "irr"),
    HubTabItem("emi_calculator", "EMI Calculator", Icons.Default.Calculate, "emi"),
    HubTabItem("documents", "Documents", Icons.Default.Folder, "documents"),
    HubTabItem("schemes", "Schemes / Offers", Icons.Default.LocalOffer, "schemes"),
    HubTabItem("contacts", "Contacts", Icons.Default.Call, "contacts"),
    HubTabItem("favorites", "Favorites", Icons.Default.Star, "favorites")
)

@Composable
fun LuxuryTabRow(
    selectedTabIndex: Int,
    onTabSelected: (Int, HubTabItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()

    LaunchedEffect(selectedTabIndex) {
        if (selectedTabIndex in HUB_TABS.indices) {
            listState.animateScrollToItem((selectedTabIndex - 1).coerceAtLeast(0))
        }
    }

    LazyRow(
        state = listState,
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .padding(vertical = 6.dp),
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        itemsIndexed(HUB_TABS) { index, tab ->
            val isSelected = index == selectedTabIndex

            val bgColor by animateColorAsState(
                targetValue = if (isSelected) GoldPrimary else MaterialTheme.colorScheme.surfaceVariant,
                label = "tabBg"
            )

            val textColor by animateColorAsState(
                targetValue = if (isSelected) Color(0xFF1A1200) else MaterialTheme.colorScheme.onSurfaceVariant,
                label = "tabText"
            )

            val iconColor by animateColorAsState(
                targetValue = if (isSelected) Color(0xFF1A1200) else GoldPrimary,
                label = "tabIcon"
            )

            val borderColor = if (isSelected) {
                GoldLight
            } else {
                MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(bgColor)
                    .border(1.dp, borderColor, RoundedCornerShape(20.dp))
                    .clickable {
                        onTabSelected(index, tab)
                    }
                    .padding(horizontal = 14.dp, vertical = 7.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = tab.icon,
                        contentDescription = tab.title,
                        tint = iconColor,
                        modifier = Modifier.size(16.dp)
                    )

                    Text(
                        text = " ${tab.title}",
                        style = MaterialTheme.typography.labelLarge.copy(
                            color = textColor,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }
}
