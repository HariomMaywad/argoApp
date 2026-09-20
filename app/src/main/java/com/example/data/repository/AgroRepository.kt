package com.example.data.repository

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import com.example.data.model.*
import com.example.util.AgroImagePresets
import com.example.util.SecurityUtils
import com.google.firebase.FirebaseApp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

class AgroRepository(private val context: Context) {
    private val scope = CoroutineScope(Dispatchers.IO)
    private val prefs: SharedPreferences =
        context.getSharedPreferences("agro_retail_data_prefs", Context.MODE_PRIVATE)

    // StateFlows
    private val _retailers = MutableStateFlow<List<Retailer>>(emptyList())
    val retailers: StateFlow<List<Retailer>> = _retailers.asStateFlow()

    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    private val _companies = MutableStateFlow<List<Company>>(emptyList())
    val companies: StateFlow<List<Company>> = _companies.asStateFlow()

    private val _orders = MutableStateFlow<List<Order>>(emptyList())
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _bills = MutableStateFlow<List<Bill>>(emptyList())
    val bills: StateFlow<List<Bill>> = _bills.asStateFlow()

    private val _statements = MutableStateFlow<List<Statement>>(emptyList())
    val statements: StateFlow<List<Statement>> = _statements.asStateFlow()

    private val _passbookEntries = MutableStateFlow<List<PassbookEntry>>(emptyList())
    val passbookEntries: StateFlow<List<PassbookEntry>> = _passbookEntries.asStateFlow()

    private val _posters = MutableStateFlow<List<Poster>>(emptyList())
    val posters: StateFlow<List<Poster>> = _posters.asStateFlow()

    private val _notifications = MutableStateFlow<List<AppNotification>>(emptyList())
    val notifications: StateFlow<List<AppNotification>> = _notifications.asStateFlow()

    private val _paymentReminders = MutableStateFlow<List<PaymentReminder>>(emptyList())
    val paymentReminders: StateFlow<List<PaymentReminder>> = _paymentReminders.asStateFlow()

    private val _importHistory = MutableStateFlow<List<ImportHistoryItem>>(emptyList())
    val importHistory: StateFlow<List<ImportHistoryItem>> = _importHistory.asStateFlow()

    private val _distributorProfile = MutableStateFlow(DistributorProfile())
    val distributorProfile: StateFlow<DistributorProfile> = _distributorProfile.asStateFlow()

    // Shopping Cart (Retailer session)
    private val _cart = MutableStateFlow<Map<String, CartItem>>(emptyMap())
    val cart: StateFlow<Map<String, CartItem>> = _cart.asStateFlow()

    private var firestore: FirebaseFirestore? = null

    init {
        initFirebaseIfAvailable()
        loadLocalDataOrSeedDefaults()
    }

    private fun initFirebaseIfAvailable() {
        try {
            val apps = FirebaseApp.getApps(context)
            if (apps.isNotEmpty()) {
                firestore = FirebaseFirestore.getInstance()
                Log.d("AgroRepository", "Firebase Firestore initialized successfully")
            } else {
                Log.d("AgroRepository", "Firebase not yet configured with google-services.json, running high-performance local offline repository")
            }
        } catch (e: Exception) {
            Log.w("AgroRepository", "Firestore init skipped or unavailable: ${e.message}")
        }
    }

    // ==========================================
    // RETAILER AUTHENTICATION & LOOKUP
    // ==========================================
    fun findRetailerByMobile(mobile: String): Retailer? {
        val clean = mobile.trim()
        return _retailers.value.find { it.mobileNumber.trim() == clean }
    }

    fun verifyRetailerPin(retailer: Retailer, enteredPin: String): Boolean {
        return SecurityUtils.verifyPin(enteredPin, retailer.pinHash)
    }

    // ==========================================
    // CART OPERATIONS
    // ==========================================
    fun addToCart(product: Product, quantity: Int = 1) {
        val current = _cart.value.toMutableMap()
        val existing = current[product.id]
        val newQty = (existing?.quantity ?: 0) + quantity
        if (newQty > 0) {
            current[product.id] = CartItem(product, newQty)
        } else {
            current.remove(product.id)
        }
        _cart.value = current
    }

    fun setItemQuantity(productId: String, quantity: Int) {
        val current = _cart.value.toMutableMap()
        val existing = current[productId] ?: return
        if (quantity > 0) {
            current[productId] = existing.copy(quantity = quantity)
        } else {
            current.remove(productId)
        }
        _cart.value = current
    }

    fun removeFromCart(productId: String) {
        val current = _cart.value.toMutableMap()
        current.remove(productId)
        _cart.value = current
    }

    fun clearCart() {
        _cart.value = emptyMap()
    }

    // ==========================================
    // ORDER PLACEMENT & MANAGEMENT
    // ==========================================
    fun placeOrder(retailer: Retailer, notes: String): Order {
        val itemsMap = _cart.value
        val orderItems = itemsMap.values.map { item ->
            val sub = item.product.sellingRate * item.quantity
            val gst = sub * (item.product.gstPercent / 100.0)
            OrderItem(
                productId = item.product.id,
                itemCode = item.product.itemCode,
                itemName = item.product.itemName,
                packSize = item.product.packSize,
                quantity = item.quantity,
                rate = item.product.sellingRate,
                gstPercent = item.product.gstPercent,
                total = sub + gst,
                imageUrl = item.product.imageUrl
            )
        }

        val subTotal = orderItems.sumOf { it.rate * it.quantity }
        val gstTotal = orderItems.sumOf { (it.rate * it.quantity) * (it.gstPercent / 100.0) }
        val grandTotal = subTotal + gstTotal

        val year = Calendar.getInstance().get(Calendar.YEAR)
        val randomNum = (100000..999999).random()
        val orderId = "ORD-$year-$randomNum"

        val newOrder = Order(
            id = orderId,
            retailerId = retailer.id,
            retailerName = retailer.retailerName,
            retailerBusinessName = retailer.businessName,
            retailerMobile = retailer.mobileNumber,
            dateTime = System.currentTimeMillis(),
            items = orderItems,
            subTotal = subTotal,
            gstTotal = gstTotal,
            grandTotal = grandTotal,
            notes = notes,
            status = OrderStatus.Pending,
            updatedAt = System.currentTimeMillis()
        )

        // Add to orders list
        val updatedOrders = listOf(newOrder) + _orders.value
        _orders.value = updatedOrders
        saveOrdersToPrefs()

        // Clear cart
        clearCart()

        // Deduct current stock for ordered items
        val updatedProducts = _products.value.map { prod ->
            val ordered = orderItems.find { it.productId == prod.id }
            if (ordered != null) {
                prod.copy(currentStock = (prod.currentStock - ordered.quantity).coerceAtLeast(0.0))
            } else prod
        }
        _products.value = updatedProducts
        saveProductsToPrefs()

        // Push notification for Admin & Retailer
        sendNotification(
            title = "New Order Placed: $orderId",
            message = "Order of ₹${"%,.2f".format(grandTotal)} placed by ${retailer.businessName}",
            targetRetailerId = "ADMIN",
            linkedType = "ORDER",
            linkedId = orderId
        )

        sendNotification(
            title = "Order Confirmed: $orderId",
            message = "Your order of ₹${"%,.2f".format(grandTotal)} has been received and is Pending review.",
            targetRetailerId = retailer.id,
            linkedType = "ORDER",
            linkedId = orderId
        )

        return newOrder
    }

    fun updateOrderStatus(orderId: String, newStatus: OrderStatus, adminNotes: String = "") {
        val currentOrders = _orders.value.toMutableList()
        val index = currentOrders.indexOfFirst { it.id == orderId }
        if (index != -1) {
            val oldOrder = currentOrders[index]
            val updated = oldOrder.copy(
                status = newStatus,
                adminNotes = if (adminNotes.isNotBlank()) adminNotes else oldOrder.adminNotes,
                updatedAt = System.currentTimeMillis()
            )
            currentOrders[index] = updated
            _orders.value = currentOrders
            saveOrdersToPrefs()

            // Push notification to retailer
            sendNotification(
                title = "Order Update: $orderId",
                message = "Your order status is now: ${newStatus.name.uppercase()}",
                targetRetailerId = updated.retailerId,
                linkedType = "ORDER",
                linkedId = orderId
            )
        }
    }

