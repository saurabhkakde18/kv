package com.vehiclefinancehub.app.ui.screens.settings

import android.content.Context
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material.icons.filled.InsertDriveFile
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import com.vehiclefinancehub.app.ui.screens.viewmodel.FinanceViewModel
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.RubyAlert

val TARGET_DATASETS = listOf(
    "approved_cars" to "Approved Cars",
    "cv_grid" to "CV Grid",
    "bolero_pickup_grid" to "Bolero Pik-Up Grid",
    "dsa_payout" to "DSA Payout",
    "irr_matrix" to "IRR Matrix",
    "car_policy" to "Car Policy",
    "cv_policy" to "CV Policy",
    "documents" to "Documents",
    "schemes" to "Schemes",
    "contacts" to "Contacts"
)

@Composable
fun ImportDataScreen(
    viewModel: FinanceViewModel,
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val importPreview by viewModel.importPreview.collectAsState()

    var selectedTargetId by remember { mutableStateOf("approved_cars") }
    var rawTextContent by remember { mutableStateOf("") }
    var selectedFileName by remember { mutableStateOf<String?>(null) }

    // File Picker for JSON or CSV
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            try {
                val content = context.contentResolver.openInputStream(uri)?.bufferedReader()?.use { it.readText() } ?: ""
                selectedFileName = uri.lastPathSegment ?: "Imported File"
                rawTextContent = content

                if (selectedFileName?.endsWith(".csv", ignoreCase = true) == true || content.contains(",")) {
                    val targetTitle = TARGET_DATASETS.find { it.first == selectedTargetId }?.second ?: "Dataset"
                    viewModel.previewImportCsv(content, selectedTargetId, targetTitle)
                } else {
                    viewModel.previewImportJson(content, selectedTargetId)
                }
            } catch (e: Exception) {
                Toast.makeText(context, "Failed to read file: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // TOP APP BAR
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { navController.popBackStack() },
                modifier = Modifier.size(36.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = GoldPrimary
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "Import Custom Dataset",
                style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            )
        }

        Divider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // STEP 1: SELECT TARGET DATASET
            item {
                Column {
                    Text(
                        text = "1. Select Target Module to Replace/Update",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = GoldLight)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(TARGET_DATASETS) { (id, label) ->
                            val isSelected = selectedTargetId == id
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(if (isSelected) GoldContainer else MaterialTheme.colorScheme.surfaceVariant)
                                    .border(
                                        1.dp,
                                        if (isSelected) GoldPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.4f),
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable {
                                        selectedTargetId = id
                                        if (rawTextContent.isNotBlank()) {
                                            viewModel.previewImportJson(rawTextContent, id)
                                        }
                                    }
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = label,
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        color = if (isSelected) GoldLight else MaterialTheme.colorScheme.onSurfaceVariant,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
                                    )
                                )
                            }
                        }
                    }
                }
            }

            // STEP 2: PICK FILE OR PASTE RAW CONTENT
            item {
                Column {
                    Text(
                        text = "2. Select File from Device or Paste JSON/CSV",
                        style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = GoldLight)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = { filePickerLauncher.launch("*/*") },
                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = Color(0xFF1A1200)),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.FileUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (selectedFileName != null) "Selected: $selectedFileName" else "Pick JSON / CSV File from Storage",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = rawTextContent,
                        onValueChange = { str ->
                            rawTextContent = str
                            if (str.isNotBlank()) {
                                if (str.trim().startsWith("{") || str.trim().startsWith("[")) {
                                    viewModel.previewImportJson(str, selectedTargetId)
                                } else {
                                    val targetTitle = TARGET_DATASETS.find { it.first == selectedTargetId }?.second ?: "Dataset"
                                    viewModel.previewImportCsv(str, selectedTargetId, targetTitle)
                                }
                            }
                        },
                        label = { Text("Or Paste Raw JSON / CSV text here…") },
                        minLines = 4,
                        maxLines = 8,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = GoldPrimary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.outline
                        ),
                        textStyle = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurface),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            // STEP 3: LIVE PREVIEW & VALIDATION STATUS
            item {
                importPreview?.let { preview ->
                    Column {
                        Text(
                            text = "3. Validation & Preview",
                            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold, color = GoldLight)
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .border(
                                    1.dp,
                                    if (preview.isSuccess) EmeraldGlow.copy(alpha = 0.5f) else RubyAlert.copy(alpha = 0.5f),
                                    RoundedCornerShape(14.dp)
                                )
                                .padding(14.dp)
                        ) {
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = if (preview.isSuccess) Icons.Default.CheckCircle else Icons.Default.Error,
                                        contentDescription = null,
                                        tint = if (preview.isSuccess) EmeraldGlow else RubyAlert,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = if (preview.isSuccess) "Valid Dataset: ${preview.previewRowCount} rows parsed successfully" else "Validation Error",
                                        fontWeight = FontWeight.Bold,
                                        color = if (preview.isSuccess) EmeraldGlow else RubyAlert,
                                        fontSize = 13.5.sp
                                    )
                                }

                                if (preview.errorMessage != null) {
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Text(
                                        text = preview.errorMessage,
                                        style = MaterialTheme.typography.bodySmall.copy(color = Color(0xFFFCA5A5))
                                    )
                                }

                                if (preview.schema != null) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "Columns Detected: ${preview.schema.columns.joinToString(", ") { it.label }}",
                                        style = MaterialTheme.typography.bodySmall.copy(color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.5.sp)
                                    )

                                    Spacer(modifier = Modifier.height(14.dp))

                                    Button(
                                        onClick = {
                                            viewModel.confirmImport { success ->
                                                if (success) {
                                                    Toast.makeText(context, "Dataset imported and search re-indexed successfully!", Toast.LENGTH_LONG).show()
                                                    navController.popBackStack()
                                                } else {
                                                    Toast.makeText(context, "Failed to import dataset.", Toast.LENGTH_LONG).show()
                                                }
                                            }
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = GoldPrimary, contentColor = Color(0xFF1A1200)),
                                        shape = RoundedCornerShape(10.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Confirm & Replace Dataset (${preview.previewRowCount} rows)", fontWeight = FontWeight.Bold)
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
