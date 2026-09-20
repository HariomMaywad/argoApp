package com.example.ui.admin

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.data.model.Company
import com.example.data.model.Product
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatCurrency
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber
import com.example.util.AgroImagePresets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminProductsScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val products by repository.products.collectAsState()
    val companies by repository.companies.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("All") }
    var showOnlyActive by remember { mutableStateOf(false) }

    var productBeingEdited by remember { mutableStateOf<Product?>(null) }
    var isAddingNewProduct by remember { mutableStateOf(false) }
    var productForStockUpdate by remember { mutableStateOf<Product?>(null) }

    val filteredProducts = remember(products, searchQuery, selectedCategory, showOnlyActive) {
        products.filter { prod ->
            (!showOnlyActive || prod.isActive) &&
            (selectedCategory == "All" || prod.category.equals(selectedCategory, ignoreCase = true)) &&
            (searchQuery.isBlank() ||
                prod.itemName.contains(searchQuery, ignoreCase = true) ||
                prod.itemCode.contains(searchQuery, ignoreCase = true) ||
                prod.company.contains(searchQuery, ignoreCase = true) ||
                prod.barcode.contains(searchQuery, ignoreCase = true) ||
                prod.alias.contains(searchQuery, ignoreCase = true)
            )
        }
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddingNewProduct = true },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White,
                modifier = Modifier.testTag("admin_add_product_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Product")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Search & Active filter row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search by name, code, company...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = ForestGreenPrimary) },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                FilterChip(
                    selected = showOnlyActive,
                    onClick = { showOnlyActive = !showOnlyActive },
                    label = { Text(if (showOnlyActive) "Active" else "All") }
                )
            }

            if (filteredProducts.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Inventory2,
                    title = "No Products Matching",
                    message = "No products found matching your search. Tap '+' to create a new product.",
                    actionButtonText = "+ Add New Product",
                    onActionClick = { isAddingNewProduct = true },
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 84.dp, top = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredProducts, key = { it.id }) { product ->
                        AdminProductCard(
                            product = product,
                            onEdit = { productBeingEdited = product },
                            onStockUpdate = { productForStockUpdate = product },
                            onToggleActive = { repository.toggleProductActive(product.id) },
                            onDelete = {
                                repository.deleteProduct(product.id)
                                Toast.makeText(context, "Product removed", Toast.LENGTH_SHORT).show()
                            }
                        )
                    }
                }
            }
        }
    }

    // Add / Edit Product Dialog
    if (isAddingNewProduct || productBeingEdited != null) {
        ProductFormDialog(
            initialProduct = productBeingEdited ?: Product(),
            companies = companies,
            onDismiss = {
                isAddingNewProduct = false
                productBeingEdited = null
            },
            onSave = { savedProduct ->
                repository.saveProduct(savedProduct)
                Toast.makeText(context, "Product saved successfully", Toast.LENGTH_SHORT).show()
                isAddingNewProduct = false
                productBeingEdited = null
            }
        )
    }

    // Quick Stock Adjustment Dialog
    productForStockUpdate?.let { product ->
        QuickStockDialog(
            product = product,
            onDismiss = { productForStockUpdate = null },
            onSaveStock = { newStock ->
                repository.updateStock(product.id, newStock)
                Toast.makeText(context, "Stock updated to $newStock", Toast.LENGTH_SHORT).show()
                productForStockUpdate = null
            }
        )
    }
}

