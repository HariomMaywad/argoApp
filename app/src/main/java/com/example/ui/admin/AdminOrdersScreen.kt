package com.example.ui.admin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Order
import com.example.data.model.OrderStatus
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.OrderStatusBadge
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDate
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminOrdersScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val orders by repository.orders.collectAsState()
    val retailers by repository.retailers.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedStatusFilter by remember { mutableStateOf<OrderStatus?>(null) }
    var selectedOrderForUpdate by remember { mutableStateOf<Order?>(null) }

    val filteredOrders = remember(orders, searchQuery, selectedStatusFilter) {
        orders.filter { order ->
            (selectedStatusFilter == null || order.status == selectedStatusFilter) &&
            (searchQuery.isBlank() ||
                order.id.contains(searchQuery, ignoreCase = true) ||
                order.retailerBusinessName.contains(searchQuery, ignoreCase = true) ||
                order.retailerName.contains(searchQuery, ignoreCase = true) ||
                order.retailerMobile.contains(searchQuery, ignoreCase = true)
            )
        }.sortedByDescending { it.dateTime }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Manage Orders (${orders.size})", fontWeight = FontWeight.Bold) },
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
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by Order ID, Dealer Name, Mobile...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = ForestGreenPrimary) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            // Status Filter Chips
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedStatusFilter == null,
                        onClick = { selectedStatusFilter = null },
                        label = { Text("All (${orders.size})") }
                    )
                }
                items(OrderStatus.values()) { status ->
                    val count = orders.count { it.status == status }
                    FilterChip(
                        selected = selectedStatusFilter == status,
                        onClick = { selectedStatusFilter = status },
                        label = { Text("${status.name} ($count)") }
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            if (filteredOrders.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Inventory2,
                    title = "No Orders Match",
                    message = "No orders found matching the selected filter criteria.",
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredOrders, key = { it.id }) { order ->
                        Card(
                            shape = RoundedCornerShape(12.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { selectedOrderForUpdate = order }
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(text = order.id, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = ForestGreenPrimary)
                                        Text(text = formatDate(order.dateTime), fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                    OrderStatusBadge(status = order.status)
                                }

                                Spacer(modifier = Modifier.height(8.dp))

                                Text(
                                    text = "${order.retailerBusinessName} (${order.retailerName}) • +91 ${order.retailerMobile}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold
                                )

                                Text(
                                    text = order.items.joinToString(", ") { "${it.quantity}x ${it.itemName}" },
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 2
                                )

                                if (order.notes.isNotBlank()) {
                                    Text(
                                        text = "Retailer Note: ${order.notes}",
                                        fontSize = 11.sp,
                                        color = HarvestAmber
                                    )
                                }

                                Spacer(modifier = Modifier.height(8.dp))
                                HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                                Spacer(modifier = Modifier.height(6.dp))

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Tap to update status",
                                        fontSize = 11.sp,
                                        color = ForestGreenPrimary,
                                        fontWeight = FontWeight.Medium
                                    )

                                    Text(
                                        text = formatCurrency(order.grandTotal),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = ForestGreenPrimary
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Update Status & Notes Dialog
    selectedOrderForUpdate?.let { order ->
        var currentStatus by remember { mutableStateOf(order.status) }
        var adminNotes by remember { mutableStateOf(order.adminNotes) }

        Dialog(onDismissRequest = { selectedOrderForUpdate = null }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.padding(12.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Update Order ${order.id}", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        IconButton(onClick = { selectedOrderForUpdate = null }) {
                            Icon(Icons.Default.Close, contentDescription = "Close")
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "Retailer: ${order.retailerBusinessName}", fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Text(text = "Amount: ${formatCurrency(order.grandTotal)}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = ForestGreenPrimary)

                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = "Select Order Status:", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(6.dp))

                    OrderStatus.values().forEach { status ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { currentStatus = status }
                                .padding(vertical = 4.dp)
                        ) {
                            RadioButton(
                                selected = currentStatus == status,
                                onClick = { currentStatus = status }
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            OrderStatusBadge(status = status)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = adminNotes,
                        onValueChange = { adminNotes = it },
                        label = { Text("Admin Note / Dispatch Details (LR No, Carrier)") },
                        placeholder = { Text("e.g. Dispatched via Karnal Transport, LR #98214") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { selectedOrderForUpdate = null },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel")
                        }

                        Button(
                            onClick = {
                                repository.updateOrderStatus(order.id, currentStatus, adminNotes)
                                Toast.makeText(context, "Order updated & notification sent to retailer!", Toast.LENGTH_SHORT).show()
                                selectedOrderForUpdate = null
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                        ) {
                            Text("Save & Notify")
                        }
                    }
                }
            }
        }
    }
}
