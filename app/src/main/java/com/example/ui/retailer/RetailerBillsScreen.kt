package com.example.ui.retailer

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
fun RetailerBillsScreen(
    retailer: Retailer,
    repository: AgroRepository
) {
    val context = LocalContext.current
    val bills by repository.bills.collectAsState()
    var selectedBillForPreview by remember { mutableStateOf<Bill?>(null) }

    val retailerBills = remember(bills, retailer.id) {
        bills.filter { it.retailerId == retailer.id }.sortedByDescending { it.billDate }
    }

    val totalBilledAmount = remember(retailerBills) { retailerBills.sumOf { it.amount } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Invoices & Bills (${retailerBills.size})", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = ForestGreenPrimary
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Summary Card
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Total Invoices Issued",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "${retailerBills.size} Invoices",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "Total Invoiced Value",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = formatCurrency(totalBilledAmount),
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ForestGreenPrimary
                        )
                    }
                }
            }

            if (retailerBills.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Receipt,
                    title = "No Invoices Uploaded",
                    message = "When your distributor uploads GST tax invoices, they will appear here for viewing and downloading.",
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(retailerBills, key = { it.id }) { bill ->
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
                                Row(modifier = Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(42.dp)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(Color(0xFFFEF2F2)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.PictureAsPdf,
                                            contentDescription = null,
                                            tint = Color(0xFFDC2626),
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column {
                                        Text(
                                            text = "Invoice #${bill.billNumber}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp
                                        )
                                        Text(
                                            text = "Date: ${formatDateShort(bill.billDate)}",
                                            fontSize = 11.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Text(
                                            text = formatCurrency(bill.amount),
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = ForestGreenPrimary
                                        )
                                    }
                                }

                                Row {
                                    IconButton(onClick = { selectedBillForPreview = bill }) {
                                        Icon(
                                            imageVector = Icons.Default.Visibility,
                                            contentDescription = "Preview",
                                            tint = ForestGreenPrimary
                                        )
                                    }
                                    IconButton(onClick = {
                                        Toast.makeText(context, "Downloaded Invoice ${bill.billNumber}.pdf", Toast.LENGTH_SHORT).show()
                                    }) {
                                        Icon(
                                            imageVector = Icons.Default.Download,
                                            contentDescription = "Download",
                                            tint = HarvestAmber
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

    // Bill Preview Dialog
    selectedBillForPreview?.let { bill ->
        Dialog(onDismissRequest = { selectedBillForPreview = null }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Tax Invoice Preview",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                        IconButton(onClick = { selectedBillForPreview = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(text = "Invoice Number: ${bill.billNumber}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text(text = "Invoice Date: ${formatDateShort(bill.billDate)}", fontSize = 12.sp)
                            Text(text = "Retailer: ${bill.retailerName}", fontSize = 12.sp)
                            Text(text = "Total Invoiced Amount: ${formatCurrency(bill.amount)}", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = ForestGreenPrimary)
                            if (bill.originalFileName.isNotBlank()) {
                                Text(text = "File: ${bill.originalFileName}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Simulated PDF Document View
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(160.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFFF1F5F9)),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.PictureAsPdf,
                                contentDescription = null,
                                tint = Color(0xFFDC2626),
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "PDF Document Ready",
                                fontWeight = FontWeight.Medium,
                                fontSize = 13.sp,
                                color = Color(0xFF334155)
                            )
                            Text(
                                text = "${bill.originalFileName.ifBlank { "Invoice_${bill.billNumber}.pdf" }}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { selectedBillForPreview = null },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("Close")
                        }

                        Button(
                            onClick = {
                                Toast.makeText(context, "Invoice ${bill.billNumber}.pdf saved to Downloads", Toast.LENGTH_SHORT).show()
                                selectedBillForPreview = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(8.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Download")
                        }
                    }
                }
            }
        }
    }
}
