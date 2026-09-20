package com.example.ui.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.CartItem
import com.example.data.model.Order
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatCurrency
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.GoldenSun
import com.example.ui.theme.HarvestAmber
import com.example.ui.theme.MintLight

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    retailer: Retailer,
    repository: AgroRepository,
    onNavigateBack: () -> Unit,
    onOrderPlaced: (String) -> Unit
) {
    val cart by repository.cart.collectAsState()
    var orderNotes by remember { mutableStateOf("") }
    var placedOrder by remember { mutableStateOf<Order?>(null) }
    var isPlacingOrder by remember { mutableStateOf(false) }

    val cartItems = remember(cart) { cart.values.toList() }
    val subTotal = remember(cartItems) { cartItems.sumOf { it.totalAmount } }
    val totalGst = remember(cartItems) { cartItems.sumOf { it.gstAmount } }
    val grandTotal = remember(cartItems) { cartItems.sumOf { it.grandTotal } }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Shopping Cart (${cartItems.size})", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (cartItems.isNotEmpty()) {
                        TextButton(onClick = { repository.clearCart() }) {
                            Text("Clear", color = MaterialTheme.colorScheme.error)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                    titleContentColor = ForestGreenPrimary
                )
            )
        },
        bottomBar = {
            if (cartItems.isNotEmpty()) {
                Surface(
                    color = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "Grand Total (incl. GST)",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = formatCurrency(grandTotal),
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ForestGreenPrimary
                                )
                            }

                            Button(
                                onClick = {
                                    isPlacingOrder = true
                                    val order = repository.placeOrder(retailer, orderNotes)
                                    isPlacingOrder = false
                                    placedOrder = order
                                },
                                enabled = !isPlacingOrder,
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                                modifier = Modifier
                                    .height(48.dp)
                                    .testTag("confirm_order_button")
                            ) {
                                if (isPlacingOrder) {
                                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                                } else {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Place Order", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        if (cartItems.isEmpty()) {
            EmptyStateView(
                icon = Icons.Default.RemoveShoppingCart,
                title = "Your Cart is Empty",
                message = "Add products from the catalog to place an order.",
                actionButtonText = "Browse Catalog",
                onActionClick = onNavigateBack,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            )
        } else {
            LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                items(cartItems, key = { it.product.id }) { item ->
                    CartItemCard(
                        item = item,
                        onQuantityChanged = { newQty ->
                            repository.setItemQuantity(item.product.id, newQty)
                        },
                        onRemove = {
                            repository.removeFromCart(item.product.id)
                        }
                    )
                }

                item {
                    Spacer(modifier = Modifier.height(6.dp))
                    // Order Notes
                    OutlinedTextField(
                        value = orderNotes,
                        onValueChange = { orderNotes = it },
                        label = { Text("Special Order / Transport Instructions (Optional)") },
                        placeholder = { Text("e.g. Please book via Karnal Transport, urgent delivery") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("order_notes_input"),
                        shape = RoundedCornerShape(10.dp),
                        minLines = 2
                    )
                }

                item {
                    // Bill Summary Breakdown
                    Card(
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "Price Details (${cartItems.size} items)",
                                fontWeight = FontWeight.Bold,
                                style = MaterialTheme.typography.titleSmall
                            )
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Items Subtotal", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(text = formatCurrency(subTotal), fontWeight = FontWeight.SemiBold)
                            }

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Total GST", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(text = "+ ${formatCurrency(totalGst)}", color = HarvestAmber, fontWeight = FontWeight.SemiBold)
                            }

                            Spacer(modifier = Modifier.height(10.dp))
                            HorizontalDivider()
                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = "Total Payable", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text(text = formatCurrency(grandTotal), fontWeight = FontWeight.Bold, fontSize = 18.sp, color = ForestGreenPrimary)
                            }
                        }
                    }
                }
            }
        }
    }

    // Order Success Dialog
    placedOrder?.let { order ->
        Dialog(onDismissRequest = { /* mandatory action */ }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(64.dp)
                            .clip(CircleShape)
                            .background(ForestGreenPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            tint = GoldenSun,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Order Placed Successfully!",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        color = MaterialTheme.colorScheme.surfaceVariant,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.padding(vertical = 8.dp)
                    ) {
                        Text(
                            text = "Order ID: ${order.id}",
                            fontWeight = FontWeight.Bold,
                            color = ForestGreenPrimary,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }

                    Text(
                        text = "Grand Total: ${formatCurrency(order.grandTotal)}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 16.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Your distributor has been notified. You can track live dispatch progress in My Orders.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    Button(
                        onClick = {
                            val id = order.id
                            placedOrder = null
                            onOrderPlaced(id)
                        },
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("view_placed_order_button")
                    ) {
                        Text("View My Orders")
                    }
                }
            }
        }
    }
}

@Composable
fun CartItemCard(
    item: CartItem,
    onQuantityChanged: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
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
                        text = item.product.itemName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Text(
                        text = "${item.product.company} • ${item.product.packSize}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${formatCurrency(item.product.sellingRate)} × ${item.quantity} = ${formatCurrency(item.totalAmount)}",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = ForestGreenPrimary
                    )
                }

                IconButton(onClick = onRemove) {
                    Icon(
                        Icons.Default.DeleteOutline,
                        contentDescription = "Remove",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f))
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "GST (${item.product.gstPercent}%): ${formatCurrency(item.gstAmount)}",
                    fontSize = 11.sp,
                    color = HarvestAmber
                )

                // Stepper
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = { onQuantityChanged(item.quantity - 1) },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(Icons.Default.Remove, contentDescription = "Minus", modifier = Modifier.size(14.dp))
                        }
                        Text(
                            text = "${item.quantity}",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(
                            onClick = { onQuantityChanged(item.quantity + 1) },
                            modifier = Modifier.size(30.dp)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Plus", modifier = Modifier.size(14.dp))
                        }
                    }
                }
            }
        }
    }
}