@Composable
fun AdminProductCard(
    product: Product,
    onEdit: () -> Unit,
    onStockUpdate: () -> Unit,
    onToggleActive: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (product.isActive) MaterialTheme.colorScheme.surface else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
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
                            text = product.itemName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        if (!product.isActive) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = Color(0xFFFEE2E2),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "INACTIVE",
                                    color = Color(0xFF991B1B),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Text(
                        text = "Code: ${product.itemCode} • ${product.company} • ${product.packSize}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                // Quick Stock pill (Clickable to modify)
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (product.currentStock > 0) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
                    onClick = onStockUpdate
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Stock: ${product.currentStock.toInt()} ${product.unit}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (product.currentStock > 0) Color(0xFF15803D) else Color(0xFFB91C1C)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(Icons.Default.Edit, contentDescription = "Edit Stock", modifier = Modifier.size(12.dp), tint = Color(0xFF15803D))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Pricing details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Selling: ${formatCurrency(product.sellingRate)} (+${product.gstPercent}% GST)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ForestGreenPrimary
                )
                Text(
                    text = "Purchase: ${formatCurrency(product.purchaseRate)} • MRP: ${formatCurrency(product.mrp)}",
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
            Spacer(modifier = Modifier.height(4.dp))

            // Action row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Switch(
                        checked = product.isActive,
                        onCheckedChange = { onToggleActive() },
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (product.isActive) "Active in Catalog" else "Hidden from Retailers",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Row {
                    IconButton(onClick = onEdit) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Product", tint = ForestGreenPrimary)
                    }
                    IconButton(onClick = onDelete) {
                        Icon(Icons.Default.DeleteOutline, contentDescription = "Delete Product", tint = MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
fun ProductFormDialog(
    initialProduct: Product,
    companies: List<Company>,
    onDismiss: () -> Unit,
    onSave: (Product) -> Unit
) {
    var itemCode by remember { mutableStateOf(initialProduct.itemCode) }
    var itemName by remember { mutableStateOf(initialProduct.itemName) }
    var alias by remember { mutableStateOf(initialProduct.alias) }
    var company by remember { mutableStateOf(initialProduct.company) }
    var category by remember { mutableStateOf(initialProduct.category.ifBlank { "Fungicides" }) }
    var subCategory by remember { mutableStateOf(initialProduct.subCategory) }
    var unit by remember { mutableStateOf(initialProduct.unit) }
    var packSize by remember { mutableStateOf(initialProduct.packSize) }
    var packing by remember { mutableStateOf(initialProduct.packing) }
    var purchaseRate by remember { mutableStateOf(if (initialProduct.purchaseRate > 0) initialProduct.purchaseRate.toString() else "") }
    var sellingRate by remember { mutableStateOf(if (initialProduct.sellingRate > 0) initialProduct.sellingRate.toString() else "") }
    var mrp by remember { mutableStateOf(if (initialProduct.mrp > 0) initialProduct.mrp.toString() else "") }
    var gstPercent by remember { mutableStateOf(initialProduct.gstPercent.toString()) }
    var hsnCode by remember { mutableStateOf(initialProduct.hsnCode) }
    var barcode by remember { mutableStateOf(initialProduct.barcode) }
    var openingStock by remember { mutableStateOf(initialProduct.openingStock.toString()) }
    var currentStock by remember { mutableStateOf(initialProduct.currentStock.toString()) }
    var description by remember { mutableStateOf(initialProduct.description) }
    var isActive by remember { mutableStateOf(initialProduct.isActive) }
    var imageUrl by remember { mutableStateOf(initialProduct.imageUrl) }

    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri ->
        if (uri != null) {
            imageUrl = uri.toString()
        }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.94f)
                .padding(4.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (initialProduct.id.isBlank()) "Add New Product" else "Edit Product",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Item Picture Upload Section
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(
                                text = "PRODUCT PACKAGING PHOTO",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = ForestGreenPrimary,
                                letterSpacing = 0.5.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                val resolvedPreview = if (imageUrl.isNotBlank()) imageUrl else AgroImagePresets.getAutomaticProductPhoto(category, itemName)
                                Box(
                                    modifier = Modifier
                                        .size(72.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color.White),
                                    contentAlignment = Alignment.Center
                                ) {
                                    AsyncImage(
                                        model = resolvedPreview,
                                        contentDescription = "Product preview",
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Button(
                                        onClick = {
                                            photoPickerLauncher.launch(
                                                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                            )
                                        },
                                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                                        shape = RoundedCornerShape(6.dp),
                                        modifier = Modifier.fillMaxWidth()
                                    ) {
                                        Icon(Icons.Default.AddPhotoAlternate, contentDescription = null, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Upload from Gallery", fontSize = 12.sp)
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        OutlinedButton(
                                            onClick = {
                                                imageUrl = AgroImagePresets.getAutomaticProductPhoto(category, itemName)
                                            },
                                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                            shape = RoundedCornerShape(6.dp),
                                            modifier = Modifier.weight(1f)
                                        ) {
                                            Icon(Icons.Default.AutoFixHigh, contentDescription = null, modifier = Modifier.size(14.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Auto Photo", fontSize = 11.sp)
                                        }
                                        if (imageUrl.isNotBlank()) {
                                            OutlinedButton(
                                                onClick = { imageUrl = "" },
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                                shape = RoundedCornerShape(6.dp)
                                            ) {
                                                Icon(Icons.Default.Clear, contentDescription = null, modifier = Modifier.size(14.dp))
                                            }
                                        }
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            OutlinedTextField(
                                value = imageUrl,
                                onValueChange = { imageUrl = it },
                                label = { Text("Or Image URL / Content Link") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }

                    OutlinedTextField(
                        value = itemName,
                        onValueChange = { itemName = it },
                        label = { Text("Item Name *") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = itemCode,
                            onValueChange = { itemCode = it },
                            label = { Text("Item Code") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = alias,
                            onValueChange = { alias = it },
                            label = { Text("Alias / Tag") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = company,
                            onValueChange = { company = it },
                            label = { Text("Company / Brand *") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = category,
                            onValueChange = { category = it },
                            label = { Text("Category / Group") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = packSize,
                            onValueChange = { packSize = it },
                            label = { Text("Pack Size (e.g. 1 Ltr)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = unit,
                            onValueChange = { unit = it },
                            label = { Text("Unit (e.g. Bottle)") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = sellingRate,
                            onValueChange = { sellingRate = it },
                            label = { Text("Selling Rate (₹) *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = mrp,
                            onValueChange = { mrp = it },
                            label = { Text("MRP (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = purchaseRate,
                            onValueChange = { purchaseRate = it },
                            label = { Text("Purchase Rate (₹)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = gstPercent,
                            onValueChange = { gstPercent = it },
                            label = { Text("GST % (e.g. 18)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        OutlinedTextField(
                            value = currentStock,
                            onValueChange = { currentStock = it },
                            label = { Text("Current Stock") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = hsnCode,
                            onValueChange = { hsnCode = it },
                            label = { Text("HSN / SAC") },
                            modifier = Modifier.weight(1f),
                            singleLine = true
                        )
                    }

                    OutlinedTextField(
                        value = barcode,
                        onValueChange = { barcode = it },
                        label = { Text("Barcode / EAN") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Product Description / Technical Formulation") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2
                    )

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Switch(checked = isActive, onCheckedChange = { isActive = it })
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = if (isActive) "Active (Visible to Retailers)" else "Inactive (Hidden)")
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }

                    Button(
                        onClick = {
                            if (itemName.isBlank()) return@Button
                            val resolvedImage = if (imageUrl.isNotBlank()) {
                                imageUrl.trim()
                            } else {
                                AgroImagePresets.getAutomaticProductPhoto(category.trim(), itemName.trim())
                            }
                            val prod = initialProduct.copy(
                                itemCode = if (itemCode.isNotBlank()) itemCode else "ITM-${(1000..9999).random()}",
                                itemName = itemName.trim(),
                                alias = alias.trim(),
                                company = company.trim(),
                                category = category.trim(),
                                subCategory = subCategory.trim(),
                                unit = unit.trim(),
                                packSize = packSize.trim(),
                                packing = packing.trim(),
                                purchaseRate = purchaseRate.toDoubleOrNull() ?: 0.0,
                                sellingRate = sellingRate.toDoubleOrNull() ?: 0.0,
                                mrp = mrp.toDoubleOrNull() ?: 0.0,
                                gstPercent = gstPercent.toDoubleOrNull() ?: 18.0,
                                hsnCode = hsnCode.trim(),
                                barcode = barcode.trim(),
                                openingStock = openingStock.toDoubleOrNull() ?: 0.0,
                                currentStock = currentStock.toDoubleOrNull() ?: 0.0,
                                description = description.trim(),
                                isActive = isActive,
                                imageUrl = resolvedImage
                            )
                            onSave(prod)
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Save Product")
                    }
                }
            }
        }
    }
}

@Composable
fun QuickStockDialog(
    product: Product,
    onDismiss: () -> Unit,
    onSaveStock: (Double) -> Unit
) {
    var stockValue by remember { mutableStateOf(product.currentStock.toInt().toString()) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.padding(12.dp)
        ) {
            Column(modifier = Modifier.padding(18.dp)) {
                Text(text = "Update Current Stock", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text(text = product.itemName, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = stockValue,
                    onValueChange = { if (it.all { c -> c.isDigit() || c == '.' }) stockValue = it },
                    label = { Text("Available Stock (${product.unit})") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(16.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            val newStock = stockValue.toDoubleOrNull() ?: product.currentStock
                            onSaveStock(newStock)
                        },
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                    ) {
                        Text("Update")
                    }
                }
            }
        }
    }
}
