package com.vehiclefinancehub.app.ui.components

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.ExperimentalFoundationApi
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.ArrowDropUp
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.StarBorder
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vehiclefinancehub.app.data.model.ActiveSort
import com.vehiclefinancehub.app.data.model.DataColumn
import com.vehiclefinancehub.app.data.model.DatasetSchema
import com.vehiclefinancehub.app.data.model.SortDirection
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.ObsidianCard
import com.vehiclefinancehub.app.ui.theme.SapphireGlow
import java.util.Locale

@OptIn(ExperimentalFoundationApi::class, ExperimentalMaterial3Api::class)
@Composable
fun DynamicTableView(
    schema: DatasetSchema?,
    isLoading: Boolean = false,
    highlightRowQuery: String? = null,
    favoriteIds: Set<String> = emptySet(),
    onToggleFavorite: (String, Map<String, Any?>) -> Unit = { _, _ -> },
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    if (isLoading) {
        Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GoldPrimary)
        }
        return
    }

    if (schema == null || schema.columns.isEmpty()) {
        EmptyStateView(
            title = "No Dataset Available",
            description = "Data is currently loading or dataset schema is empty.",
            modifier = modifier
        )
        return
    }

    // In-Screen Search & Filters State
    var inScreenQuery by remember { mutableStateOf("") }
    val activeFilters = remember { mutableStateMapOf<String, String>() }
    var activeSort by remember { mutableStateOf<ActiveSort?>(null) }
    var selectedDetailRow by remember { mutableStateOf<Map<String, Any?>?>(null) }

    // Derive Unique Filter Options for each filterable column
    val filterableColumns = remember(schema) {
        schema.columns.filter { it.isFilterable }
    }

    // Filter and Sort Rows dynamically
    val displayedRows by remember(schema, inScreenQuery, activeFilters, activeSort) {
        derivedStateOf {
            var result = schema.rows

            // In-Screen Query Filter
            if (inScreenQuery.isNotBlank()) {
                val q = inScreenQuery.trim().lowercase(Locale.ROOT)
                result = result.filter { row ->
                    row.values.any { it?.toString()?.lowercase(Locale.ROOT)?.contains(q) == true }
                }
            }

            // Dropdown / Chip Filters
            activeFilters.forEach { (colKey, filterValue) ->
                if (filterValue.isNotBlank()) {
                    result = result.filter { row ->
                        row[colKey]?.toString()?.equals(filterValue, ignoreCase = true) == true
                    }
                }
            }

            // Sorting
            activeSort?.let { sort ->
                result = when (sort.direction) {
                    SortDirection.ASC -> result.sortedBy { row ->
                        val valObj = row[sort.columnKey]
                        val num = valObj?.toString()?.replace("[^0-9.]".toRegex(), "")?.toDoubleOrNull()
                        num?.toString() ?: valObj?.toString()?.lowercase(Locale.ROOT) ?: ""
                    }
                    SortDirection.DESC -> result.sortedByDescending { row ->
                        val valObj = row[sort.columnKey]
                        val num = valObj?.toString()?.replace("[^0-9.]".toRegex(), "")?.toDoubleOrNull()
                        num?.toString() ?: valObj?.toString()?.lowercase(Locale.ROOT) ?: ""
                    }
                    SortDirection.NONE -> result
                }
            }

            result
        }
    }

    val horizontalScrollState = rememberScrollState()
    val verticalListState = rememberLazyListState()

    // Scroll to highlight row if requested
    LaunchedEffect(highlightRowQuery) {
        if (!highlightRowQuery.isNullOrBlank()) {
            val index = displayedRows.indexOfFirst { row ->
                row.values.any { it?.toString()?.contains(highlightRowQuery, ignoreCase = true) == true }
            }
            if (index >= 0) {
                verticalListState.animateScrollToItem(index)
            }
        }
    }

    Column(modifier = modifier.fillMaxSize()) {

        // In-Screen Search Box + Active Row Count Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedTextField(
                value = inScreenQuery,
                onValueChange = { inScreenQuery = it },
                placeholder = {
                    Text(
                        "Filter in ${schema.title}…",
                        style = MaterialTheme.typography.bodySmall.copy(
                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        )
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = GoldPrimary,
                        modifier = Modifier.size(18.dp)
                    )
                },
                trailingIcon = {
                    if (inScreenQuery.isNotEmpty()) {
                        IconButton(onClick = { inScreenQuery = "" }, modifier = Modifier.size(24.dp)) {
                            Icon(imageVector = Icons.Default.Close, contentDescription = "Clear", tint = Color.Gray, modifier = Modifier.size(16.dp))
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = GoldPrimary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                    focusedContainerColor = MaterialTheme.colorScheme.surfaceVariant,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surfaceVariant
                ),
                textStyle = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurface),
                modifier = Modifier
                    .weight(1f)
                    .height(44.dp)
            )

            // Result Count Pill
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(10.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(1.dp, GoldPrimary.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                    .padding(horizontal = 10.dp, vertical = 8.dp)
            ) {
                Text(
                    text = "${displayedRows.size} rows",
                    style = MaterialTheme.typography.labelSmall.copy(
                        color = GoldLight,
                        fontWeight = FontWeight.Bold
                    )
                )
            }
        }

        // Filter Chips Row (Dropdown Menus for Filterable Columns)
        if (filterableColumns.isNotEmpty()) {
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filterableColumns) { col ->
                    val selectedValue = activeFilters[col.key]
                    val uniqueValues = remember(schema) {
                        schema.rows.mapNotNull { it[col.key]?.toString()?.trim() }.filter { it.isNotBlank() }.distinct().sorted()
                    }

                    var isMenuExpanded by remember { mutableStateOf(false) }

                    Box {
                        val isFilterActive = !selectedValue.isNullOrBlank()
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isFilterActive) GoldContainer else MaterialTheme.colorScheme.surfaceVariant)
                                .border(
                                    1.dp,
                                    if (isFilterActive) GoldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                                    RoundedCornerShape(12.dp)
                                )
                                .clickable { isMenuExpanded = true }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = if (isFilterActive) "${col.label}: $selectedValue" else col.label,
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = if (isFilterActive) GoldLight else MaterialTheme.colorScheme.onSurfaceVariant,
                                    fontWeight = if (isFilterActive) FontWeight.Bold else FontWeight.Normal,
                                    fontSize = 11.5.sp
                                )
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = null,
                                tint = if (isFilterActive) GoldPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        DropdownMenu(
                            expanded = isMenuExpanded,
                            onDismissRequest = { isMenuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("All ${col.label}") },
                                onClick = {
                                    activeFilters.remove(col.key)
                                    isMenuExpanded = false
                                }
                            )
                            uniqueValues.forEach { optionVal ->
                                DropdownMenuItem(
                                    text = { Text(optionVal) },
                                    onClick = {
                                        activeFilters[col.key] = optionVal
                                        isMenuExpanded = false
                                    },
                                    trailingIcon = {
                                        if (selectedValue == optionVal) {
                                            Icon(Icons.Default.Check, contentDescription = null, tint = GoldPrimary, modifier = Modifier.size(16.dp))
                                        }
                                    }
                                )
                            }
                        }
                    }
                }

                // Clear Filters Chip (if any active)
                if (activeFilters.isNotEmpty() || inScreenQuery.isNotEmpty()) {
                    item {
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF3B1E1E))
                                .border(1.dp, Color(0xFFEF4444).copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                .clickable {
                                    activeFilters.clear()
                                    inScreenQuery = ""
                                    activeSort = null
                                }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "Reset Filters",
                                style = MaterialTheme.typography.labelSmall.copy(
                                    color = Color(0xFFFCA5A5),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 11.sp
                                )
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        // Horizontally scrollable Dynamic Table
        if (displayedRows.isEmpty()) {
            EmptyStateView(
                title = "No Matching Rows",
                description = "No items match your filter criteria. Try resetting filters."
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .horizontalScroll(horizontalScrollState)
            ) {
                LazyColumn(
                    state = verticalListState,
                    modifier = Modifier.fillMaxSize()
                ) {
                    // STICKY HEADER ROW
                    stickyHeader {
                        Row(
                            modifier = Modifier
                                .background(MaterialTheme.colorScheme.surface)
                                .border(0.5.dp, MaterialTheme.colorScheme.outline)
                                .padding(vertical = 10.dp, horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Action Column header (Star & More)
                            Box(modifier = Modifier.width(44.dp)) {
                                Text(
                                    text = "★",
                                    style = MaterialTheme.typography.labelMedium.copy(
                                        color = GoldPrimary,
                                        fontWeight = FontWeight.Bold
                                    ),
                                    textAlign = TextAlign.Center
                                )
                            }

                            // Dynamic Columns
                            schema.columns.forEach { col ->
                                val isCurrentSorted = activeSort?.columnKey == col.key
                                Row(
                                    modifier = Modifier
                                        .width(col.widthDp.dp)
                                        .padding(horizontal = 6.dp)
                                        .clickable {
                                            if (col.isSortable) {
                                                activeSort = when (activeSort?.direction) {
                                                    SortDirection.ASC -> ActiveSort(col.key, SortDirection.DESC)
                                                    SortDirection.DESC -> null
                                                    else -> ActiveSort(col.key, SortDirection.ASC)
                                                }
                                            }
                                        },
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = col.label,
                                        style = MaterialTheme.typography.labelMedium.copy(
                                            color = if (isCurrentSorted) GoldPrimary else MaterialTheme.colorScheme.onSurface,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp
                                        ),
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f)
                                    )

                                    if (isCurrentSorted) {
                                        Icon(
                                            imageVector = if (activeSort?.direction == SortDirection.ASC) Icons.Default.ArrowDropUp else Icons.Default.ArrowDropDown,
                                            contentDescription = null,
                                            tint = GoldPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // DATA ROWS
                    itemsIndexed(displayedRows) { rowIndex, row ->
                        val rowId = "${schema.datasetId}_row_${row["sNo"] ?: rowIndex}"
                        val isStarred = favoriteIds.contains(rowId)

                        val isHighlighted = highlightRowQuery?.let { q ->
                            row.values.any { it?.toString()?.contains(q, ignoreCase = true) == true }
                        } ?: false

                        val rowBg = when {
                            isHighlighted -> GoldPrimary.copy(alpha = 0.15f)
                            rowIndex % 2 == 1 -> MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
                            else -> MaterialTheme.colorScheme.background
                        }

                        Row(
                            modifier = Modifier
                                .background(rowBg)
                                .border(0.2.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
                                .clickable {
                                    selectedDetailRow = row
                                }
                                .padding(vertical = 12.dp, horizontal = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Star / Favorite Button
                            IconButton(
                                onClick = {
                                    onToggleFavorite(rowId, row)
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                Icon(
                                    imageVector = if (isStarred) Icons.Default.Star else Icons.Default.StarBorder,
                                    contentDescription = "Star",
                                    tint = if (isStarred) GoldPrimary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            // Dynamic Cells
                            schema.columns.forEach { col ->
                                val cellVal = row[col.key]?.toString() ?: "-"

                                Box(
                                    modifier = Modifier
                                        .width(col.widthDp.dp)
                                        .padding(horizontal = 6.dp),
                                    contentAlignment = Alignment.CenterStart
                                ) {
                                    when (col.type) {
                                        "badge", "status" -> {
                                            LuxuryBadge(text = cellVal)
                                        }
                                        "currency" -> {
                                            Text(
                                                text = cellVal,
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    fontWeight = FontWeight.SemiBold,
                                                    color = GoldLight,
                                                    fontSize = 12.5.sp
                                                ),
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        "percentage" -> {
                                            Text(
                                                text = cellVal,
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = EmeraldGlow,
                                                    fontSize = 12.5.sp
                                                ),
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        else -> {
                                            Text(
                                                text = cellVal,
                                                style = MaterialTheme.typography.bodyMedium.copy(
                                                    color = if (col.isPrimary) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant,
                                                    fontWeight = if (col.isPrimary) FontWeight.Medium else FontWeight.Normal,
                                                    fontSize = 12.5.sp
                                                ),
                                                maxLines = 2,
                                                overflow = TextOverflow.Ellipsis
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
    }

    // DETAIL BOTTOM SHEET
    selectedDetailRow?.let { rowMap ->
        DetailBottomSheet(
            title = schema.title,
            columns = schema.columns,
            rowMap = rowMap,
            isFavorite = favoriteIds.contains("${schema.datasetId}_row_${rowMap["sNo"] ?: 0}"),
            onToggleFavorite = {
                onToggleFavorite("${schema.datasetId}_row_${rowMap["sNo"] ?: 0}", rowMap)
            },
            onDismiss = { selectedDetailRow = null }
        )
    }
}
