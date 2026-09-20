package com.example.ui.retailer

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.OrderStatus
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.components.formatCurrency
import com.example.ui.components.formatDateShort
import com.example.ui.theme.*

@Composable
fun RetailerHomeScreen(
    retailer: Retailer,
    repository: AgroRepository,
    onNavigateToProducts: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToPassbook: () -> Unit,
    onNavigateToBills: () -> Unit,
    onNavigateToCompanies: () -> Unit,
    onNavigateToNotifications: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToReminders: () -> Unit,
    onLogout: () -> Unit
) {
    val orders by repository.orders.collectAsState()
    val bills by repository.bills.collectAsState()
    val statements by repository.statements.collectAsState()
    val posters by repository.posters.collectAsState()
    val notifications by repository.notifications.collectAsState()
    val cart by repository.cart.collectAsState()

    // Retailer specific metrics
    val retailerOrders = remember(orders, retailer.id) { orders.filter { it.retailerId == retailer.id } }
    val pendingOrdersCount = remember(retailerOrders) {
        retailerOrders.count { it.status == OrderStatus.Pending || it.status == OrderStatus.Confirmed || it.status == OrderStatus.Packed }
    }
    val retailerBills = remember(bills, retailer.id) { bills.filter { it.retailerId == retailer.id } }
    val latestBill = remember(retailerBills) { retailerBills.maxByOrNull { it.billDate } }

    val retailerStatements = remember(statements, retailer.id) { statements.filter { it.retailerId == retailer.id } }
    val latestStatement = remember(retailerStatements) { retailerStatements.maxByOrNull { it.uploadedAt } }

    val unreadNotifs = remember(notifications, retailer.id) {
        notifications.count { !it.isRead && (it.targetRetailerId == retailer.id || it.targetRetailerId == "ALL") }
    }

    val totalCartItems = remember(cart) { cart.values.sumOf { it.quantity } }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Header
        Surface(
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(ForestGreenPrimary),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.Eco,
                            contentDescription = null,
                            tint = GoldenSun,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "AgroRetail",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = ForestGreenPrimary
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = MintLight
                            ) {
                                Text(
                                    text = "DISTRIBUTOR",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ForestGreenPrimary,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "${retailer.businessName} (${retailer.retailerName})",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Cart icon
                    IconButton(
                        onClick = onNavigateToProducts,
                        modifier = Modifier.testTag("header_cart_button")
                    ) {
                        BadgedBox(
                            badge = {
                                if (totalCartItems > 0) {
                                    Badge(containerColor = HarvestAmber) {
                                        Text("$totalCartItems")
                                    }
                                }
                            }
                        ) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = ForestGreenPrimary)
                        }
                    }

                    // Notification bell
                    IconButton(
                        onClick = onNavigateToNotifications,
                        modifier = Modifier.testTag("header_notification_button")
                    ) {
                        BadgedBox(
                            badge = {
                                if (unreadNotifs > 0) {
                                    Badge(containerColor = Color(0xFFEF4444)) {
                                        Text("$unreadNotifs")
                                    }
                                }
                            }
                        ) {
                            Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Outstanding & Credit Limit Card
        Card(
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                ForestGreenPrimary,
                                Color(0xFF0A3C1F)
                            )
                        )
                    )
                    .padding(18.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "CURRENT OUTSTANDING",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White.copy(alpha = 0.8f),
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = formatCurrency(retailer.outstandingAmount),
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = if (retailer.outstandingAmount > retailer.creditLimit * 0.9) Color(0xFFEF4444) else GoldenSun.copy(alpha = 0.9f)
                        ) {
                            Text(
                                text = if (retailer.outstandingAmount > 0) "PAYMENT DUE" else "CLEAR",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Credit Limit",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                            Text(
                                text = formatCurrency(retailer.creditLimit),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            val available = (retailer.creditLimit - retailer.outstandingAmount).coerceAtLeast(0.0)
                            Text(
                                text = "Available Credit",
                                fontSize = 11.sp,
                                color = Color.White.copy(alpha = 0.7f)
                            )
                            Text(
                                text = formatCurrency(available),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = MintLight
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Quick Badges: Pending Orders, Latest Bill, Latest Statement
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Pending Orders
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 1.dp,
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = onNavigateToOrders)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFFEF3C7)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.LocalShipping, contentDescription = null, tint = HarvestAmber, modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(text = "$pendingOrdersCount Pending", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text(text = "Orders", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }

            // Latest Bill
            Surface(
                shape = RoundedCornerShape(10.dp),
                color = MaterialTheme.colorScheme.surface,
                shadowElevation = 1.dp,
                modifier = Modifier
                    .weight(1.1f)
                    .clickable(onClick = onNavigateToBills)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE0F2FE)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.ReceiptLong, contentDescription = null, tint = Color(0xFF0284C7), modifier = Modifier.size(18.dp))
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = latestBill?.let { formatCurrency(it.amount) } ?: "No Bills",
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            maxLines = 1
                        )
                        Text(
                            text = latestBill?.let { formatDateShort(it.billDate) } ?: "Latest Bill",
                            fontSize = 10.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            maxLines = 1
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 📢 OFFERS & NOTICES CAROUSEL
        OffersCarousel(posters = posters)

        Spacer(modifier = Modifier.height(16.dp))

        // MAIN 8 SECTIONS (as explicitly mandated in specification)
        Text(
            text = "BUSINESS SERVICES",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            letterSpacing = 0.5.sp
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Grid of services
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ServiceCard(
                    title = "Order Products",
                    subtitle = "Browse stock & rate",
                    icon = Icons.Default.ShoppingCart,
                    iconBg = Color(0xFFDCFCE7),
                    iconTint = ForestGreenPrimary,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToProducts
                )
                ServiceCard(
                    title = "My Orders",
                    subtitle = "${retailerOrders.size} total orders",
                    icon = Icons.Default.Inventory2,
                    iconBg = Color(0xFFE0E7FF),
                    iconTint = Color(0xFF4338CA),
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToOrders
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ServiceCard(
                    title = "My Passbook",
                    subtitle = "Ledger & balance",
                    icon = Icons.Default.MenuBook,
                    iconBg = Color(0xFFFEF3C7),
                    iconTint = HarvestAmber,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToPassbook
                )
                ServiceCard(
                    title = "My Bills",
                    subtitle = "Invoices & PDFs",
                    icon = Icons.Default.Description,
                    iconBg = Color(0xFFF3E8FF),
                    iconTint = Color(0xFF7E22CE),
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToBills
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ServiceCard(
                    title = "Companies",
                    subtitle = "Bayer, Syngenta, etc.",
                    icon = Icons.Default.Business,
                    iconBg = Color(0xFFCFFAFE),
                    iconTint = Color(0xFF0E7490),
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToCompanies
                )
                ServiceCard(
                    title = "Payment Reminder",
                    subtitle = "Due ₹${"%,.0f".format(retailer.outstandingAmount)}",
                    icon = Icons.Default.AccountBalanceWallet,
                    iconBg = Color(0xFFFEE2E2),
                    iconTint = Color(0xFFB91C1C),
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToReminders
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ServiceCard(
                    title = "Notifications",
                    subtitle = "$unreadNotifs new updates",
                    icon = Icons.Default.NotificationsActive,
                    iconBg = Color(0xFFF1F5F9),
                    iconTint = ForestGreenPrimary,
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToNotifications
                )
                ServiceCard(
                    title = "My Profile",
                    subtitle = retailer.city.ifBlank { "Account details" },
                    icon = Icons.Default.Person,
                    iconBg = Color(0xFFE2E8F0),
                    iconTint = Color(0xFF334155),
                    modifier = Modifier.weight(1f),
                    onClick = onNavigateToProfile
                )
            }
        }

        Spacer(modifier = Modifier.height(28.dp))
    }
}

@Composable
fun ServiceCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconBg: Color,
    iconTint: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
        modifier = modifier
            .height(84.dp)
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(42.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}