    // ==========================================
    // PRODUCT MASTER MANAGEMENT
    // ==========================================
    fun saveProduct(product: Product) {
        val current = _products.value.toMutableList()
        val index = current.indexOfFirst { it.id == product.id }
        val resolvedImage = if (product.imageUrl.isNotBlank()) product.imageUrl else AgroImagePresets.getAutomaticProductPhoto(product.category, product.itemName)
        val productToSave = product.copy(imageUrl = resolvedImage)

        if (index != -1) {
            current[index] = productToSave.copy(updatedAt = System.currentTimeMillis())
        } else {
            val newProduct = productToSave.copy(
                id = if (productToSave.id.isBlank()) "prod_${System.currentTimeMillis()}_${(100..999).random()}" else productToSave.id,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            current.add(0, newProduct)
        }
        _products.value = current
        saveProductsToPrefs()
    }

    fun toggleProductActive(productId: String) {
        val current = _products.value.toMutableList()
        val index = current.indexOfFirst { it.id == productId }
        if (index != -1) {
            val prod = current[index]
            current[index] = prod.copy(isActive = !prod.isActive, updatedAt = System.currentTimeMillis())
            _products.value = current
            saveProductsToPrefs()
        }
    }

    fun deleteProduct(productId: String) {
        val current = _products.value.filter { it.id != productId }
        _products.value = current
        saveProductsToPrefs()
    }

    fun updateStock(productId: String, newStock: Double) {
        val current = _products.value.toMutableList()
        val index = current.indexOfFirst { it.id == productId }
        if (index != -1) {
            current[index] = current[index].copy(currentStock = newStock, updatedAt = System.currentTimeMillis())
            _products.value = current
            saveProductsToPrefs()
        }
    }

    // ==========================================
    // COMPANY MANAGEMENT
    // ==========================================
    fun saveCompany(company: Company) {
        val current = _companies.value.toMutableList()
        val index = current.indexOfFirst { it.id == company.id }
        if (index != -1) {
            current[index] = company
        } else {
            val newComp = company.copy(
                id = if (company.id.isBlank()) "comp_${System.currentTimeMillis()}" else company.id
            )
            current.add(newComp)
        }
        _companies.value = current
        saveCompaniesToPrefs()
    }

    fun toggleCompanyActive(companyId: String) {
        val current = _companies.value.toMutableList()
        val index = current.indexOfFirst { it.id == companyId }
        if (index != -1) {
            current[index] = current[index].copy(isActive = !current[index].isActive)
            _companies.value = current
            saveCompaniesToPrefs()
        }
    }

    // ==========================================
    // RETAILER MANAGEMENT
    // ==========================================
    fun saveRetailer(retailer: Retailer, plainPin: String? = null) {
        val current = _retailers.value.toMutableList()
        val index = current.indexOfFirst { it.id == retailer.id }
        val pinHash = if (!plainPin.isNullOrBlank()) {
            SecurityUtils.hashPin(plainPin)
        } else retailer.pinHash

        if (index != -1) {
            current[index] = retailer.copy(
                pinHash = pinHash,
                updatedAt = System.currentTimeMillis()
            )
        } else {
            val newRetailer = retailer.copy(
                id = if (retailer.id.isBlank()) "ret_${System.currentTimeMillis()}" else retailer.id,
                pinHash = pinHash,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
            current.add(newRetailer)
        }
        _retailers.value = current
        saveRetailersToPrefs()
    }

    fun toggleRetailerActive(retailerId: String) {
        val current = _retailers.value.toMutableList()
        val index = current.indexOfFirst { it.id == retailerId }
        if (index != -1) {
            current[index] = current[index].copy(isActive = !current[index].isActive, updatedAt = System.currentTimeMillis())
            _retailers.value = current
            saveRetailersToPrefs()
        }
    }

    // ==========================================
    // BILLS MODULE
    // ==========================================
    fun uploadBill(
        retailerId: String,
        billNumber: String,
        billDate: Long,
        amount: Double,
        pdfUrl: String,
        fileName: String
    ): Bill {
        val retailer = _retailers.value.find { it.id == retailerId }
        val bill = Bill(
            id = "bill_${System.currentTimeMillis()}",
            billNumber = billNumber,
            retailerId = retailerId,
            retailerName = retailer?.businessName ?: "Retailer",
            billDate = billDate,
            amount = amount,
            pdfUrl = pdfUrl,
            originalFileName = fileName,
            createdAt = System.currentTimeMillis()
        )

        _bills.value = listOf(bill) + _bills.value
        saveBillsToPrefs()

        // Also add Debit entry to Passbook & update retailer outstanding
        addPassbookEntry(
            retailerId = retailerId,
            invoiceNumber = billNumber,
            description = "Bill/Invoice: $billNumber",
            debit = amount,
            credit = 0.0
        )

        // Send Push notification
        sendNotification(
            title = "New bill uploaded",
            message = "Bill #$billNumber for ₹${"%,.2f".format(amount)} has been uploaded to your account.",
            targetRetailerId = retailerId,
            linkedType = "BILL",
            linkedId = bill.id
        )

        return bill
    }

    // ==========================================
    // PASSBOOK & STATEMENTS
    // ==========================================
    fun uploadStatement(
        retailerId: String,
        documentType: String,
        title: String,
        period: String,
        pdfUrl: String,
        fileName: String
    ): Statement {
        val retailer = _retailers.value.find { it.id == retailerId }
        val statement = Statement(
            id = "stmt_${System.currentTimeMillis()}",
            retailerId = retailerId,
            retailerName = retailer?.businessName ?: "Retailer",
            documentType = documentType,
            title = title,
            period = period,
            pdfUrl = pdfUrl,
            originalFileName = fileName,
            uploadedAt = System.currentTimeMillis()
        )

        _statements.value = listOf(statement) + _statements.value
        saveStatementsToPrefs()

        sendNotification(
            title = "New account statement uploaded",
            message = "$documentType for period $period is now available to download.",
            targetRetailerId = retailerId,
            linkedType = "STATEMENT",
            linkedId = statement.id
        )

        return statement
    }

    fun addPassbookEntry(
        retailerId: String,
        invoiceNumber: String,
        description: String,
        debit: Double,
        credit: Double,
        date: Long = System.currentTimeMillis()
    ) {
        val currentEntries = _passbookEntries.value.filter { it.retailerId == retailerId }.sortedBy { it.date }
        val lastBalance = currentEntries.lastOrNull()?.runningBalance ?: 0.0
        val newRunningBalance = (lastBalance + debit - credit).coerceAtLeast(0.0)

        val entry = PassbookEntry(
            id = "pb_${System.currentTimeMillis()}",
            retailerId = retailerId,
            date = date,
            invoiceNumber = invoiceNumber,
            description = description,
            debit = debit,
            credit = credit,
            runningBalance = newRunningBalance
        )

        _passbookEntries.value = _passbookEntries.value + entry
        savePassbookToPrefs()

        // Update retailer outstanding
        val retailersList = _retailers.value.toMutableList()
        val retIndex = retailersList.indexOfFirst { it.id == retailerId }
        if (retIndex != -1) {
            retailersList[retIndex] = retailersList[retIndex].copy(outstandingAmount = newRunningBalance)
            _retailers.value = retailersList
            saveRetailersToPrefs()
        }
    }

    // ==========================================
    // POSTERS & NOTICES
    // ==========================================
    fun savePoster(poster: Poster, sendPushNotification: Boolean, targetRetailerOption: String) {
        val current = _posters.value.toMutableList()
        val index = current.indexOfFirst { it.id == poster.id }
        val resolvedImage = if (poster.imageUrl.isNotBlank()) poster.imageUrl else AgroImagePresets.getAutomaticPosterPhoto(poster.title)
        val posterWithImg = poster.copy(imageUrl = resolvedImage)

        val finalPoster = if (index != -1) {
            posterWithImg.copy(updatedAt = System.currentTimeMillis())
        } else {
            posterWithImg.copy(
                id = if (posterWithImg.id.isBlank()) "poster_${System.currentTimeMillis()}" else posterWithImg.id,
                createdAt = System.currentTimeMillis(),
                updatedAt = System.currentTimeMillis()
            )
        }

        if (index != -1) current[index] = finalPoster else current.add(0, finalPoster)
        _posters.value = current
        savePostersToPrefs()

        if (sendPushNotification) {
            val title = if (poster.notificationTitle.isNotBlank()) poster.notificationTitle else "📢 Special Offer: ${poster.title}"
            val message = if (poster.notificationMessage.isNotBlank()) poster.notificationMessage else poster.description
            sendNotification(
                title = title,
                message = message,
                targetRetailerId = if (targetRetailerOption == "ALL") "ALL" else targetRetailerOption,
                linkedType = "POSTER",
                linkedId = finalPoster.id
            )
        }
    }

    fun togglePosterActive(posterId: String) {
        val current = _posters.value.toMutableList()
        val index = current.indexOfFirst { it.id == posterId }
        if (index != -1) {
            current[index] = current[index].copy(isActive = !current[index].isActive, updatedAt = System.currentTimeMillis())
            _posters.value = current
            savePostersToPrefs()
        }
    }

    fun deletePoster(posterId: String) {
        _posters.value = _posters.value.filter { it.id != posterId }
        savePostersToPrefs()
    }

    // ==========================================
    // PAYMENT REMINDERS
    // ==========================================
    fun createPaymentReminder(
        retailerId: String,
        dueDate: Long,
        message: String,
        sendPush: Boolean = true
    ): PaymentReminder {
        val retailer = _retailers.value.find { it.id == retailerId }
        val reminder = PaymentReminder(
            id = "rem_${System.currentTimeMillis()}",
            retailerId = retailerId,
            retailerName = retailer?.businessName ?: "Retailer",
            retailerMobile = retailer?.mobileNumber ?: "",
            outstandingAmount = retailer?.outstandingAmount ?: 0.0,
            dueDate = dueDate,
            message = message,
            createdAt = System.currentTimeMillis()
        )

        _paymentReminders.value = listOf(reminder) + _paymentReminders.value
        savePaymentRemindersToPrefs()

        if (sendPush) {
            val df = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
            sendNotification(
                title = "Payment Reminder: Outstanding ₹${"%,.2f".format(reminder.outstandingAmount)}",
                message = "Kindly clear your balance by ${df.format(Date(dueDate))}. $message",
                targetRetailerId = retailerId,
                linkedType = "PAYMENT_REMINDER",
                linkedId = reminder.id
            )
        }

        return reminder
    }

    fun markReminderPaid(reminderId: String) {
        val current = _paymentReminders.value.toMutableList()
        val index = current.indexOfFirst { it.id == reminderId }
        if (index != -1) {
            current[index] = current[index].copy(isPaid = true)
            _paymentReminders.value = current
            savePaymentRemindersToPrefs()
        }
    }

    // ==========================================
    // NOTIFICATION CENTER
    // ==========================================
    fun sendNotification(
        title: String,
        message: String,
        targetRetailerId: String,
        linkedType: String = "NONE",
        linkedId: String = ""
    ) {
        val notification = AppNotification(
            id = "notif_${System.currentTimeMillis()}_${(100..999).random()}",
            title = title,
            message = message,
            targetRetailerId = targetRetailerId,
            linkedType = linkedType,
            linkedId = linkedId,
            timestamp = System.currentTimeMillis(),
            isRead = false
        )
        _notifications.value = listOf(notification) + _notifications.value
        saveNotificationsToPrefs()

        // Trigger real Android status bar notification
        try {
            com.example.util.AgroNotificationHelper.showSystemNotification(
                context = context,
                title = title,
                message = message
            )
        } catch (e: Exception) {
            Log.e("AgroRepository", "Failed to trigger system notification: ${e.message}")
        }
    }

    fun markNotificationRead(id: String) {
        _notifications.value = _notifications.value.map {
            if (it.id == id) it.copy(isRead = true) else it
        }
        saveNotificationsToPrefs()
    }

    fun markAllNotificationsRead(retailerId: String?) {
        _notifications.value = _notifications.value.map {
            if (retailerId == null || it.targetRetailerId == retailerId || it.targetRetailerId == "ALL") {
                it.copy(isRead = true)
            } else it
        }
        saveNotificationsToPrefs()
    }

    fun deleteNotification(id: String) {
        _notifications.value = _notifications.value.filter { it.id != id }
        saveNotificationsToPrefs()
    }

    fun deleteBill(billId: String) {
        _bills.value = _bills.value.filter { it.id != billId }
        saveBillsToPrefs()
    }

    fun deletePaymentReminder(reminderId: String) {
        _paymentReminders.value = _paymentReminders.value.filter { it.id != reminderId }
        savePaymentRemindersToPrefs()
    }

    fun sendPaymentReminder(retailer: Retailer, message: String, dueDate: Long): PaymentReminder {
        return createPaymentReminder(
            retailerId = retailer.id,
            dueDate = dueDate,
            message = message,
            sendPush = true
        )
    }

    fun sendBulkPaymentReminders(retailers: List<Retailer>, message: String, dueDate: Long): List<PaymentReminder> {
        val reminders = mutableListOf<PaymentReminder>()
        retailers.forEach { ret ->
            val rem = createPaymentReminder(
                retailerId = ret.id,
                dueDate = dueDate,
                message = message,
                sendPush = true
            )
            reminders.add(rem)
        }
        return reminders
    }

    fun updateDistributorProfile(profile: DistributorProfile) {
        _distributorProfile.value = profile
        saveDistributorProfileToPrefs(profile)
    }

    private fun saveDistributorProfileToPrefs(profile: DistributorProfile) {
        try {
            val obj = JSONObject().apply {
                put("companyName", profile.companyName)
                put("ownerName", profile.ownerName)
                put("email", profile.email)
                put("phone", profile.phone)
                put("gstin", profile.gstin)
                put("address", profile.address)
                put("city", profile.city)
                put("state", profile.state)
                put("bankName", profile.bankName)
                put("accountNumber", profile.accountNumber)
                put("ifscCode", profile.ifscCode)
                put("upiId", profile.upiId)
            }
            prefs.edit().putString("saved_distributor_profile_json", obj.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving distributor profile: ${e.message}")
        }
    }

    private fun loadDistributorProfileFromPrefs() {
        try {
            val json = prefs.getString("saved_distributor_profile_json", null)
            if (json != null) {
                val obj = JSONObject(json)
                _distributorProfile.value = DistributorProfile(
                    companyName = obj.optString("companyName", "AgroRetail Distributors Pvt Ltd"),
                    ownerName = obj.optString("ownerName", "Suresh Sharma"),
                    email = obj.optString("email", "contact@agroretaildistributors.com"),
                    phone = obj.optString("phone", "9876543210"),
                    gstin = obj.optString("gstin", "07AAAAA0000A1Z5"),
                    address = obj.optString("address", "Main Mandi Road, Sector 14, Karnal, Haryana"),
                    city = obj.optString("city", "Karnal"),
                    state = obj.optString("state", "Haryana"),
                    bankName = obj.optString("bankName", "State Bank of India"),
                    accountNumber = obj.optString("accountNumber", "389201948210"),
                    ifscCode = obj.optString("ifscCode", "SBIN0001234"),
                    upiId = obj.optString("upiId", "agrodistributor@sbi")
                )
            }
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error loading distributor profile: ${e.message}")
        }
    }

    fun broadcastPushNotification(title: String, message: String, linkedType: String = "NONE", linkedId: String = "") {
        sendNotification(
            title = title,
            message = message,
            targetRetailerId = "ALL",
            linkedType = linkedType,
            linkedId = linkedId
        )
    }

    fun sendPushNotificationToRetailer(retailerId: String, title: String, message: String, linkedType: String = "NONE", linkedId: String = "") {
        sendNotification(
            title = title,
            message = message,
            targetRetailerId = retailerId,
            linkedType = linkedType,
            linkedId = linkedId
        )
    }

    fun resetToSampleData() {
        prefs.edit().clear().apply()
        loadLocalDataOrSeedDefaults()
    }

    // ==========================================
    // EXCEL / CSV IMPORT
    // ==========================================
    fun executeImport(
        fileName: String,
        adminName: String,
        parsedRows: List<Map<String, String>>,
        columnMapping: Map<String, String>,
        importMode: String, // "NEW_ONLY" or "NEW_AND_UPDATE"
        stockImportMode: String // "REPLACE" or "ADD"
    ): ImportHistoryItem {
        var importedCount = 0
        var updatedCount = 0
        var skippedCount = 0
        var errorCount = 0
        val errorLogs = mutableListOf<String>()

        val currentProducts = _products.value.toMutableList()

        for ((rowIndex, row) in parsedRows.withIndex()) {
            val rowNum = rowIndex + 1
            try {
                // Extract mapped fields
                val itemCode = row[columnMapping["itemCode"]]?.trim() ?: ""
                val itemName = row[columnMapping["itemName"]]?.trim() ?: ""
                val alias = row[columnMapping["alias"]]?.trim() ?: ""
                val company = row[columnMapping["company"]]?.trim() ?: ""
                val category = row[columnMapping["category"]]?.trim() ?: "General"
                val subCategory = row[columnMapping["subCategory"]]?.trim() ?: ""
                val unit = row[columnMapping["unit"]]?.trim() ?: "Unit"
                val packSize = row[columnMapping["packSize"]]?.trim() ?: "1"
                val packing = row[columnMapping["packing"]]?.trim() ?: ""
                val purchaseRate = row[columnMapping["purchaseRate"]]?.toDoubleOrNull() ?: 0.0
                val sellingRate = row[columnMapping["sellingRate"]]?.toDoubleOrNull() ?: 0.0
                val mrp = row[columnMapping["mrp"]]?.toDoubleOrNull() ?: 0.0
                val gst = row[columnMapping["gstPercent"]]?.toDoubleOrNull() ?: 18.0
                val hsn = row[columnMapping["hsnCode"]]?.trim() ?: ""
                val barcode = row[columnMapping["barcode"]]?.trim() ?: ""
                val openingStock = row[columnMapping["openingStock"]]?.toDoubleOrNull() ?: 0.0
                val currentStock = row[columnMapping["currentStock"]]?.toDoubleOrNull() ?: 0.0
                val description = row[columnMapping["description"]]?.trim() ?: ""

                if (itemName.isBlank()) {
                    errorLogs.add("Row $rowNum: Item Name is missing")
                    errorCount++
                    continue
                }

                // Match existing product
                val existingIndex = currentProducts.indexOfFirst {
                    if (itemCode.isNotBlank()) it.itemCode.equals(itemCode, ignoreCase = true)
                    else it.itemName.equals(itemName, ignoreCase = true) && it.company.equals(company, ignoreCase = true)
                }

                if (existingIndex != -1) {
                    if (importMode == "NEW_ONLY") {
                        skippedCount++
                    } else {
                        // Update existing
                        val existing = currentProducts[existingIndex]
                        val finalStock = if (stockImportMode == "ADD") {
                            existing.currentStock + currentStock
                        } else {
                            currentStock
                        }
                        currentProducts[existingIndex] = existing.copy(
                            itemName = itemName,
                            alias = if (alias.isNotBlank()) alias else existing.alias,
                            company = if (company.isNotBlank()) company else existing.company,
                            category = if (category.isNotBlank()) category else existing.category,
                            subCategory = if (subCategory.isNotBlank()) subCategory else existing.subCategory,
                            unit = if (unit.isNotBlank()) unit else existing.unit,
                            packSize = if (packSize.isNotBlank()) packSize else existing.packSize,
                            packing = if (packing.isNotBlank()) packing else existing.packing,
                            purchaseRate = if (purchaseRate > 0) purchaseRate else existing.purchaseRate,
                            sellingRate = if (sellingRate > 0) sellingRate else existing.sellingRate,
                            mrp = if (mrp > 0) mrp else existing.mrp,
                            gstPercent = gst,
                            hsnCode = if (hsn.isNotBlank()) hsn else existing.hsnCode,
                            barcode = if (barcode.isNotBlank()) barcode else existing.barcode,
                            currentStock = finalStock,
                            description = if (description.isNotBlank()) description else existing.description,
                            updatedAt = System.currentTimeMillis()
                        )
                        updatedCount++
                    }
                } else {
                    // New Product
                    val newProduct = Product(
                        id = "prod_imp_${System.currentTimeMillis()}_$rowIndex",
                        itemCode = if (itemCode.isNotBlank()) itemCode else "ITM-${(1000..9999).random()}",
                        itemName = itemName,
                        alias = alias,
                        company = company,
                        category = category,
                        subCategory = subCategory,
                        unit = unit,
                        packSize = packSize,
                        packing = packing,
                        purchaseRate = purchaseRate,
                        sellingRate = sellingRate,
                        mrp = mrp,
                        gstPercent = gst,
                        hsnCode = hsn,
                        barcode = barcode,
                        openingStock = openingStock,
                        currentStock = currentStock,
                        description = description,
                        isActive = true,
                        createdAt = System.currentTimeMillis(),
                        updatedAt = System.currentTimeMillis()
                    )
                    currentProducts.add(newProduct)
                    importedCount++
                }
            } catch (e: Exception) {
                errorCount++
                errorLogs.add("Row $rowNum: Unexpected error: ${e.message}")
            }
        }

        _products.value = currentProducts
        saveProductsToPrefs()

        val historyItem = ImportHistoryItem(
            id = "hist_${System.currentTimeMillis()}",
            fileName = fileName,
            adminName = adminName,
            timestamp = System.currentTimeMillis(),
            totalRows = parsedRows.size,
            imported = importedCount,
            updated = updatedCount,
            skipped = skippedCount,
            errors = errorCount,
            errorReport = errorLogs,
            stockImportMode = stockImportMode
        )

        _importHistory.value = listOf(historyItem) + _importHistory.value
        saveImportHistoryToPrefs()

        return historyItem
    }

    // ==========================================
    // PERSISTENCE HELPERS
    // ==========================================
    private fun saveProductsToPrefs() {
        try {
            val array = JSONArray()
            _products.value.forEach { p ->
                val obj = JSONObject().apply {
                    put("id", p.id)
                    put("itemCode", p.itemCode)
                    put("itemName", p.itemName)
                    put("alias", p.alias)
                    put("company", p.company)
                    put("category", p.category)
                    put("subCategory", p.subCategory)
                    put("unit", p.unit)
                    put("packSize", p.packSize)
                    put("packing", p.packing)
                    put("purchaseRate", p.purchaseRate)
                    put("sellingRate", p.sellingRate)
                    put("mrp", p.mrp)
                    put("gstPercent", p.gstPercent)
                    put("hsnCode", p.hsnCode)
                    put("barcode", p.barcode)
                    put("openingStock", p.openingStock)
                    put("currentStock", p.currentStock)
                    put("description", p.description)
                    put("imageUrl", p.imageUrl)
                    put("isActive", p.isActive)
                }
                array.put(obj)
            }
            prefs.edit().putString("saved_products_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving products: ${e.message}")
        }
    }

    private fun saveCompaniesToPrefs() {
        try {
            val array = JSONArray()
            _companies.value.forEach { c ->
                val obj = JSONObject().apply {
                    put("id", c.id)
                    put("name", c.name)
                    put("logoUrl", c.logoUrl)
                    put("description", c.description)
                    put("contactPerson", c.contactPerson)
                    put("phone", c.phone)
                    put("email", c.email)
                    put("isActive", c.isActive)
                }
                array.put(obj)
            }
            prefs.edit().putString("saved_companies_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving companies: ${e.message}")
        }
    }

    private fun saveRetailersToPrefs() {
        try {
            val array = JSONArray()
            _retailers.value.forEach { r ->
                val obj = JSONObject().apply {
                    put("id", r.id)
                    put("businessName", r.businessName)
                    put("retailerName", r.retailerName)
                    put("mobileNumber", r.mobileNumber)
                    put("alternatePhone", r.alternatePhone)
                    put("email", r.email)
                    put("pinHash", r.pinHash)
                    put("address", r.address)
                    put("city", r.city)
                    put("state", r.state)
                    put("gstNumber", r.gstNumber)
                    put("creditLimit", r.creditLimit)
                    put("outstandingAmount", r.outstandingAmount)
                    put("isActive", r.isActive)
                }
                array.put(obj)
            }
            prefs.edit().putString("saved_retailers_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving retailers: ${e.message}")
        }
    }

    private fun saveOrdersToPrefs() {
        try {
            val array = JSONArray()
            _orders.value.forEach { o ->
                val obj = JSONObject().apply {
                    put("id", o.id)
                    put("retailerId", o.retailerId)
                    put("retailerName", o.retailerName)
                    put("retailerBusinessName", o.retailerBusinessName)
                    put("retailerMobile", o.retailerMobile)
                    put("dateTime", o.dateTime)
                    put("subTotal", o.subTotal)
                    put("gstTotal", o.gstTotal)
                    put("grandTotal", o.grandTotal)
                    put("notes", o.notes)
                    put("status", o.status.name)
                    put("adminNotes", o.adminNotes)
                    put("updatedAt", o.updatedAt)

                    val itemsArr = JSONArray()
                    o.items.forEach { item ->
                        itemsArr.put(JSONObject().apply {
                            put("productId", item.productId)
                            put("itemCode", item.itemCode)
                            put("itemName", item.itemName)
                            put("packSize", item.packSize)
                            put("quantity", item.quantity)
                            put("rate", item.rate)
                            put("gstPercent", item.gstPercent)
                            put("total", item.total)
                            put("imageUrl", item.imageUrl)
                        })
                    }
                    put("items", itemsArr)
                }
                array.put(obj)
            }
            prefs.edit().putString("saved_orders_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving orders: ${e.message}")
        }
    }

    private fun saveBillsToPrefs() {
        try {
            val array = JSONArray()
            _bills.value.forEach { b ->
                array.put(JSONObject().apply {
                    put("id", b.id)
                    put("billNumber", b.billNumber)
                    put("retailerId", b.retailerId)
                    put("retailerName", b.retailerName)
                    put("billDate", b.billDate)
                    put("amount", b.amount)
                    put("pdfUrl", b.pdfUrl)
                    put("originalFileName", b.originalFileName)
                    put("createdAt", b.createdAt)
                })
            }
            prefs.edit().putString("saved_bills_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving bills: ${e.message}")
        }
    }

    private fun saveStatementsToPrefs() {
        try {
            val array = JSONArray()
            _statements.value.forEach { s ->
                array.put(JSONObject().apply {
                    put("id", s.id)
                    put("retailerId", s.retailerId)
                    put("retailerName", s.retailerName)
                    put("documentType", s.documentType)
                    put("title", s.title)
                    put("period", s.period)
                    put("pdfUrl", s.pdfUrl)
                    put("originalFileName", s.originalFileName)
                    put("uploadedAt", s.uploadedAt)
                })
            }
            prefs.edit().putString("saved_statements_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving statements: ${e.message}")
        }
    }

    private fun savePassbookToPrefs() {
        try {
            val array = JSONArray()
            _passbookEntries.value.forEach { p ->
                array.put(JSONObject().apply {
                    put("id", p.id)
                    put("retailerId", p.retailerId)
                    put("date", p.date)
                    put("invoiceNumber", p.invoiceNumber)
                    put("description", p.description)
                    put("debit", p.debit)
                    put("credit", p.credit)
                    put("runningBalance", p.runningBalance)
                })
            }
            prefs.edit().putString("saved_passbook_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving passbook: ${e.message}")
        }
    }

    private fun savePostersToPrefs() {
        try {
            val array = JSONArray()
            _posters.value.forEach { p ->
                array.put(JSONObject().apply {
                    put("id", p.id)
                    put("title", p.title)
                    put("description", p.description)
                    put("imageUrl", p.imageUrl)
                    put("fileType", p.fileType)
                    put("startDate", p.startDate)
                    put("endDate", p.endDate)
                    put("priority", p.priority)
                    put("isActive", p.isActive)
                    put("createdAt", p.createdAt)
                    put("updatedAt", p.updatedAt)
                    put("createdBy", p.createdBy)
                })
            }
            prefs.edit().putString("saved_posters_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving posters: ${e.message}")
        }
    }

    private fun saveNotificationsToPrefs() {
        try {
            val array = JSONArray()
            _notifications.value.forEach { n ->
                array.put(JSONObject().apply {
                    put("id", n.id)
                    put("title", n.title)
                    put("message", n.message)
                    put("targetRetailerId", n.targetRetailerId)
                    put("linkedType", n.linkedType)
                    put("linkedId", n.linkedId)
                    put("timestamp", n.timestamp)
                    put("isRead", n.isRead)
                })
            }
            prefs.edit().putString("saved_notifications_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving notifications: ${e.message}")
        }
    }

    private fun savePaymentRemindersToPrefs() {
        try {
            val array = JSONArray()
            _paymentReminders.value.forEach { pr ->
                array.put(JSONObject().apply {
                    put("id", pr.id)
                    put("retailerId", pr.retailerId)
                    put("retailerName", pr.retailerName)
                    put("retailerMobile", pr.retailerMobile)
                    put("outstandingAmount", pr.outstandingAmount)
                    put("dueDate", pr.dueDate)
                    put("message", pr.message)
                    put("createdAt", pr.createdAt)
                    put("isPaid", pr.isPaid)
                    put("snoozedUntil", pr.snoozedUntil)
                })
            }
            prefs.edit().putString("saved_reminders_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving reminders: ${e.message}")
        }
    }

    private fun saveImportHistoryToPrefs() {
        try {
            val array = JSONArray()
            _importHistory.value.forEach { ih ->
                array.put(JSONObject().apply {
                    put("id", ih.id)
                    put("fileName", ih.fileName)
                    put("adminName", ih.adminName)
                    put("timestamp", ih.timestamp)
                    put("totalRows", ih.totalRows)
                    put("imported", ih.imported)
                    put("updated", ih.updated)
                    put("skipped", ih.skipped)
                    put("errors", ih.errors)
                    put("stockImportMode", ih.stockImportMode)
                    val errorsArr = JSONArray()
                    ih.errorReport.forEach { errorsArr.put(it) }
                    put("errorReport", errorsArr)
                })
            }
            prefs.edit().putString("saved_import_hist_json", array.toString()).apply()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error saving import history: ${e.message}")
        }
    }

    // ==========================================
    // INITIAL DATA SEEDING
    // ==========================================
    fun resetDemoData() {
        prefs.edit().clear().apply()
        loadLocalDataOrSeedDefaults(forceReset = true)
    }

    private fun loadLocalDataOrSeedDefaults(forceReset: Boolean = false) {
        val hasSeeded = prefs.getBoolean("has_seeded_initial_data", false)
        if (!hasSeeded || forceReset) {
            seedInitialAgriculturalData()
            prefs.edit().putBoolean("has_seeded_initial_data", true).apply()
        } else {
            // Restore from JSON in SharedPreferences
            restoreAllFromPrefs()
        }
    }

    private fun restoreAllFromPrefs() {
        try {
            // Restore Products
            val prodJson = prefs.getString("saved_products_json", null)
            if (prodJson != null) {
                val array = JSONArray(prodJson)
                val list = mutableListOf<Product>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Product(
                            id = o.optString("id"),
                            itemCode = o.optString("itemCode"),
                            itemName = o.optString("itemName"),
                            alias = o.optString("alias"),
                            company = o.optString("company"),
                            category = o.optString("category"),
                            subCategory = o.optString("subCategory"),
                            unit = o.optString("unit"),
                            packSize = o.optString("packSize"),
                            packing = o.optString("packing"),
                            purchaseRate = o.optDouble("purchaseRate"),
                            sellingRate = o.optDouble("sellingRate"),
                            mrp = o.optDouble("mrp"),
                            gstPercent = o.optDouble("gstPercent"),
                            hsnCode = o.optString("hsnCode"),
                            barcode = o.optString("barcode"),
                            openingStock = o.optDouble("openingStock"),
                            currentStock = o.optDouble("currentStock"),
                            description = o.optString("description"),
                            imageUrl = o.optString("imageUrl"),
                            isActive = o.optBoolean("isActive", true)
                        )
                    )
                }
                _products.value = list
            }

            // Restore Companies
            val compJson = prefs.getString("saved_companies_json", null)
            if (compJson != null) {
                val array = JSONArray(compJson)
                val list = mutableListOf<Company>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Company(
                            id = o.optString("id"),
                            name = o.optString("name"),
                            logoUrl = o.optString("logoUrl"),
                            description = o.optString("description"),
                            contactPerson = o.optString("contactPerson"),
                            phone = o.optString("phone"),
                            email = o.optString("email"),
                            isActive = o.optBoolean("isActive", true)
                        )
                    )
                }
                _companies.value = list
            }

            // Restore Retailers
            val retJson = prefs.getString("saved_retailers_json", null)
            if (retJson != null) {
                val array = JSONArray(retJson)
                val list = mutableListOf<Retailer>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Retailer(
                            id = o.optString("id"),
                            businessName = o.optString("businessName"),
                            retailerName = o.optString("retailerName"),
                            mobileNumber = o.optString("mobileNumber"),
                            alternatePhone = o.optString("alternatePhone"),
                            email = o.optString("email"),
                            pinHash = o.optString("pinHash"),
                            address = o.optString("address"),
                            city = o.optString("city"),
                            state = o.optString("state"),
                            gstNumber = o.optString("gstNumber"),
                            creditLimit = o.optDouble("creditLimit"),
                            outstandingAmount = o.optDouble("outstandingAmount"),
                            isActive = o.optBoolean("isActive", true)
                        )
                    )
                }
                _retailers.value = list
            }

            // Restore Orders
            val ordJson = prefs.getString("saved_orders_json", null)
            if (ordJson != null) {
                val array = JSONArray(ordJson)
                val list = mutableListOf<Order>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    val itemsArr = o.optJSONArray("items") ?: JSONArray()
                    val itemsList = mutableListOf<OrderItem>()
                    for (j in 0 until itemsArr.length()) {
                        val it = itemsArr.getJSONObject(j)
                        itemsList.add(
                            OrderItem(
                                productId = it.optString("productId"),
                                itemCode = it.optString("itemCode"),
                                itemName = it.optString("itemName"),
                                packSize = it.optString("packSize"),
                                quantity = it.optInt("quantity"),
                                rate = it.optDouble("rate"),
                                gstPercent = it.optDouble("gstPercent"),
                                total = it.optDouble("total"),
                                imageUrl = it.optString("imageUrl")
                            )
                        )
                    }
                    val statusStr = o.optString("status", OrderStatus.Pending.name)
                    val status = try { OrderStatus.valueOf(statusStr) } catch (e: Exception) { OrderStatus.Pending }
                    list.add(
                        Order(
                            id = o.optString("id"),
                            retailerId = o.optString("retailerId"),
                            retailerName = o.optString("retailerName"),
                            retailerBusinessName = o.optString("retailerBusinessName"),
                            retailerMobile = o.optString("retailerMobile"),
                            dateTime = o.optLong("dateTime"),
                            items = itemsList,
                            subTotal = o.optDouble("subTotal"),
                            gstTotal = o.optDouble("gstTotal"),
                            grandTotal = o.optDouble("grandTotal"),
                            notes = o.optString("notes"),
                            status = status,
                            adminNotes = o.optString("adminNotes"),
                            updatedAt = o.optLong("updatedAt")
                        )
                    )
                }
                _orders.value = list
            }

            // Restore Bills
            val billJson = prefs.getString("saved_bills_json", null)
            if (billJson != null) {
                val array = JSONArray(billJson)
                val list = mutableListOf<Bill>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Bill(
                            id = o.optString("id"),
                            billNumber = o.optString("billNumber"),
                            retailerId = o.optString("retailerId"),
                            retailerName = o.optString("retailerName"),
                            billDate = o.optLong("billDate"),
                            amount = o.optDouble("amount"),
                            pdfUrl = o.optString("pdfUrl"),
                            originalFileName = o.optString("originalFileName"),
                            createdAt = o.optLong("createdAt")
                        )
                    )
                }
                _bills.value = list
            }

            // Restore Statements
            val stmtJson = prefs.getString("saved_statements_json", null)
            if (stmtJson != null) {
                val array = JSONArray(stmtJson)
                val list = mutableListOf<Statement>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Statement(
                            id = o.optString("id"),
                            retailerId = o.optString("retailerId"),
                            retailerName = o.optString("retailerName"),
                            documentType = o.optString("documentType"),
                            title = o.optString("title"),
                            period = o.optString("period"),
                            pdfUrl = o.optString("pdfUrl"),
                            originalFileName = o.optString("originalFileName"),
                            uploadedAt = o.optLong("uploadedAt")
                        )
                    )
                }
                _statements.value = list
            }

            // Restore Passbook
            val pbJson = prefs.getString("saved_passbook_json", null)
            if (pbJson != null) {
                val array = JSONArray(pbJson)
                val list = mutableListOf<PassbookEntry>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        PassbookEntry(
                            id = o.optString("id"),
                            retailerId = o.optString("retailerId"),
                            date = o.optLong("date"),
                            invoiceNumber = o.optString("invoiceNumber"),
                            description = o.optString("description"),
                            debit = o.optDouble("debit"),
                            credit = o.optDouble("credit"),
                            runningBalance = o.optDouble("runningBalance")
                        )
                    )
                }
                _passbookEntries.value = list
            }

            // Restore Posters
            val postJson = prefs.getString("saved_posters_json", null)
            if (postJson != null) {
                val array = JSONArray(postJson)
                val list = mutableListOf<Poster>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        Poster(
                            id = o.optString("id"),
                            title = o.optString("title"),
                            description = o.optString("description"),
                            imageUrl = o.optString("imageUrl"),
                            fileType = o.optString("fileType", "IMAGE"),
                            startDate = o.optLong("startDate"),
                            endDate = o.optLong("endDate"),
                            priority = o.optInt("priority", 1),
                            isActive = o.optBoolean("isActive", true),
                            createdAt = o.optLong("createdAt"),
                            updatedAt = o.optLong("updatedAt"),
                            createdBy = o.optString("createdBy")
                        )
                    )
                }
                _posters.value = list
            }

            // Restore Notifications
            val notifJson = prefs.getString("saved_notifications_json", null)
            if (notifJson != null) {
                val array = JSONArray(notifJson)
                val list = mutableListOf<AppNotification>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        AppNotification(
                            id = o.optString("id"),
                            title = o.optString("title"),
                            message = o.optString("message"),
                            targetRetailerId = o.optString("targetRetailerId"),
                            linkedType = o.optString("linkedType"),
                            linkedId = o.optString("linkedId"),
                            timestamp = o.optLong("timestamp"),
                            isRead = o.optBoolean("isRead")
                        )
                    )
                }
                _notifications.value = list
            }

            // Restore Payment Reminders
            val remJson = prefs.getString("saved_reminders_json", null)
            if (remJson != null) {
                val array = JSONArray(remJson)
                val list = mutableListOf<PaymentReminder>()
                for (i in 0 until array.length()) {
                    val o = array.getJSONObject(i)
                    list.add(
                        PaymentReminder(
                            id = o.optString("id"),
                            retailerId = o.optString("retailerId"),
                            retailerName = o.optString("retailerName"),
                            retailerMobile = o.optString("retailerMobile"),
                            outstandingAmount = o.optDouble("outstandingAmount"),
                            dueDate = o.optLong("dueDate"),
                            message = o.optString("message"),
                            createdAt = o.optLong("createdAt"),
                            isPaid = o.optBoolean("isPaid"),
                            snoozedUntil = o.optLong("snoozedUntil")
                        )
                    )
                }
                _paymentReminders.value = list
            }

            // Restore Distributor Profile
            loadDistributorProfileFromPrefs()
        } catch (e: Exception) {
            Log.e("AgroRepository", "Error restoring from prefs: ${e.message}")
            seedInitialAgriculturalData()
        }
    }

    private fun seedInitialAgriculturalData() {
        // Companies
        val initialCompanies = listOf(
            Company(
                id = "comp_1",
                name = "Bayer CropScience",
                logoUrl = "",
                description = "Leading global agricultural solutions, fungicides, and crop protection products.",
                contactPerson = "Amit Deshmukh",
                phone = "9823456781",
                email = "bayer.india@cropscience.com"
            ),
            Company(
                id = "comp_2",
                name = "Syngenta India",
                logoUrl = "",
                description = "Premier seeds, insecticides, and modern weed control technologies.",
                contactPerson = "Rajiv Saxena",
                phone = "9823456782",
                email = "contact@syngenta.in"
            ),
            Company(
                id = "comp_3",
                name = "UPL Limited",
                logoUrl = "",
                description = "Global sustainable agriculture products, bio-solutions, and herbicides.",
                contactPerson = "Vikram Singhania",
                phone = "9823456783",
                email = "support@upl-ltd.com"
            ),
            Company(
                id = "comp_4",
                name = "IFFCO",
                logoUrl = "",
                description = "World's largest farmers cooperative: Nano Urea, DAP, and water soluble fertilizers.",
                contactPerson = "Dr. S. K. Verma",
                phone = "9823456784",
                email = "info@iffco.in"
            ),
            Company(
                id = "comp_5",
                name = "Coromandel International",
                logoUrl = "",
                description = "Gromor brand high-quality specialty plant nutrition and crop protection.",
                contactPerson = "M. K. Reddy",
                phone = "9823456785",
                email = "gromor@coromandel.biz"
            ),
            Company(
                id = "comp_6",
                name = "Mahyco Seeds",
                logoUrl = "",
                description = "Hybrid seeds pioneer in cotton, maize, pearl millet, and vegetables.",
                contactPerson = "Pooja Barwale",
                phone = "9823456786",
                email = "sales@mahyco.com"
            )
        )
        _companies.value = initialCompanies
        saveCompaniesToPrefs()

        // Products
        val initialProducts = listOf(
            Product(
                id = "prod_1",
                itemCode = "BAY-NAT-100",
                itemName = "Nativo Fungicide",
                alias = "Nativo 75WG",
                company = "Bayer CropScience",
                category = "Fungicides",
                subCategory = "Systemic Fungicide",
                unit = "Grams",
                packSize = "100 gm",
                packing = "Pouch Box",
                purchaseRate = 720.0,
                sellingRate = 785.0,
                mrp = 890.0,
                gstPercent = 18.0,
                hsnCode = "38089290",
                barcode = "890123456001",
                openingStock = 120.0,
                currentStock = 85.0,
                description = "Tebuconazole 50% + Trifloxystrobin 25% WG broad spectrum fungicide for blast and sheath blight."
            ),
            Product(
                id = "prod_2",
                itemCode = "SYN-AMP-200",
                itemName = "Ampligo Insecticide",
                alias = "Ampligo ZC",
                company = "Syngenta India",
                category = "Insecticides",
                subCategory = "Caterpillar & Borer Control",
                unit = "ml",
                packSize = "200 ml",
                packing = "Pet Bottle",
                purchaseRate = 1150.0,
                sellingRate = 1240.0,
                mrp = 1420.0,
                gstPercent = 18.0,
                hsnCode = "38089190",
                barcode = "890123456002",
                openingStock = 80.0,
                currentStock = 46.0,
                description = "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC for quick knockdown and long duration control."
            ),
            Product(
                id = "prod_3",
                itemCode = "IFF-NANO-500",
                itemName = "IFFCO Nano Urea Liquid",
                alias = "Nano Urea 4% N",
                company = "IFFCO",
                category = "Fertilizers",
                subCategory = "Nano Technology",
                unit = "Bottle",
                packSize = "500 ml",
                packing = "Carton of 24",
                purchaseRate = 205.0,
                sellingRate = 225.0,
                mrp = 240.0,
                gstPercent = 5.0,
                hsnCode = "31021000",
                barcode = "890123456003",
                openingStock = 500.0,
                currentStock = 320.0,
                description = "Eco-friendly liquid nitrogen fertilizer that replaces 1 conventional bag of urea."
            ),
            Product(
                id = "prod_4",
                itemCode = "UPL-SAAF-500",
                itemName = "Saaf Fungicide",
                alias = "Saaf WP",
                company = "UPL Limited",
                category = "Fungicides",
                subCategory = "Dual Action",
                unit = "Grams",
                packSize = "500 gm",
                packing = "Pkt",
                purchaseRate = 380.0,
                sellingRate = 420.0,
                mrp = 485.0,
                gstPercent = 18.0,
                hsnCode = "38089210",
                barcode = "890123456004",
                openingStock = 200.0,
                currentStock = 140.0,
                description = "Carbendazim 12% + Mancozeb 63% WP proven contact and systemic fungicide."
            ),
            Product(
                id = "prod_5",
                itemCode = "COR-NPK-1KG",
                itemName = "Gromor NPK 19:19:19",
                alias = "100% Water Soluble 19-19-19",
                company = "Coromandel International",
                category = "Fertilizers",
                subCategory = "Water Soluble",
                unit = "Kg",
                packSize = "1 Kg",
                packing = "Polybags Box",
                purchaseRate = 125.0,
                sellingRate = 145.0,
                mrp = 175.0,
                gstPercent = 5.0,
                hsnCode = "31052000",
                barcode = "890123456005",
                openingStock = 350.0,
                currentStock = 210.0,
                description = "Balanced foliar grade fertilizer containing macro-nutrients in fully chelated form."
            ),
            Product(
                id = "prod_6",
                itemCode = "MAH-COT-450",
                itemName = "Mahyco Bollgard II Cotton Seed",
                alias = "MRC-7351 BG II",
                company = "Mahyco Seeds",
                category = "Seeds",
                subCategory = "Bt Hybrid Cotton",
                unit = "Pkt",
                packSize = "475 gm",
                packing = "Certified Packet",
                purchaseRate = 780.0,
                sellingRate = 853.0,
                mrp = 853.0,
                gstPercent = 0.0,
                hsnCode = "12072100",
                barcode = "890123456006",
                openingStock = 150.0,
                currentStock = 90.0,
                description = "High yielding bollgard II hybrid cotton seed with excellent sucking pest tolerance."
            ),
            Product(
                id = "prod_7",
                itemCode = "UPL-SWEEP-1L",
                itemName = "Sweep Power Herbicide",
                alias = "Glufosinate Ammonium 13.5% SL",
                company = "UPL Limited",
                category = "Herbicides",
                subCategory = "Non-Selective Weedicide",
                unit = "Ltr",
                packSize = "1 Ltr",
                packing = "Canister",
                purchaseRate = 690.0,
                sellingRate = 760.0,
                mrp = 880.0,
                gstPercent = 18.0,
                hsnCode = "38089340",
                barcode = "890123456007",
                openingStock = 100.0,
                currentStock = 58.0,
                description = "Fast acting broad-spectrum contact herbicide for plantation and non-cropped areas."
            ),
            Product(
                id = "prod_8",
                itemCode = "BAY-CONF-100",
                itemName = "Confidor Insecticide",
                alias = "Imidacloprid 17.8% SL",
                company = "Bayer CropScience",
                category = "Insecticides",
                subCategory = "Neonicotinoid Systemic",
                unit = "ml",
                packSize = "100 ml",
                packing = "Bottle",
                purchaseRate = 290.0,
                sellingRate = 330.0,
                mrp = 390.0,
                gstPercent = 18.0,
                hsnCode = "38089120",
                barcode = "890123456008",
                openingStock = 180.0,
                currentStock = 115.0,
                description = "Effective against sucking pests like aphids, jassids, thrips, and whiteflies in various crops."
            )
        )
        _products.value = initialProducts
        saveProductsToPrefs()

        // Retailers
        val initialRetailers = listOf(
            Retailer(
                id = "ret_1",
                businessName = "Kisan Agro Agency",
                retailerName = "Ramesh Kumar",
                mobileNumber = "9876543210",
                pinHash = SecurityUtils.hashPin("1234"), // PIN: 1234
                address = "Shop 14, Mandi Complex, GT Road",
                city = "Karnal",
                state = "Haryana",
                gstNumber = "06AAAAA1234A1Z5",
                creditLimit = 200000.0,
                outstandingAmount = 38500.0,
                isActive = true
            ),
            Retailer(
                id = "ret_2",
                businessName = "Jai Kisan Beej Bhandar",
                retailerName = "Suresh Patel",
                mobileNumber = "9812345678",
                pinHash = SecurityUtils.hashPin("4321"), // PIN: 4321
                address = "Near Anaj Mandi, Station Road",
                city = "Ujjain",
                state = "Madhya Pradesh",
                gstNumber = "23BBBBB5678B1Z2",
                creditLimit = 150000.0,
                outstandingAmount = 14200.0,
                isActive = true
            ),
            Retailer(
                id = "ret_3",
                businessName = "Annapurna Krishi Kendra",
                retailerName = "Anil Sharma",
                mobileNumber = "9765432109",
                pinHash = SecurityUtils.hashPin("9999"), // PIN: 9999
                address = "Main Market, Bus Stand Road",
                city = "Nashik",
                state = "Maharashtra",
                gstNumber = "27CCCCC9012C1Z8",
                creditLimit = 300000.0,
                outstandingAmount = 0.0,
                isActive = true
            )
        )
        _retailers.value = initialRetailers
        saveRetailersToPrefs()

        // Promotional Posters
        val now = System.currentTimeMillis()
        val initialPosters = listOf(
            Poster(
                id = "poster_1",
                title = "Monsoon Mega Scheme: 10% Extra Margin",
                description = "Book 50+ boxes of Bayer Nativo or Ampligo this week and get an instant 10% volume discount voucher plus free transport.",
                imageUrl = "",
                fileType = "IMAGE",
                startDate = now - (2L * 24 * 60 * 60 * 1000),
                endDate = now + (25L * 24 * 60 * 60 * 1000),
                priority = 1,
                isActive = true,
                createdBy = "Admin",
                notificationTitle = "📢 Monsoon Mega Scheme Announced!",
                notificationMessage = "Enjoy 10% extra retailer margin on Nativo & Ampligo bookings."
            ),
            Poster(
                id = "poster_2",
                title = "Early Bird Booking: Certified Seeds",
                description = "High yielding certified wheat & mustard seeds now in stock. Guaranteed germination tested batches.",
                imageUrl = "",
                fileType = "IMAGE",
                startDate = now - (5L * 24 * 60 * 60 * 1000),
                endDate = now + (45L * 24 * 60 * 60 * 1000),
                priority = 2,
                isActive = true,
                createdBy = "Admin",
                notificationTitle = "🌾 Certified Seeds Available",
                notificationMessage = "Pre-book your seed quota now before stocks run out."
            ),
            Poster(
                id = "poster_3",
                title = "IFFCO Nano Fertilizer Stock Arrival",
                description = "Fresh stock of IFFCO Nano Urea & Nano DAP bottles arrived. Special dealer display racks provided on bulk orders.",
                imageUrl = "",
                fileType = "IMAGE",
                startDate = now - (1L * 24 * 60 * 60 * 1000),
                endDate = now + (20L * 24 * 60 * 60 * 1000),
                priority = 3,
                isActive = true,
                createdBy = "Admin",
                notificationTitle = "⚡ Nano Urea Fresh Stock",
                notificationMessage = "Stock up on high-demand Nano Urea 500ml."
            )
        )
        _posters.value = initialPosters
        savePostersToPrefs()

        // Sample Orders
        val initialOrders = listOf(
            Order(
                id = "ORD-2026-104821",
                retailerId = "ret_1",
                retailerName = "Ramesh Kumar",
                retailerBusinessName = "Kisan Agro Agency",
                retailerMobile = "9876543210",
                dateTime = now - (2L * 24 * 60 * 60 * 1000),
                items = listOf(
                    OrderItem(
                        productId = "prod_1",
                        itemCode = "BAY-NAT-100",
                        itemName = "Nativo Fungicide",
                        packSize = "100 gm",
                        quantity = 20,
                        rate = 785.0,
                        gstPercent = 18.0,
                        total = 18526.0
                    ),
                    OrderItem(
                        productId = "prod_3",
                        itemCode = "IFF-NANO-500",
                        itemName = "IFFCO Nano Urea Liquid",
                        packSize = "500 ml",
                        quantity = 50,
                        rate = 225.0,
                        gstPercent = 5.0,
                        total = 11812.5
                    )
                ),
                subTotal = 26950.0,
                gstTotal = 3388.5,
                grandTotal = 30338.5,
                notes = "Please dispatch via Karnal Transport Co.",
                status = OrderStatus.Dispatched,
                adminNotes = "LR No. 89123 attached",
                updatedAt = now - (1L * 24 * 60 * 60 * 1000)
            ),
            Order(
                id = "ORD-2026-105193",
                retailerId = "ret_1",
                retailerName = "Ramesh Kumar",
                retailerBusinessName = "Kisan Agro Agency",
                retailerMobile = "9876543210",
                dateTime = now - (3L * 60 * 60 * 1000),
                items = listOf(
                    OrderItem(
                        productId = "prod_2",
                        itemCode = "SYN-AMP-200",
                        itemName = "Ampligo Insecticide",
                        packSize = "200 ml",
                        quantity = 10,
                        rate = 1240.0,
                        gstPercent = 18.0,
                        total = 14632.0
                    )
                ),
                subTotal = 12400.0,
                gstTotal = 2232.0,
                grandTotal = 14632.0,
                notes = "Urgent requirement for local farmers",
                status = OrderStatus.Pending,
                updatedAt = now - (3L * 60 * 60 * 1000)
            )
        )
        _orders.value = initialOrders
        saveOrdersToPrefs()

        // Bills
        val initialBills = listOf(
            Bill(
                id = "bill_1",
                billNumber = "INV-2026-0842",
                retailerId = "ret_1",
                retailerName = "Kisan Agro Agency",
                billDate = now - (15L * 24 * 60 * 60 * 1000),
                amount = 45000.0,
                pdfUrl = "https://example.com/bills/INV-2026-0842.pdf",
                originalFileName = "Tax_Invoice_0842.pdf",
                createdAt = now - (15L * 24 * 60 * 60 * 1000)
            ),
            Bill(
                id = "bill_2",
                billNumber = "INV-2026-0915",
                retailerId = "ret_1",
                retailerName = "Kisan Agro Agency",
                billDate = now - (5L * 24 * 60 * 60 * 1000),
                amount = 30338.5,
                pdfUrl = "https://example.com/bills/INV-2026-0915.pdf",
                originalFileName = "Tax_Invoice_0915.pdf",
                createdAt = now - (5L * 24 * 60 * 60 * 1000)
            )
        )
        _bills.value = initialBills
        saveBillsToPrefs()

        // Statements
        val initialStatements = listOf(
            Statement(
                id = "stmt_1",
                retailerId = "ret_1",
                retailerName = "Kisan Agro Agency",
                documentType = "Account Statement",
                title = "Monthly Ledger Statement - Aug 2026",
                period = "01 Aug 2026 - 31 Aug 2026",
                pdfUrl = "https://example.com/statements/ret_1_aug26.pdf",
                originalFileName = "Statement_Aug_2026.pdf",
                uploadedAt = now - (18L * 24 * 60 * 60 * 1000)
            ),
            Statement(
                id = "stmt_2",
                retailerId = "ret_1",
                retailerName = "Kisan Agro Agency",
                documentType = "Passbook",
                title = "Quarterly Passbook Summary Q2",
                period = "01 Jun 2026 - 31 Aug 2026",
                pdfUrl = "https://example.com/statements/ret_1_passbook_q2.pdf",
                originalFileName = "Passbook_Q2_Summary.pdf",
                uploadedAt = now - (10L * 24 * 60 * 60 * 1000)
            )
        )
        _statements.value = initialStatements
        saveStatementsToPrefs()

        // Passbook Ledger entries for Ramesh Kumar
        val initialPassbook = listOf(
            PassbookEntry(
                id = "pb_1",
                retailerId = "ret_1",
                date = now - (30L * 24 * 60 * 60 * 1000),
                invoiceNumber = "OB-AUG-26",
                description = "Opening Balance",
                debit = 18500.0,
                credit = 0.0,
                runningBalance = 18500.0
            ),
            PassbookEntry(
                id = "pb_2",
                retailerId = "ret_1",
                date = now - (20L * 24 * 60 * 60 * 1000),
                invoiceNumber = "PAY-NEFT-9182",
                description = "Payment received via NEFT Bank Ref 9182",
                debit = 0.0,
                credit = 25000.0,
                runningBalance = 0.0
            ),
            PassbookEntry(
                id = "pb_3",
                retailerId = "ret_1",
                date = now - (15L * 24 * 60 * 60 * 1000),
                invoiceNumber = "INV-2026-0842",
                description = "Tax Invoice INV-2026-0842 Goods Purchase",
                debit = 45000.0,
                credit = 0.0,
                runningBalance = 45000.0
            ),
            PassbookEntry(
                id = "pb_4",
                retailerId = "ret_1",
                date = now - (8L * 24 * 60 * 60 * 1000),
                invoiceNumber = "PAY-UPI-0291",
                description = "Payment via UPI GPay Ref 0291",
                debit = 0.0,
                credit = 36838.5,
                runningBalance = 8161.5
            ),
            PassbookEntry(
                id = "pb_5",
                retailerId = "ret_1",
                date = now - (5L * 24 * 60 * 60 * 1000),
                invoiceNumber = "INV-2026-0915",
                description = "Tax Invoice INV-2026-0915 Goods Purchase",
                debit = 30338.5,
                credit = 0.0,
                runningBalance = 38500.0
            )
        )
        _passbookEntries.value = initialPassbook
        savePassbookToPrefs()

        // Payment Reminder
        val initialReminders = listOf(
            PaymentReminder(
                id = "rem_1",
                retailerId = "ret_1",
                retailerName = "Kisan Agro Agency",
                retailerMobile = "9876543210",
                outstandingAmount = 38500.0,
                dueDate = now + (5L * 24 * 60 * 60 * 1000),
                message = "Dear Ramesh ji, please clear your outstanding invoice balance of ₹38,500 by this Friday.",
                createdAt = now - (1L * 24 * 60 * 60 * 1000)
            )
        )
        _paymentReminders.value = initialReminders
        savePaymentRemindersToPrefs()

        // Notifications
        val initialNotifications = listOf(
            AppNotification(
                id = "notif_1",
                title = "Order Dispatched: ORD-2026-104821",
                message = "Your order has been dispatched via Karnal Transport Co. LR No. 89123.",
                targetRetailerId = "ret_1",
                linkedType = "ORDER",
                linkedId = "ORD-2026-104821",
                timestamp = now - (1L * 24 * 60 * 60 * 1000),
                isRead = false
            ),
            AppNotification(
                id = "notif_2",
                title = "New bill uploaded",
                message = "Bill #INV-2026-0915 for ₹30,338.50 has been uploaded to your account.",
                targetRetailerId = "ret_1",
                linkedType = "BILL",
                linkedId = "bill_2",
                timestamp = now - (5L * 24 * 60 * 60 * 1000),
                isRead = true
            ),
            AppNotification(
                id = "notif_3",
                title = "📢 Special Offer: Monsoon Mega Scheme",
                message = "Enjoy 10% extra retailer margin on Nativo & Ampligo bookings.",
                targetRetailerId = "ALL",
                linkedType = "POSTER",
                linkedId = "poster_1",
                timestamp = now - (2L * 24 * 60 * 60 * 1000),
                isRead = false
            )
        )
        _notifications.value = initialNotifications
        saveNotificationsToPrefs()
    }
}
