package com.vehiclefinancehub.app.ui.screens.documents

import android.content.Context
import android.content.Intent
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
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary

val PROFILE_TABS = listOf("All Profiles", "Salaried", "Self Employed", "Farmer / Agri", "Private Ltd / LLP")

@Composable
fun DocumentsScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val allDatasets by viewModel.allDatasets.collectAsState()
    val schema = allDatasets.find { it.datasetId == "documents" }

    val selectedTabIndex by viewModel.selectedTabIndex.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val favorites by viewModel.favorites.collectAsState()
    val dataVersion by viewModel.dataVersion.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    val checkedDocs by viewModel.checkedDocs.collectAsState()

    var selectedProfileFilter by remember { mutableStateOf("All Profiles") }

    val allDocRows = schema?.rows ?: emptyList()
    val displayedRows = if (selectedProfileFilter == "All Profiles") {
        allDocRows
    } else {
        allDocRows.filter {
            val prof = it["profile"]?.toString() ?: ""
            prof.contains(selectedProfileFilter, ignoreCase = true) || prof.contains("All Profiles", ignoreCase = true)
        }
    }

    val collectedCount = displayedRows.count { row ->
        val key = row["docName"]?.toString() ?: ""
        checkedDocs[key] == true
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP BAR
        LuxuryTopBar(
            title = "Document Checklist",
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

        // PROFILE FILTER TABS
        LazyRow(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(PROFILE_TABS) { prof ->
                val isSelected = prof == selectedProfileFilter

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) GoldContainer else MaterialTheme.colorScheme.surfaceVariant)
                        .border(
                            1.dp,
                            if (isSelected) GoldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { selectedProfileFilter = prof }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = prof,
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = if (isSelected) GoldLight else MaterialTheme.colorScheme.onSurfaceVariant,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }

        // CHECKLIST PROGRESS & ACTIONS HEADER
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .border(0.5.dp, GoldPrimary.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Documents Collected: $collectedCount / ${displayedRows.size}",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = if (collectedCount == displayedRows.size) EmeraldGlow else GoldLight
                        )
                    )
                    Text(
                        text = "Filter: $selectedProfileFilter",
                        style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (checkedDocs.isNotEmpty()) {
                        OutlinedButton(
                            onClick = { viewModel.clearDocumentChecks() },
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text("Reset", fontSize = 11.sp)
                        }
                    }

                    Button(
                        onClick = {
                            val shareText = buildDocShareText(selectedProfileFilter, displayedRows, checkedDocs)
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, shareText)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Document List via"))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = Color(0xFF1A1200)),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Share List", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // CHECKLIST ITEMS
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(displayedRows) { doc ->
                val docName = doc["docName"]?.toString() ?: ""
                val isChecked = checkedDocs[docName] == true
                val isMandatory = doc["isMandatory"]?.toString() ?: "Mandatory"
                val specs = doc["specifications"]?.toString() ?: ""
                val docType = doc["docType"]?.toString() ?: ""

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isChecked) MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f) else MaterialTheme.colorScheme.surfaceVariant)
                        .border(
                            1.dp,
                            if (isChecked) EmeraldGlow.copy(alpha = 0.5f) else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { viewModel.toggleDocumentCheck(docName) }
                        .padding(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isChecked,
                            onCheckedChange = { viewModel.toggleDocumentCheck(docName) },
                            colors = CheckboxDefaults.colors(
                                checkedColor = EmeraldGlow,
                                checkmarkColor = Color(0xFF003922),
                                uncheckedColor = MaterialTheme.colorScheme.outline
                            )
                        )

                        Spacer(modifier = Modifier.width(6.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = docName,
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold,
                                        color = if (isChecked) MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f) else MaterialTheme.colorScheme.onSurface
                                    ),
                                    modifier = Modifier.weight(1f)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                LuxuryBadge(text = isMandatory)
                            }

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = "$docType • $specs",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontSize = 11.5.sp
                                )
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(30.dp))
            }
        }
    }
}

private fun buildDocShareText(profile: String, rows: List<Map<String, Any?>>, checkedMap: Map<String, Boolean>): String {
    val sb = StringBuilder()
    sb.append("📑 *DOCUMENT CHECKLIST - ").append(profile.uppercase()).append("*\n")
    sb.append("━━━━━━━━━━━━━━━━━━━━\n")
    rows.forEach { row ->
        val name = row["docName"]?.toString() ?: ""
        val isDone = checkedMap[name] == true
        val statusIcon = if (isDone) "✅" else "⬜"
        val isMandatory = row["isMandatory"]?.toString() ?: ""
        val specs = row["specifications"]?.toString() ?: ""
        sb.append(statusIcon).append(" *").append(name).append("* [").append(isMandatory).append("]\n")
        sb.append("   _").append(specs).append("_\n\n")
    }
    sb.append("━━━━━━━━━━━━━━━━━━━━\n")
    sb.append("Sent via Vehicle Finance Hub")
    return sb.toString()
}
