package com.vehiclefinancehub.app.ui.screens.contacts

import android.content.Context
import android.content.Intent
import android.net.Uri
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
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Send
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.vehiclefinancehub.app.ui.components.LuxuryBadge
import com.vehiclefinancehub.app.ui.components.LuxurySearchBar
import com.vehiclefinancehub.app.ui.components.LuxuryTabRow
import com.vehiclefinancehub.app.ui.components.LuxuryTopBar
import com.vehiclefinancehub.app.ui.navigation.NavRoutes
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.SapphireGlow

@Composable
fun ContactsScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val allDatasets by viewModel.allDatasets.collectAsState()
    val schema = allDatasets.find { it.datasetId == "contacts" }

    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    val contacts = schema?.rows ?: emptyList()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP BAR
        LuxuryTopBar(
            title = "Key Contacts Directory",
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

        // CONTACTS LIST
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(contacts) { contact ->
                val name = contact["name"]?.toString() ?: ""
                val designation = contact["designation"]?.toString() ?: ""
                val department = contact["department"]?.toString() ?: ""
                val region = contact["region"]?.toString() ?: ""
                val phone = contact["phone"]?.toString() ?: ""
                val email = contact["email"]?.toString() ?: ""

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .border(0.6.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Profile Avatar
                        Box(
                            modifier = Modifier
                                .size(46.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surface)
                                .border(1.dp, GoldPrimary.copy(alpha = 0.5f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = GoldLight,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        // Info
                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = name,
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                LuxuryBadge(text = department)
                            }

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = "$designation • $region",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 11.5.sp
                                )
                            )
                        }

                        // Direct Action Buttons (Call, WhatsApp, Email)
                        Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            if (phone.isNotBlank()) {
                                // Direct Call
                                IconButton(
                                    onClick = {
                                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:$phone"))
                                        context.startActivity(intent)
                                    },
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surface)
                                ) {
                                    Icon(Icons.Default.Call, contentDescription = "Call", tint = EmeraldGlow, modifier = Modifier.size(16.dp))
                                }

                                // Direct WhatsApp
                                IconButton(
                                    onClick = {
                                        val cleanNum = phone.replace("+", "").replace(" ", "")
                                        val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/$cleanNum"))
                                        context.startActivity(waIntent)
                                    },
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surface)
                                ) {
                                    Icon(Icons.Default.Send, contentDescription = "WhatsApp", tint = SapphireGlow, modifier = Modifier.size(16.dp))
                                }
                            }

                            if (email.isNotBlank()) {
                                IconButton(
                                    onClick = {
                                        val mailIntent = Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$email"))
                                        context.startActivity(mailIntent)
                                    },
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(CircleShape)
                                        .background(MaterialTheme.colorScheme.surface)
                                ) {
                                    Icon(Icons.Default.Email, contentDescription = "Email", tint = GoldLight, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
