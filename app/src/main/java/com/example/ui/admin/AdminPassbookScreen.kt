package com.example.ui.admin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.PassbookEntry
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDateShort
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPassbookScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val retailers by repository.retailers.collectAsState()
    val entries by repository.passbookEntries.collectAsState()
    val statements by repository.statements.collectAsState()

    var selectedTabIndex by remember { mutableIntStateOf(0) } // 0 = Passbook Ledger, 1 = Uploaded Statements
    var isAddingEntry by remember { mutableStateOf(false) }
    var isUploadingStatement by remember { mutableStateOf(false) }

    var selectedRetailerFilter by remember { mutableStateOf<Retailer?>(null) }
    var expandedRetailerFilter by remember { mutableStateOf(false) }

    val filteredEntries = remember(entries, selectedRetailerFilter) {
        val list = if (selectedRetailerFilter == null) entries
        else entries.filter { it.retailerId == selectedRetailerFilter?.id }
        list.sortedByDescending { it.date }
    }

    val filteredStatements = remember(statements, selectedRetailerFilter) {
        val list = if (selectedRetailerFilter == null) statements
        else statements.filter { it.retailerId == selectedRetailerFilter?.id }
        list.sortedByDescending { it.uploadedAt }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    if (selectedTabIndex == 0) isAddingEntry = true
                    else isUploadingStatement = true
                },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White
            ) {
                Icon(
                    imageVector = if (selectedTabIndex == 0) Icons.Default.PostAdd else Icons.Default.UploadFile,
                    contentDescription = "Add"
                )
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Retailer Selector Filter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ExposedDropdownMenuBox(
                    expanded = expandedRetailerFilter,
                    onExpandedChange = { expandedRetailerFilter = it },
                    modifier = Modifier.weight(1f)
                ) {
                    OutlinedTextField(
                        value = selectedRetailerFilter?.businessName ?: "All Retailers (${retailers.size})",
                        onValueChange = {},
                        readOnly = true,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedRetailerFilter) },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )

                    ExposedDropdownMenu(
                        expanded = expandedRetailerFilter,
                        onDismissRequest = { expandedRetailerFilter = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("All Retailers") },
                            onClick = {
                                selectedRetailerFilter = null
                                expandedRetailerFilter = false
                            }
                        )
                        retailers.forEach { ret ->
                            DropdownMenuItem(
                                text = { Text(ret.businessName) },
                                onClick = {
                                    selectedRetailerFilter = ret
                                    expandedRetailerFilter = false
                                }
                            )
                        }
                    }
                }
            }

            TabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = MaterialTheme.colorScheme.surface,
                contentColor = ForestGreenPrimary
            ) {
                Tab(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    text = { Text("Ledger Entries (${filteredEntries.size})", fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    text = { Text("PDF Statements (${filteredStatements.size})", fontWeight = FontWeight.SemiBold) }
                )
            }

            if (selectedTabIndex == 0) {
                if (filteredEntries.isEmpty()) {
                    EmptyStateView(
                        icon = Icons.Default.MenuBook,
                        title = "No Ledger Entries",
                        message = "Post debit or credit transactions to update retailer passbook running balances.",
                        actionButtonText = "+ Add Transaction Entry",
                        onActionClick = { isAddingEntry = true },
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp, top = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        items(filteredEntries, key = { it.id }) { entry ->
                            val retName = retailers.find { it.id == entry.retailerId }?.businessName ?: "Retailer"
                            Card(
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        Column(modifier = Modifier.weight(1f)) {
                                            Text(
                                                text = entry.description,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Text(
                                                text = "$retName • Ref: ${entry.invoiceNumber} • ${formatDateShort(entry.date)}",
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }

                                        if (entry.debit > 0) {
                                            Text(
                                                text = "- ${formatCurrency(entry.debit)}",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = Color(0xFFDC2626)
                                            )
                                        } else {
                                            Text(
                                                text = "+ ${formatCurrency(entry.credit)}",
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = Color(0xFF16A34A)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(text = "Running Balance", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text(text = formatCurrency(entry.runningBalance), fontSize = 11.sp, fontWeight = FontWeight.Bold, color = ForestGreenPrimary)
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                if (filteredStatements.isEmpty()) {
                    EmptyStateView(
                        icon = Icons.Default.Description,
                        title = "No PDF Statements Uploaded",
                        message = "Upload certified monthly/quarterly ledger PDF statements for retailers.",
                        actionButtonText = "+ Upload Statement PDF",
                        onActionClick = { isUploadingStatement = true },
                        modifier = Modifier.weight(1f)
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp, top = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        items(filteredStatements, key = { it.id }) { stmt ->
                            Card(
                                shape = RoundedCornerShape(10.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(text = stmt.title, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text(text = "${stmt.retailerName} • Period: ${stmt.period}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                        Text(text = "Uploaded: ${formatDateShort(stmt.uploadedAt)}", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    Icon(Icons.Default.PictureAsPdf, contentDescription = null, tint = Color(0xFFDC2626))
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Add Ledger Transaction Dialog
    if (isAddingEntry) {
        AddLedgerEntryDialog(
            retailers = retailers,
            onDismiss = { isAddingEntry = false },
            onSave = { ret, refNum, desc, debit, credit ->
                repository.addPassbookEntry(
                    retailerId = ret.id,
                    invoiceNumber = refNum,
                    description = desc,
                    debit = debit,
                    credit = credit,
                    date = System.currentTimeMillis()
                )
                Toast.makeText(context, "Ledger entry posted successfully!", Toast.LENGTH_SHORT).show()
                isAddingEntry = false
            }
        )
    }

    // Upload Statement Dialog
    if (isUploadingStatement) {
        UploadStatementDialog(
            retailers = retailers,
            onDismiss = { isUploadingStatement = false },
            onUpload = { ret, title, period, fileName ->
                repository.uploadStatement(
                    retailerId = ret.id,
                    documentType = "Account Statement",
                    title = title,
                    period = period,
                    pdfUrl = "https://example.com/statements/$fileName",
                    fileName = fileName
                )
                Toast.makeText(context, "Statement uploaded & sent to retailer!", Toast.LENGTH_SHORT).show()
                isUploadingStatement = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddLedgerEntryDialog(
    retailers: List<Retailer>,
    onDismiss: () -> Unit,
    onSave: (Retailer, String, String, Double, Double) -> Unit
) {
    var selectedRetailer by remember { mutableStateOf<Retailer?>(retailers.firstOrNull()) }
    var refNumber by remember { mutableStateOf("RCP-${(1000..9999).random()}") }
    var description by remember { mutableStateOf("Payment Received via NEFT / Cash") }
    var entryType by remember { mutableStateOf("CREDIT") } // "CREDIT" or "DEBIT"
    var amount by remember { mutableStateOf("") }
    var expandedDropdown by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.padding(8.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = "Post Ledger Transaction", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(14.dp))

                ExposedDropdownMenuBox(
                    expanded = expandedDropdown,
                    onExpandedChange = { expandedDropdown = it }
                ) {
                    OutlinedTextField(
                        value = selectedRetailer?.businessName ?: "Select Retailer",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Retailer *") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expandedDropdown,
                        onDismissRequest = { expandedDropdown = false }
                    ) {
                        retailers.forEach { ret ->
                            DropdownMenuItem(
                                text = { Text("${ret.businessName} (Outstanding: ${formatCurrency(ret.outstandingAmount)})") },
                                onClick = {
                                    selectedRetailer = ret
                                    expandedDropdown = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    FilterChip(
                        selected = entryType == "CREDIT",
                        onClick = {
                            entryType = "CREDIT"
                            description = "Payment Received via NEFT / Cash"
                        },
                        label = { Text("Credit (Payment Received)") },
                        modifier = Modifier.weight(1f)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    FilterChip(
                        selected = entryType == "DEBIT",
                        onClick = {
                            entryType = "DEBIT"
                            description = "Goods Invoice Purchase / Debit Note"
                        },
                        label = { Text("Debit (Charge)") },
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = refNumber,
                    onValueChange = { refNumber = it },
                    label = { Text("Voucher / Ref Number") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = amount,
                    onValueChange = { if (it.all { c -> c.isDigit() || c == '.' }) amount = it },
                    label = { Text("Amount (₹) *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val amt = amount.toDoubleOrNull() ?: 0.0
                            val ret = selectedRetailer
                            if (ret != null && amt > 0) {
                                val debit = if (entryType == "DEBIT") amt else 0.0
                                val credit = if (entryType == "CREDIT") amt else 0.0
                                onSave(ret, refNumber, description, debit, credit)
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Post Entry")
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadStatementDialog(
    retailers: List<Retailer>,
    onDismiss: () -> Unit,
    onUpload: (Retailer, String, String, String) -> Unit
) {
    var selectedRetailer by remember { mutableStateOf<Retailer?>(retailers.firstOrNull()) }
    var title by remember { mutableStateOf("Quarterly Account Statement") }
    var period by remember { mutableStateOf("Q1 FY 2025-26 (Apr - Jun)") }
    var fileName by remember { mutableStateOf("Certified_Statement_Q1.pdf") }
    var expandedDropdown by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.padding(8.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = "Upload Certified Statement PDF", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(14.dp))

                ExposedDropdownMenuBox(
                    expanded = expandedDropdown,
                    onExpandedChange = { expandedDropdown = it }
                ) {
                    OutlinedTextField(
                        value = selectedRetailer?.businessName ?: "Select Retailer",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Retailer *") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedDropdown) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = expandedDropdown,
                        onDismissRequest = { expandedDropdown = false }
                    ) {
                        retailers.forEach { ret ->
                            DropdownMenuItem(
                                text = { Text(ret.businessName) },
                                onClick = {
                                    selectedRetailer = ret
                                    expandedDropdown = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Statement Title *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = period,
                    onValueChange = { period = it },
                    label = { Text("Statement Period (e.g. FY 2025-26)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = fileName,
                    onValueChange = { fileName = it },
                    label = { Text("Attach PDF Document") },
                    leadingIcon = { Icon(Icons.Default.AttachFile, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val ret = selectedRetailer
                            if (ret != null && title.isNotBlank()) {
                                onUpload(ret, title, period, fileName)
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Upload")
                    }
                }
            }
        }
    }
}
