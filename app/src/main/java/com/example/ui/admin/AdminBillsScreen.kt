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
import com.example.data.model.Bill
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDateShort
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminBillsScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val bills by repository.bills.collectAsState()
    val retailers by repository.retailers.collectAsState()

    var isAddingBill by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }

    val filteredBills = remember(bills, searchQuery) {
        bills.filter { b ->
            searchQuery.isBlank() ||
            b.billNumber.contains(searchQuery, ignoreCase = true) ||
            b.retailerName.contains(searchQuery, ignoreCase = true)
        }.sortedByDescending { it.billDate }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddingBill = true },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.Upload, contentDescription = "Upload Bill")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by Bill # or Retailer...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = ForestGreenPrimary) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            if (filteredBills.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Receipt,
                    title = "No Invoices Uploaded",
                    message = "Upload GST invoices for retailers. They will automatically be debited to their passbook.",
                    actionButtonText = "+ Upload New Invoice",
                    onActionClick = { isAddingBill = true },
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp, top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredBills, key = { it.id }) { bill ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        Icons.Default.PictureAsPdf,
                                        contentDescription = null,
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(28.dp)
                                    )

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column {
                                        Text(
                                            text = "Invoice #${bill.billNumber}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = "${bill.retailerName} • ${formatDateShort(bill.billDate)}",
                                            fontSize = 12.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = formatCurrency(bill.amount),
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = ForestGreenPrimary
                                        )
                                    }
                                }

                                IconButton(onClick = {
                                    repository.deleteBill(bill.id)
                                    Toast.makeText(context, "Bill deleted", Toast.LENGTH_SHORT).show()
                                }) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (isAddingBill) {
        UploadBillDialog(
            retailers = retailers,
            onDismiss = { isAddingBill = false },
            onUpload = { retailer, billNumber, amount, fileName ->
                repository.uploadBill(
                    retailerId = retailer.id,
                    billNumber = billNumber,
                    billDate = System.currentTimeMillis(),
                    amount = amount,
                    pdfUrl = "https://example.com/bills/$billNumber.pdf",
                    fileName = fileName
                )
                Toast.makeText(context, "Invoice uploaded, debited to passbook & notification sent!", Toast.LENGTH_LONG).show()
                isAddingBill = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UploadBillDialog(
    retailers: List<Retailer>,
    onDismiss: () -> Unit,
    onUpload: (Retailer, String, Double, String) -> Unit
) {
    var selectedRetailer by remember { mutableStateOf<Retailer?>(retailers.firstOrNull()) }
    var billNumber by remember { mutableStateOf("INV-2026-${(1000..9999).random()}") }
    var amount by remember { mutableStateOf("") }
    var fileName by remember { mutableStateOf("GST_Tax_Invoice_${billNumber}.pdf") }
    var expandedRetailerDropdown by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.padding(8.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(text = "Upload GST Tax Invoice", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Spacer(modifier = Modifier.height(14.dp))

                // Retailer Selection Dropdown
                ExposedDropdownMenuBox(
                    expanded = expandedRetailerDropdown,
                    onExpandedChange = { expandedRetailerDropdown = it }
                ) {
                    OutlinedTextField(
                        value = selectedRetailer?.businessName ?: "Select Retailer",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Select Retailer *") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedRetailerDropdown) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor()
                    )

                    ExposedDropdownMenu(
                        expanded = expandedRetailerDropdown,
                        onDismissRequest = { expandedRetailerDropdown = false }
                    ) {
                        retailers.forEach { ret ->
                            DropdownMenuItem(
                                text = { Text("${ret.businessName} (${ret.retailerName})") },
                                onClick = {
                                    selectedRetailer = ret
                                    expandedRetailerDropdown = false
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = billNumber,
                    onValueChange = { billNumber = it },
                    label = { Text("Invoice / Bill Number *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = amount,
                    onValueChange = { if (it.all { c -> c.isDigit() || c == '.' }) amount = it },
                    label = { Text("Invoice Grand Total (₹) *") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = fileName,
                    onValueChange = { fileName = it },
                    label = { Text("Attach Invoice PDF Document") },
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
                            val amt = amount.toDoubleOrNull() ?: 0.0
                            val ret = selectedRetailer
                            if (ret != null && billNumber.isNotBlank() && amt > 0) {
                                onUpload(ret, billNumber, amt, fileName)
                            }
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Upload & Post")
                    }
                }
            }
        }
    }
}
