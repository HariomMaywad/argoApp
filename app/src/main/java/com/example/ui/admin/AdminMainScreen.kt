package com.example.ui.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.AdminUser
import com.example.data.model.OrderStatus
import com.example.data.repository.AgroRepository
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.GoldenSun
import com.example.ui.theme.HarvestAmber

import kotlinx.coroutines.launch

enum class AdminNavigationSection(val title: String, val icon: ImageVector) {
    DASHBOARD("Dashboard", Icons.Default.Dashboard),
    PRODUCTS("Products", Icons.Default.Inventory2),
    ORDERS("Orders", Icons.Default.LocalShipping),
    RETAILERS("Retailers", Icons.Default.Storefront),
    EXCEL_IMPORT("Excel Import", Icons.Default.UploadFile),
    IMPORT_HISTORY("Import History", Icons.Default.History),
    BILLS("Bills", Icons.Default.Receipt),
    PASSBOOK("Passbook", Icons.Default.MenuBook),
    POSTERS("Posters", Icons.Default.Campaign),
    REMINDERS("Reminders", Icons.Default.NotificationsActive),
    NOTIFICATIONS("Broadcast", Icons.Default.Send),
    COMPANIES("Companies", Icons.Default.Business),
    SETTINGS("Profile & Settings", Icons.Default.ManageAccounts)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminMainScreen(
    admin: AdminUser,
    repository: AgroRepository,
    onLogout: () -> Unit
) {
    val orders by repository.orders.collectAsState()
    val pendingCount = remember(orders) { orders.count { it.status == OrderStatus.Pending } }

    var currentSection by remember { mutableStateOf(AdminNavigationSection.DASHBOARD) }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            ModalDrawerSheet(
                modifier = Modifier.width(300.dp)
            ) {
                // Admin Drawer Header
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(ForestGreenPrimary)
                        .padding(20.dp)
                ) {
                    Column {
                        Icon(Icons.Default.AdminPanelSettings, contentDescription = null, tint = GoldenSun, modifier = Modifier.size(36.dp))
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(text = admin.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                        Text(text = "Administrator • ${admin.email}", fontSize = 12.sp, color = Color.White.copy(alpha = 0.8f))
                        Spacer(modifier = Modifier.height(6.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = Color.White.copy(alpha = 0.2f),
                            modifier = Modifier.clickable {
                                currentSection = AdminNavigationSection.SETTINGS
                                coroutineScope.launch { drawerState.close() }
                            }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null, tint = GoldenSun, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Edit Firm Profile", fontSize = 11.sp, color = Color.White, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                AdminNavigationSection.values().forEach { section ->
                    val isSelected = currentSection == section
                    NavigationDrawerItem(
                        icon = {
                            if (section == AdminNavigationSection.ORDERS && pendingCount > 0) {
                                BadgedBox(badge = { Badge { Text("$pendingCount") } }) {
                                    Icon(section.icon, contentDescription = null)
                                }
                            } else {
                                Icon(section.icon, contentDescription = null)
                            }
                        },
                        label = { Text(section.title) },
                        selected = isSelected,
                        onClick = {
                            currentSection = section
                            coroutineScope.launch { drawerState.close() }
                        },
                        colors = NavigationDrawerItemDefaults.colors(
                            selectedContainerColor = ForestGreenPrimary.copy(alpha = 0.12f),
                            selectedIconColor = ForestGreenPrimary,
                            selectedTextColor = ForestGreenPrimary
                        ),
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.weight(1f))
                HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp))

                NavigationDrawerItem(
                    icon = { Icon(Icons.Default.Logout, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                    label = { Text("Logout", color = MaterialTheme.colorScheme.error) },
                    selected = false,
                    onClick = onLogout,
                    modifier = Modifier.padding(12.dp)
                )
            }
        }
    ) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = currentSection.title,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = { coroutineScope.launch { drawerState.open() } }) {
                            Icon(Icons.Default.Menu, contentDescription = "Menu", tint = ForestGreenPrimary)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface,
                        titleContentColor = ForestGreenPrimary
                    ),
                    actions = {
                        IconButton(onClick = { currentSection = AdminNavigationSection.SETTINGS }) {
                            Icon(Icons.Default.ManageAccounts, contentDescription = "Admin Profile", tint = ForestGreenPrimary)
                        }
                        IconButton(onClick = { currentSection = AdminNavigationSection.NOTIFICATIONS }) {
                            Icon(Icons.Default.Notifications, contentDescription = "Broadcast", tint = ForestGreenPrimary)
                        }
                        IconButton(onClick = onLogout) {
                            Icon(Icons.Default.Logout, contentDescription = "Logout", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                )
            },
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = ForestGreenPrimary
                ) {
                    val primaryTabs = listOf(
                        AdminNavigationSection.DASHBOARD,
                        AdminNavigationSection.PRODUCTS,
                        AdminNavigationSection.ORDERS,
                        AdminNavigationSection.RETAILERS,
                        AdminNavigationSection.SETTINGS
                    )

                    primaryTabs.forEach { tab ->
                        val isSelected = currentSection == tab
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { currentSection = tab },
                            icon = {
                                if (tab == AdminNavigationSection.ORDERS && pendingCount > 0) {
                                    BadgedBox(badge = { Badge { Text("$pendingCount") } }) {
                                        Icon(tab.icon, contentDescription = null)
                                    }
                                } else {
                                    Icon(tab.icon, contentDescription = null)
                                }
                            },
                            label = { Text(if (tab == AdminNavigationSection.SETTINGS) "Profile" else tab.title, fontSize = 10.sp, maxLines = 1) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ForestGreenPrimary,
                                selectedTextColor = ForestGreenPrimary,
                                indicatorColor = ForestGreenPrimary.copy(alpha = 0.12f)
                            )
                        )
                    }
                }
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
            ) {
                when (currentSection) {
                    AdminNavigationSection.DASHBOARD -> AdminDashboardScreen(
                        repository = repository,
                        onNavigateToProducts = { currentSection = AdminNavigationSection.PRODUCTS },
                        onNavigateToOrders = { currentSection = AdminNavigationSection.ORDERS },
                        onNavigateToRetailers = { currentSection = AdminNavigationSection.RETAILERS },
                        onNavigateToBills = { currentSection = AdminNavigationSection.BILLS },
                        onNavigateToPosters = { currentSection = AdminNavigationSection.POSTERS },
                        onNavigateToReminders = { currentSection = AdminNavigationSection.REMINDERS },
                        onNavigateToExcelImport = { currentSection = AdminNavigationSection.EXCEL_IMPORT },
                        onNavigateToNotifications = { currentSection = AdminNavigationSection.NOTIFICATIONS },
                        onNavigateToSettings = { currentSection = AdminNavigationSection.SETTINGS }
                    )
                    AdminNavigationSection.PRODUCTS -> AdminProductsScreen(repository = repository)
                    AdminNavigationSection.ORDERS -> AdminOrdersScreen(repository = repository)
                    AdminNavigationSection.RETAILERS -> AdminRetailersScreen(repository = repository)
                    AdminNavigationSection.EXCEL_IMPORT -> AdminExcelImportScreen(
                        repository = repository,
                        onNavigateToHistory = { currentSection = AdminNavigationSection.IMPORT_HISTORY }
                    )
                    AdminNavigationSection.IMPORT_HISTORY -> AdminImportHistoryScreen(repository = repository)
                    AdminNavigationSection.BILLS -> AdminBillsScreen(repository = repository)
                    AdminNavigationSection.PASSBOOK -> AdminPassbookScreen(repository = repository)
                    AdminNavigationSection.POSTERS -> AdminPostersScreen(repository = repository)
                    AdminNavigationSection.REMINDERS -> AdminPaymentRemindersScreen(repository = repository)
                    AdminNavigationSection.NOTIFICATIONS -> AdminNotificationsScreen(repository = repository)
                    AdminNavigationSection.COMPANIES -> AdminCompaniesScreen(repository = repository)
                    AdminNavigationSection.SETTINGS -> AdminSettingsScreen(repository = repository, onLogout = onLogout)
                }
            }
        }
    }
}
