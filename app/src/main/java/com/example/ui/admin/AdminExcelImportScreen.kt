package com.example.ui.admin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.ImportHistoryItem
import com.example.data.repository.AgroRepository
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.GoldenSun
import com.example.ui.theme.HarvestAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminExcelImportScreen(
    repository: AgroRepository,
    onNavigateToHistory: () -> Unit
) {
    val context = LocalContext.current
    val existingProducts by repository.products.collectAsState()

    // Step state: 0 = Upload / Choose file, 1 = Column Mapping, 2 = Preview & Confirm, 3 = Result Summary
    var currentStep by remember { mutableIntStateOf(0) }
    var fileName by remember { mutableStateOf("Busy_Item_Master_Export_2026.xlsx") }

    // Parsed rows
    var parsedRows by remember { mutableStateOf<List<Map<String, String>>>(emptyList()) }

    // Standard column mapping
    var columnMapping by remember {
        mutableStateOf(
            mapOf(
                "itemCode" to "Item Code",
                "itemName" to "Item Name",
                "alias" to "Alias",
                "company" to "Company",
                "category" to "Item Group",
                "subCategory" to "Sub Group",
                "unit" to "Unit",
                "packSize" to "Pack Size",
                "packing" to "Packing",
                "purchaseRate" to "Purchase Rate",
                "sellingRate" to "Selling Rate",
                "mrp" to "MRP",
                "gstPercent" to "GST Rate",
                "hsnCode" to "HSN Code",
                "barcode" to "Barcode",
                "openingStock" to "Opening Stock",
                "currentStock" to "Current Stock",
                "description" to "Description"
            )
        )
    }

    var importMode by remember { mutableStateOf("NEW_AND_UPDATE") } // "NEW_ONLY" or "NEW_AND_UPDATE"
    var stockImportMode by remember { mutableStateOf("REPLACE") } // "REPLACE" or "ADD"
    var showStockAddWarning by remember { mutableStateOf(false) }

    var lastImportResult by remember { mutableStateOf<ImportHistoryItem?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Excel Item Master Import", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = ForestGreenPrimary
                ),
                actions = {
                    TextButton(onClick = onNavigateToHistory) {
                        Icon(Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("History")
                    }
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Stepper indicator
            Surface(
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 1.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    StepChip(number = 1, title = "Upload", isActive = currentStep >= 0, isCurrent = currentStep == 0)
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.outline)
                    StepChip(number = 2, title = "Mapping", isActive = currentStep >= 1, isCurrent = currentStep == 1)
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = MaterialTheme.colorScheme.outline)
                    StepChip(number = 3, title = "Preview", isActive = currentStep >= 2, isCurrent = currentStep == 2)
                }
            }

            when (currentStep) {
                0 -> {
                    // STEP 1: FILE SELECTION & UPLOAD
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .verticalScroll(rememberScrollState())
                            .padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(64.dp)
                                        .clip(CircleShape)
                                        .background(ForestGreenPrimary.copy(alpha = 0.12f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.UploadFile,
                                        contentDescription = null,
                                        tint = ForestGreenPrimary,
                                        modifier = Modifier.size(36.dp)
                                    )
                                }

                                Spacer(modifier = Modifier.height(14.dp))

                                Text(
                                    text = "Upload Excel / CSV Item Master",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )

                                Spacer(modifier = Modifier.height(4.dp))

                                Text(
                                    text = "Compatible with BUSY Item Master Excel Exports (.xlsx, .xls, .csv)",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )

                                Spacer(modifier = Modifier.height(20.dp))

                                Button(
                                    onClick = {
                                        // Load default rich agricultural sample dataset
                                        parsedRows = generateSampleBusyExcelRows()
                                        fileName = "Busy_Agriculture_Stock_Export.xlsx"
                                        currentStep = 1
                                        Toast.makeText(context, "Loaded ${parsedRows.size} products from Busy Excel export", Toast.LENGTH_SHORT).show()
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.TableChart, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Load Sample BUSY Excel Export (10 Products)")
                                }

                                Spacer(modifier = Modifier.height(10.dp))

                                OutlinedButton(
                                    onClick = {
                                        parsedRows = generateSampleBusyExcelRows()
                                        fileName = "Custom_Distributor_Items.csv"
                                        currentStep = 1
                                    },
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.FolderOpen, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Choose CSV / Excel File from Device")
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(16.dp)) {
                                Text(
                                    text = "ℹ️ Supported BUSY Accounting Columns",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "• Item Code, Item Name, Alias, Group/Category\n• Unit, Pack Size, Packing, HSN/SAC, Barcode\n• Purchase Rate, Selling Rate, MRP, GST Rate %\n• Opening Stock, Current Stock Balance",
                                    fontSize = 12.sp,
                                    lineHeight = 20.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }

                1 -> {
                    // STEP 2: COLUMN MAPPING SCREEN
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Step 2: Column Mapping",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Map incoming Excel headers to AgroRetail fields",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            Surface(color = ForestGreenPrimary.copy(alpha = 0.1f), shape = RoundedCornerShape(6.dp)) {
                                Text(
                                    text = "${parsedRows.size} Rows",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ForestGreenPrimary,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        LazyColumn(
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            items(columnMapping.entries.toList()) { entry ->
                                Card(
                                    shape = RoundedCornerShape(8.dp),
                                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = entry.key.replaceFirstChar { it.uppercase() },
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 13.sp
                                            )
                                            Text(
                                                text = "Mapped header: ${entry.value}",
                                                fontSize = 11.sp,
                                                color = ForestGreenPrimary
                                            )
                                        }

                                        Icon(
                                            Icons.Default.CheckCircle,
                                            contentDescription = "Mapped",
                                            tint = ForestGreenPrimary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = { currentStep = 0 },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Back")
                            }

                            Button(
                                onClick = { currentStep = 2 },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                            ) {
                                Text("Next: Preview")
                            }
                        }
                    }
                }

                2 -> {
                    // STEP 3: PREVIEW, CONFLICT RESOLUTION & EXECUTE IMPORT
                    val newCount = remember(parsedRows, existingProducts) {
                        parsedRows.count { row ->
                            val code = row["Item Code"] ?: ""
                            val name = row["Item Name"] ?: ""
                            existingProducts.none { it.itemCode == code || it.itemName.equals(name, ignoreCase = true) }
                        }
                    }
                    val updateCount = parsedRows.size - newCount

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .verticalScroll(rememberScrollState())
                    ) {
                        Text(
                            text = "Step 3: Import Preview & Modes",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Review batch counts and select stock calculation behavior",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Preview Metrics Cards
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            PreviewMetric(title = "Total Rows", count = parsedRows.size, color = Color(0xFF2563EB), modifier = Modifier.weight(1f))
                            PreviewMetric(title = "New Items", count = newCount, color = ForestGreenPrimary, modifier = Modifier.weight(1f))
                            PreviewMetric(title = "To Update", count = updateCount, color = HarvestAmber, modifier = Modifier.weight(1f))
                            PreviewMetric(title = "Errors", count = 0, color = Color(0xFF16A34A), modifier = Modifier.weight(1f))
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Import Mode Selection
                        Text(text = "Choose Item Import Mode:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(6.dp))

                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    RadioButton(
                                        selected = importMode == "NEW_AND_UPDATE",
                                        onClick = { importMode = "NEW_AND_UPDATE" }
                                    )
                                    Column(modifier = Modifier.padding(start = 4.dp)) {
                                        Text(text = "Mode 2: Add New + Update Existing Items", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                        Text(text = "Recommended. Updates rates, MRP, and stock for existing items.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    RadioButton(
                                        selected = importMode == "NEW_ONLY",
                                        onClick = { importMode = "NEW_ONLY" }
                                    )
                                    Column(modifier = Modifier.padding(start = 4.dp)) {
                                        Text(text = "Mode 1: Add New Items Only", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                        Text(text = "Skips any product whose Item Code or Name already exists.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Stock Mode Selection
                        Text(text = "Choose Stock Import Behavior:", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(6.dp))

                        Card(
                            shape = RoundedCornerShape(10.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    RadioButton(
                                        selected = stockImportMode == "REPLACE",
                                        onClick = { stockImportMode = "REPLACE" }
                                    )
                                    Column(modifier = Modifier.padding(start = 4.dp)) {
                                        Text(text = "Option A: Replace Existing Stock", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                        Text(text = "Sets product stock to the exact figure in the Excel sheet.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }

                                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    RadioButton(
                                        selected = stockImportMode == "ADD",
                                        onClick = {
                                            stockImportMode = "ADD"
                                            showStockAddWarning = true
                                        }
                                    )
                                    Column(modifier = Modifier.padding(start = 4.dp)) {
                                        Text(text = "Option B: Add to Existing Stock", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                                        Text(text = "Adds the Excel quantity to current database stock.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            OutlinedButton(
                                onClick = { currentStep = 1 },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Back")
                            }

                            Button(
                                onClick = {
                                    val result = repository.executeImport(
                                        fileName = fileName,
                                        adminName = "Distributor Admin",
                                        parsedRows = parsedRows,
                                        columnMapping = columnMapping,
                                        importMode = importMode,
                                        stockImportMode = stockImportMode
                                    )
                                    lastImportResult = result
                                    currentStep = 3
                                },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Execute Import")
                            }
                        }
                    }
                }

                3 -> {
                    // STEP 4: IMPORT COMPLETED SUMMARY
                    lastImportResult?.let { result ->
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(CircleShape)
                                    .background(ForestGreenPrimary),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.Check, contentDescription = null, tint = GoldenSun, modifier = Modifier.size(36.dp))
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Text(
                                text = "Import Finished Successfully!",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Text(
                                text = "File: ${result.fileName}",
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )

                            Spacer(modifier = Modifier.height(20.dp))

                            Card(
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(text = "Import Summary Statistics", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(text = "Total Processed Rows:", fontSize = 13.sp)
                                        Text(text = "${result.totalRows}", fontWeight = FontWeight.Bold)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(text = "New Products Added:", fontSize = 13.sp)
                                        Text(text = "${result.imported}", fontWeight = FontWeight.Bold, color = ForestGreenPrimary)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(text = "Existing Products Updated:", fontSize = 13.sp)
                                        Text(text = "${result.updated}", fontWeight = FontWeight.Bold, color = HarvestAmber)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(text = "Skipped Items:", fontSize = 13.sp)
                                        Text(text = "${result.skipped}", fontWeight = FontWeight.Medium)
                                    }
                                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                        Text(text = "Errors Encountered:", fontSize = 13.sp)
                                        Text(text = "${result.errors}", fontWeight = FontWeight.Bold, color = if (result.errors > 0) Color(0xFFDC2626) else ForestGreenPrimary)
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(24.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = onNavigateToHistory,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("View History")
                                }

                                Button(
                                    onClick = { currentStep = 0 },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                                ) {
                                    Text("Import Another")
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showStockAddWarning) {
        AlertDialog(
            onDismissRequest = { showStockAddWarning = false },
            title = { Text("Warning: Add to Existing Stock") },
            text = {
                Text("Selecting this option will add the Excel quantity on top of current inventory in the app rather than overwriting it. Do you wish to proceed with additive stock mode?")
            },
            confirmButton = {
                Button(onClick = { showStockAddWarning = false }) {
                    Text("Proceed")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    stockImportMode = "REPLACE"
                    showStockAddWarning = false
                }) {
                    Text("Switch to Replace")
                }
            }
        )
    }
}

@Composable
fun StepChip(number: Int, title: String, isActive: Boolean, isCurrent: Boolean) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(if (isCurrent) ForestGreenPrimary else if (isActive) Color(0xFFDCFCE7) else MaterialTheme.colorScheme.surfaceVariant),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$number",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (isCurrent) Color.White else if (isActive) ForestGreenPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = title,
            fontSize = 12.sp,
            fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
            color = if (isCurrent) ForestGreenPrimary else MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
fun PreviewMetric(title: String, count: Int, color: Color, modifier: Modifier = Modifier) {
    Card(
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "$count", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = color)
            Text(text = title, fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

fun generateSampleBusyExcelRows(): List<Map<String, String>> {
    return listOf(
        mapOf(
            "Item Code" to "BAY-PRO-250",
            "Item Name" to "Bayer Proline 250 EC",
            "Alias" to "Proline Fungicide",
            "Company" to "Bayer CropScience",
            "Item Group" to "Fungicides",
            "Sub Group" to "Triazole",
            "Unit" to "Bottle",
            "Pack Size" to "250 ml",
            "Packing" to "Carton of 20",
            "Purchase Rate" to "620",
            "Selling Rate" to "695",
            "MRP" to "780",
            "GST Rate" to "18",
            "HSN Code" to "38089290",
            "Barcode" to "890123456011",
            "Opening Stock" to "50",
            "Current Stock" to "50",
            "Description" to "Prothioconazole 250 EC broad-spectrum systemic fungicide."
        ),
        mapOf(
            "Item Code" to "SYN-PEG-100",
            "Item Name" to "Syngenta Pegasus Insecticide",
            "Alias" to "Pegasus 50 WP",
            "Company" to "Syngenta India",
            "Item Group" to "Insecticides",
            "Sub Group" to "Mite Control",
            "Unit" to "Pkt",
            "Pack Size" to "100 gm",
            "Packing" to "Pouch Box",
            "Purchase Rate" to "780",
            "Selling Rate" to "850",
            "MRP" to "960",
            "GST Rate" to "18",
            "HSN Code" to "38089190",
            "Barcode" to "890123456012",
            "Opening Stock" to "80",
            "Current Stock" to "80",
            "Description" to "Diafenthiuron 50% WP specialized broad mite and diamondback moth control."
        ),
        mapOf(
            "Item Code" to "UPL-IRIS-1L",
            "Item Name" to "UPL Iris Herbicide",
            "Alias" to "Iris Selective",
            "Company" to "UPL Limited",
            "Item Group" to "Herbicides",
            "Sub Group" to "Soybean Weedicide",
            "Unit" to "Ltr",
            "Pack Size" to "1 Ltr",
            "Packing" to "Canister",
            "Purchase Rate" to "1100",
            "Selling Rate" to "1220",
            "MRP" to "1380",
            "GST Rate" to "18",
            "HSN Code" to "38089340",
            "Barcode" to "890123456013",
            "Opening Stock" to "45",
            "Current Stock" to "45",
            "Description" to "Sodium Acifluorfen 16.5% + Clodinafop-propargyl 8% EC."
        ),
        mapOf(
            "Item Code" to "IFF-DAP-500",
            "Item Name" to "IFFCO Nano DAP Liquid",
            "Alias" to "Nano DAP 500ml",
            "Company" to "IFFCO",
            "Item Group" to "Fertilizers",
            "Sub Group" to "Nano Phosphatic",
            "Unit" to "Bottle",
            "Pack Size" to "500 ml",
            "Packing" to "Carton of 24",
            "Purchase Rate" to "510",
            "Selling Rate" to "560",
            "MRP" to "600",
            "GST Rate" to "5",
            "HSN Code" to "31053000",
            "Barcode" to "890123456014",
            "Opening Stock" to "200",
            "Current Stock" to "200",
            "Description" to "Revolutionary nano liquid DAP fulfilling crop seed and root phosphorus needs."
        ),
        mapOf(
            "Item Code" to "COR-POT-1KG",
            "Item Name" to "Gromor SOP 00:00:50",
            "Alias" to "Sulphate of Potash",
            "Company" to "Coromandel International",
            "Item Group" to "Fertilizers",
            "Sub Group" to "Potash",
            "Unit" to "Kg",
            "Pack Size" to "1 Kg",
            "Packing" to "Pkt",
            "Purchase Rate" to "145",
            "Selling Rate" to "165",
            "MRP" to "195",
            "GST Rate" to "5",
            "HSN Code" to "31043000",
            "Barcode" to "890123456015",
            "Opening Stock" to "150",
            "Current Stock" to "150",
            "Description" to "Water soluble Potassium Sulphate fertilizer with 17.5% Sulfur for fruit size."
        ),
        mapOf(
            "Item Code" to "MAH-WH-10KG",
            "Item Name" to "Mahyco Certified Wheat Seed",
            "Alias" to "MPO-1215 Sharbati",
            "Company" to "Mahyco Seeds",
            "Item Group" to "Seeds",
            "Sub Group" to "Wheat Certified",
            "Unit" to "Bag",
            "Pack Size" to "40 Kg",
            "Packing" to "Gunny Bag",
            "Purchase Rate" to "1450",
            "Selling Rate" to "1580",
            "MRP" to "1650",
            "GST Rate" to "0",
            "HSN Code" to "10019910",
            "Barcode" to "890123456016",
            "Opening Stock" to "60",
            "Current Stock" to "60",
            "Description" to "High test weight rust resistant Sharbati wheat certified seed."
        ),
        mapOf(
            "Item Code" to "BAY-AL-500",
            "Item Name" to "Bayer Aliette Fungicide",
            "Alias" to "Fosetyl-Al",
            "Company" to "Bayer CropScience",
            "Item Group" to "Fungicides",
            "Sub Group" to "Downy Mildew",
            "Unit" to "Grams",
            "Pack Size" to "500 gm",
            "Packing" to "Box",
            "Purchase Rate" to "680",
            "Selling Rate" to "750",
            "MRP" to "840",
            "GST Rate" to "18",
            "HSN Code" to "38089290",
            "Barcode" to "890123456017",
            "Opening Stock" to "75",
            "Current Stock" to "75",
            "Description" to "Fosetyl-Al 80% WP true systemic fungicide for damping off and downy mildew."
        ),
        mapOf(
            "Item Code" to "SYN-SC-200",
            "Item Name" to "Score Fungicide",
            "Alias" to "Difenoconazole 25 EC",
            "Company" to "Syngenta India",
            "Item Group" to "Fungicides",
            "Sub Group" to "Leaf Spot",
            "Unit" to "ml",
            "Pack Size" to "250 ml",
            "Packing" to "Bottle",
            "Purchase Rate" to "890",
            "Selling Rate" to "975",
            "MRP" to "1080",
            "GST Rate" to "18",
            "HSN Code" to "38089290",
            "Barcode" to "890123456018",
            "Opening Stock" to "90",
            "Current Stock" to "90",
            "Description" to "Difenoconazole 25% EC world standard for apple scab, powdery mildew and leaf spot."
        ),
        mapOf(
            "Item Code" to "BAY-NAT-100",
            "Item Name" to "Nativo Fungicide",
            "Alias" to "Nativo 75WG",
            "Company" to "Bayer CropScience",
            "Item Group" to "Fungicides",
            "Sub Group" to "Systemic Fungicide",
            "Unit" to "Grams",
            "Pack Size" to "100 gm",
            "Packing" to "Pouch Box",
            "Purchase Rate" to "720",
            "Selling Rate" to "790",
            "MRP" to "890",
            "GST Rate" to "18",
            "HSN Code" to "38089290",
            "Barcode" to "890123456001",
            "Opening Stock" to "120",
            "Current Stock" to "30",
            "Description" to "Tebuconazole 50% + Trifloxystrobin 25% WG broad spectrum fungicide."
        ),
        mapOf(
            "Item Code" to "IFF-NANO-500",
            "Item Name" to "IFFCO Nano Urea Liquid",
            "Alias" to "Nano Urea 4% N",
            "Company" to "IFFCO",
            "Item Group" to "Fertilizers",
            "Sub Group" to "Nano Technology",
            "Unit" to "Bottle",
            "Pack Size" to "500 ml",
            "Packing" to "Carton of 24",
            "Purchase Rate" to "205",
            "Selling Rate" to "225",
            "MRP" to "240",
            "GST Rate" to "5",
            "HSN Code" to "31021000",
            "Barcode" to "890123456003",
            "Opening Stock" to "500",
            "Current Stock" to "100",
            "Description" to "Eco-friendly liquid nitrogen fertilizer that replaces 1 conventional bag of urea."
        )
    )
}
