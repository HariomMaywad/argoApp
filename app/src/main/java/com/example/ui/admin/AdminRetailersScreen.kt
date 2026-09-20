package com.example.ui.admin

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Retailer
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatCurrency
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminRetailersScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val retailers by repository.retailers.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var retailerBeingEdited by remember { mutableStateOf<Retailer?>(null) }
    var isAddingNewRetailer by remember { mutableStateOf(false) }

    val filteredRetailers = remember(retailers, searchQuery) {
        retailers.filter { ret ->
            searchQuery.isBlank() ||
            ret.businessName.contains(searchQuery, ignoreCase = true) ||
            ret.retailerName.contains(searchQuery, ignoreCase = true) ||
            ret.mobileNumber.contains(searchQuery, ignoreCase = true) ||
            ret.city.contains(searchQuery, ignoreCase = true)
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddingNewRetailer = true },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.PersonAdd, contentDescription = "Add Retailer")
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
                placeholder = { Text("Search by shop name, owner name, mobile, city...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = ForestGreenPrimary) },
                singleLine = true,
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            if (filteredRetailers.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Storefront,
                    title = "No Retailers Found",
                    message = "Add new agricultural retailers and dealers to grant access.",
                    actionButtonText = "+ Add Retailer",
                    onActionClick = { isAddingNewRetailer = true },
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 80.dp, top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredRetailers, key = { it.id }) { retailer ->
                        AdminRetailerCard(
                            retailer = retailer,
                            onEdit = { retailerBeingEdited = retailer },
                            onToggleActive = { repository.toggleRetailerActive(retailer.id) }
                        )
                    }
                }
            }
        }
    }

    if (isAddingNewRetailer || retailerBeingEdited != null) {
        RetailerFormDialog(
            initialRetailer = retailerBeingEdited ?: Retailer(),
            onDismiss = {
                isAddingNewRetailer = false
                retailerBeingEdited = null
            },
            onSave = { savedRetailer, plainPin ->
                repository.saveRetailer(savedRetailer, plainPin)
                Toast.makeText(context, "Retailer saved successfully", Toast.LENGTH_SHORT).show()
                isAddingNewRetailer = false
                retailerBeingEdited = null
            }
        )
    }
}

@Composable
fun AdminRetailerCard(
    retailer: Retailer,
    onEdit: () -> Unit,
    onToggleActive: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (retailer.isActive) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = retailer.businessName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        if (!retailer.isActive) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(color = Color(0xFFFEE2E2), shape = RoundedCornerShape(4.dp)) {
                                Text(
                                    text = "DEACTIVATED",
                                    color = Color(0xFF991B1B),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "Prop: ${retailer.retailerName} • Mob: +91 ${retailer.mobileNumber}",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "${retailer.address}, ${retailer.city}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                IconButton(onClick = onEdit) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit Retailer", tint = ForestGreenPrimary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Outstanding Balance", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        text = formatCurrency(retailer.outstandingAmount),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = if (retailer.outstandingAmount > 0) Color(0xFFDC2626) else ForestGreenPrimary
                    )
                }

                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Credit Limit", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        text = formatCurrency(retailer.creditLimit),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp
                    )
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Switch(
                        checked = retailer.isActive,
                        onCheckedChange = { onToggleActive() },
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun RetailerFormDialog(
    initialRetailer: Retailer,
    onDismiss: () -> Unit,
    onSave: (Retailer, String?) -> Unit
) {
    var businessName by remember { mutableStateOf(initialRetailer.businessName) }
    var retailerName by remember { mutableStateOf(initialRetailer.retailerName) }
    var mobileNumber by remember { mutableStateOf(initialRetailer.mobileNumber) }
    var pin by remember { mutableStateOf("") }
    var address by remember { mutableStateOf(initialRetailer.address) }
    var city by remember { mutableStateOf(initialRetailer.city) }
    var state by remember { mutableStateOf(initialRetailer.state) }
    var gstNumber by remember { mutableStateOf(initialRetailer.gstNumber) }
    var creditLimit by remember { mutableStateOf(if (initialRetailer.creditLimit > 0) initialRetailer.creditLimit.toString() else "100000") }
    var outstandingAmount by remember { mutableStateOf(initialRetailer.outstandingAmount.toString()) }
    var isActive by remember { mutableStateOf(initialRetailer.isActive) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
                .padding(4.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (initialRetailer.id.isBlank()) "Register New Retailer" else "Edit Retailer",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 6.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = businessName,
                        onValueChange = { businessName = it },
                        label = { Text("Business / Shop Name *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = retailerName,
                        onValueChange = { retailerName = it },
                        label = { Text("Owner / Retailer Name *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = mobileNumber,
                        onValueChange = { if (it.length <= 10 && it.all { c -> c.isDigit() }) mobileNumber = it },
                        label = { Text("Registered Mobile Number (10 digits) *") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = pin,
                        onValueChange = { if (it.length <= 6 && it.all { c -> c.isDigit() }) pin = it },
                        label = { Text(if (initialRetailer.id.isBlank()) "Set Security PIN (4-6 digits) *" else "Reset PIN (Leave blank to keep current)") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = creditLimit,
                            onValueChange = { creditLimit = it },
                            label = { Text("Credit Limit (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = outstandingAmount,
                            onValueChange = { outstandingAmount = it },
                            label = { Text("Opening Outstanding (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = gstNumber,
                        onValueChange = { gstNumber = it.uppercase() },
                        label = { Text("GSTIN Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = address,
                        onValueChange = { address = it },
                        label = { Text("Shop Address") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = city,
                            onValueChange = { city = it },
                            label = { Text("City / Mandi") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = state,
                            onValueChange = { state = it },
                            label = { Text("State") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Switch(checked = isActive, onCheckedChange = { isActive = it })
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = if (isActive) "Active (Allowed to Login & Order)" else "Deactivated")
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            if (businessName.isBlank() || mobileNumber.length != 10) return@Button
                            val updated = initialRetailer.copy(
                                businessName = businessName.trim(),
                                retailerName = retailerName.trim(),
                                mobileNumber = mobileNumber.trim(),
                                address = address.trim(),
                                city = city.trim(),
                                state = state.trim(),
                                gstNumber = gstNumber.trim(),
                                creditLimit = creditLimit.toDoubleOrNull() ?: 0.0,
                                outstandingAmount = outstandingAmount.toDoubleOrNull() ?: 0.0,
                                isActive = isActive
                            )
                            onSave(updated, if (pin.isNotBlank()) pin else null)
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Save Retailer")
                    }
                }
            }
        }
    }
}
