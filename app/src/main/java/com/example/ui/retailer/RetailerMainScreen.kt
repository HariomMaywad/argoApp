package com.example.ui.retailer

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.theme.ForestGreenPrimary

enum class RetailerTab(val title: String, val icon: ImageVector) {
    HOME("Home", Icons.Default.Home),
    CATALOG("Catalog", Icons.Default.Search),
    ORDERS("Orders", Icons.Default.ReceiptLong),
    PASSBOOK("Passbook", Icons.Default.AccountBalanceWallet),
    PROFILE("Profile", Icons.Default.Person)
}

enum class RetailerSubScreen {
    NONE,
    CART,
    BILLS,
    REMINDERS,
    COMPANIES,
    NOTIFICATIONS
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RetailerMainScreen(
    retailer: Retailer,
    repository: AgroRepository,
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(RetailerTab.HOME) }
    var currentSubScreen by remember { mutableStateOf(RetailerSubScreen.NONE) }
    var initialCatalogCompanyFilter by remember { mutableStateOf<String?>(null) }

    val cart by repository.cart.collectAsState()
    val totalCartItems = remember(cart) { cart.values.sumOf { it.quantity } }

    val notifications by repository.notifications.collectAsState()
    val unreadNotifs = remember(notifications, retailer.id) {
        notifications.count { (it.targetRetailerId == retailer.id || it.targetRetailerId == "ALL") && !it.isRead }
    }

    Scaffold(
        bottomBar = {
            if (currentSubScreen == RetailerSubScreen.NONE) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = ForestGreenPrimary
                ) {
                    RetailerTab.values().forEach { tab ->
                        val isSelected = selectedTab == tab
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = { selectedTab = tab },
                            icon = {
                                if (tab == RetailerTab.CATALOG && totalCartItems > 0) {
                                    BadgedBox(badge = { Badge { Text("$totalCartItems") } }) {
                                        Icon(tab.icon, contentDescription = tab.title)
                                    }
                                } else {
                                    Icon(tab.icon, contentDescription = tab.title)
                                }
                            },
                            label = { Text(tab.title, fontSize = 11.sp) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = ForestGreenPrimary,
                                selectedTextColor = ForestGreenPrimary,
                                indicatorColor = ForestGreenPrimary.copy(alpha = 0.12f)
                            ),
                            modifier = Modifier.testTag("tab_${tab.name.lowercase()}")
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (currentSubScreen) {
                RetailerSubScreen.CART -> {
                    CartScreen(
                        retailer = retailer,
                        repository = repository,
                        onNavigateBack = { currentSubScreen = RetailerSubScreen.NONE },
                        onOrderPlaced = { _ ->
                            currentSubScreen = RetailerSubScreen.NONE
                            selectedTab = RetailerTab.ORDERS
                        }
                    )
                }
                RetailerSubScreen.BILLS -> {
                    RetailerBillsScreen(
                        retailer = retailer,
                        repository = repository
                    )
                }
                RetailerSubScreen.REMINDERS -> {
                    RetailerRemindersScreen(
                        retailer = retailer,
                        repository = repository
                    )
                }
                RetailerSubScreen.COMPANIES -> {
                    RetailerCompaniesScreen(
                        repository = repository,
                        onSelectCompany = { compName ->
                            initialCatalogCompanyFilter = compName
                            currentSubScreen = RetailerSubScreen.NONE
                            selectedTab = RetailerTab.CATALOG
                        }
                    )
                }
                RetailerSubScreen.NOTIFICATIONS -> {
                    RetailerNotificationsScreen(
                        retailer = retailer,
                        repository = repository,
                        onNavigateToOrders = {
                            currentSubScreen = RetailerSubScreen.NONE
                            selectedTab = RetailerTab.ORDERS
                        },
                        onNavigateToBills = {
                            currentSubScreen = RetailerSubScreen.BILLS
                        },
                        onNavigateToPassbook = {
                            currentSubScreen = RetailerSubScreen.NONE
                            selectedTab = RetailerTab.PASSBOOK
                        },
                        onNavigateToReminders = {
                            currentSubScreen = RetailerSubScreen.REMINDERS
                        }
                    )
                }
                RetailerSubScreen.NONE -> {
                    when (selectedTab) {
                        RetailerTab.HOME -> {
                            RetailerHomeScreen(
                                retailer = retailer,
                                repository = repository,
                                onNavigateToProducts = {
                                    initialCatalogCompanyFilter = null
                                    selectedTab = RetailerTab.CATALOG
                                },
                                onNavigateToOrders = { selectedTab = RetailerTab.ORDERS },
                                onNavigateToPassbook = { selectedTab = RetailerTab.PASSBOOK },
                                onNavigateToBills = { currentSubScreen = RetailerSubScreen.BILLS },
                                onNavigateToCompanies = { currentSubScreen = RetailerSubScreen.COMPANIES },
                                onNavigateToNotifications = { currentSubScreen = RetailerSubScreen.NOTIFICATIONS },
                                onNavigateToProfile = { selectedTab = RetailerTab.PROFILE },
                                onNavigateToReminders = { currentSubScreen = RetailerSubScreen.REMINDERS },
                                onLogout = onLogout
                            )
                        }
                        RetailerTab.CATALOG -> {
                            RetailerProductCatalogScreen(
                                repository = repository,
                                initialCompanyFilter = initialCatalogCompanyFilter,
                                onNavigateToCart = { currentSubScreen = RetailerSubScreen.CART }
                            )
                        }
                        RetailerTab.ORDERS -> {
                            RetailerOrdersScreen(
                                retailer = retailer,
                                repository = repository,
                                onNavigateToCatalog = { selectedTab = RetailerTab.CATALOG }
                            )
                        }
                        RetailerTab.PASSBOOK -> {
                            RetailerPassbookScreen(
                                retailer = retailer,
                                repository = repository
                            )
                        }
                        RetailerTab.PROFILE -> {
                            RetailerProfileScreen(
                                retailer = retailer,
                                repository = repository,
                                onLogout = onLogout
                            )
                        }
                    }
                }
            }
        }
    }
}
