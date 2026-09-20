package com.example.data.model

enum class UserRole {
    ADMIN,
    RETAILER
}

data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val mobileNumber: String = "",
    val role: UserRole = UserRole.RETAILER,
    val retailerId: String = ""
)

data class AdminUser(
    val id: String = "",
    val email: String = "",
    val name: String = ""
)

data class DistributorProfile(
    val companyName: String = "AgroRetail Distributors Pvt Ltd",
    val ownerName: String = "Suresh Sharma",
    val email: String = "contact@agroretaildistributors.com",
    val phone: String = "9876543210",
    val gstin: String = "07AAAAA0000A1Z5",
    val address: String = "Main Mandi Road, Sector 14, Karnal, Haryana",
    val city: String = "Karnal",
    val state: String = "Haryana",
    val bankName: String = "State Bank of India",
    val accountNumber: String = "389201948210",
    val ifscCode: String = "SBIN0001234",
    val upiId: String = "agrodistributor@sbi"
)

data class Retailer(
    val id: String = "",
    val businessName: String = "",
    val retailerName: String = "",
    val mobileNumber: String = "",
    val alternatePhone: String = "",
    val email: String = "",
    val pinHash: String = "",
    val address: String = "",
    val city: String = "",
    val state: String = "",
    val gstNumber: String = "",
    val creditLimit: Double = 0.0,
    val outstandingAmount: Double = 0.0,
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Product(
    val id: String = "",
    val itemCode: String = "",
    val itemName: String = "",
    val alias: String = "",
    val company: String = "",
    val category: String = "", // e.g. Pesticides, Fertilizers, Seeds, Bio-Nutrients
    val subCategory: String = "",
    val unit: String = "Bottle", // Kg, Ltr, Bag, Bottle, Pkt
    val packSize: String = "1 Ltr",
    val packing: String = "Box of 10",
    val purchaseRate: Double = 0.0,
    val sellingRate: Double = 0.0,
    val mrp: Double = 0.0,
    val gstPercent: Double = 18.0,
    val hsnCode: String = "",
    val barcode: String = "",
    val openingStock: Double = 0.0,
    val currentStock: Double = 0.0,
    val description: String = "",
    val imageUrl: String = "",
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

data class Company(
    val id: String = "",
    val name: String = "",
    val logoUrl: String = "",
    val description: String = "",
    val contactPerson: String = "",
    val phone: String = "",
    val email: String = "",
    val isActive: Boolean = true
)

enum class OrderStatus {
    Pending,
    Confirmed,
    Packed,
    Dispatched,
    Delivered,
    Cancelled
}

data class OrderItem(
    val productId: String = "",
    val itemCode: String = "",
    val itemName: String = "",
    val packSize: String = "",
    val quantity: Int = 1,
    val rate: Double = 0.0,
    val gstPercent: Double = 0.0,
    val total: Double = 0.0,
    val imageUrl: String = ""
)

data class Order(
    val id: String = "", // ORD-2026-000001
    val retailerId: String = "",
    val retailerName: String = "",
    val retailerBusinessName: String = "",
    val retailerMobile: String = "",
    val dateTime: Long = System.currentTimeMillis(),
    val items: List<OrderItem> = emptyList(),
    val subTotal: Double = 0.0,
    val gstTotal: Double = 0.0,
    val grandTotal: Double = 0.0,
    val notes: String = "",
    val status: OrderStatus = OrderStatus.Pending,
    val adminNotes: String = "",
    val updatedAt: Long = System.currentTimeMillis()
)

data class Bill(
    val id: String = "",
    val billNumber: String = "",
    val retailerId: String = "",
    val retailerName: String = "",
    val billDate: Long = System.currentTimeMillis(),
    val amount: Double = 0.0,
    val pdfUrl: String = "",
    val originalFileName: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

data class PassbookEntry(
    val id: String = "",
    val retailerId: String = "",
    val date: Long = System.currentTimeMillis(),
    val invoiceNumber: String = "",
    val description: String = "",
    val debit: Double = 0.0,
    val credit: Double = 0.0,
    val runningBalance: Double = 0.0
)

data class Statement(
    val id: String = "",
    val retailerId: String = "",
    val retailerName: String = "",
    val documentType: String = "Account Statement", // Account Statement, Passbook, Other
    val title: String = "",
    val period: String = "",
    val pdfUrl: String = "",
    val originalFileName: String = "",
    val uploadedAt: Long = System.currentTimeMillis()
)

data class Poster(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val imageUrl: String = "",
    val fileType: String = "IMAGE", // IMAGE, PDF
    val startDate: Long = System.currentTimeMillis(),
    val endDate: Long = System.currentTimeMillis() + (30L * 24 * 60 * 60 * 1000), // default +30 days
    val priority: Int = 1, // lower number = higher priority
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis(),
    val createdBy: String = "Admin",
    val notificationTitle: String = "",
    val notificationMessage: String = ""
)

data class AppNotification(
    val id: String = "",
    val title: String = "",
    val message: String = "",
    val targetRetailerId: String = "ALL", // "ALL" or specific retailerId
    val linkedType: String = "NONE", // ORDER, BILL, PASSBOOK, STATEMENT, POSTER, PAYMENT_REMINDER, NONE
    val linkedId: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val isRead: Boolean = false
)

data class PaymentReminder(
    val id: String = "",
    val retailerId: String = "",
    val retailerName: String = "",
    val retailerMobile: String = "",
    val outstandingAmount: Double = 0.0,
    val dueDate: Long = System.currentTimeMillis() + (7L * 24 * 60 * 60 * 1000),
    val message: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val isPaid: Boolean = false,
    val snoozedUntil: Long = 0L
)

data class ImportHistoryItem(
    val id: String = "",
    val fileName: String = "",
    val adminName: String = "Admin",
    val timestamp: Long = System.currentTimeMillis(),
    val totalRows: Int = 0,
    val imported: Int = 0,
    val updated: Int = 0,
    val skipped: Int = 0,
    val errors: Int = 0,
    val errorReport: List<String> = emptyList(),
    val stockImportMode: String = "REPLACE" // REPLACE or ADD
) {
    val status: String get() = if (errors == 0) "SUCCESS" else "WITH_ERRORS"
    val errorLogs: List<String> get() = errorReport
}

data class CartItem(
    val product: Product,
    val quantity: Int
) {
    val totalAmount: Double get() = product.sellingRate * quantity
    val gstAmount: Double get() = totalAmount * (product.gstPercent / 100.0)
    val grandTotal: Double get() = totalAmount + gstAmount
}
