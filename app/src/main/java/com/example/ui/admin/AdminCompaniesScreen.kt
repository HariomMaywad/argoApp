package com.example.ui.admin

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.Company
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.theme.ForestGreenPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminCompaniesScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val companies by repository.companies.collectAsState()
    val products by repository.products.collectAsState()

    var companyBeingEdited by remember { mutableStateOf<Company?>(null) }
    var isAddingCompany by remember { mutableStateOf(false) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddingCompany = true },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.AddBusiness, contentDescription = "Add Company")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            if (companies.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Business,
                    title = "No Companies Found",
                    message = "Add partner chemical, seed, and fertilizer manufacturing companies.",
                    actionButtonText = "+ Add Company",
                    onActionClick = { isAddingCompany = true },
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(companies, key = { it.id }) { company ->
                        val count = products.count { it.company.equals(company.name, ignoreCase = true) }
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
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = company.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp
                                    )
                                    Text(
                                        text = company.description,
                                        fontSize = 11.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                    Text(
                                        text = "Contact: ${company.contactPerson.ifBlank { "N/A" }} (${company.phone}) • $count Products",
                                        fontSize = 11.sp,
                                        color = ForestGreenPrimary
                                    )
                                }

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Switch(
                                        checked = company.isActive,
                                        onCheckedChange = { repository.toggleCompanyActive(company.id) },
                                        modifier = Modifier.size(36.dp)
                                    )
                                    IconButton(onClick = { companyBeingEdited = company }) {
                                        Icon(Icons.Default.Edit, contentDescription = "Edit", tint = ForestGreenPrimary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (isAddingCompany || companyBeingEdited != null) {
        val editing = companyBeingEdited ?: Company()
        var name by remember { mutableStateOf(editing.name) }
        var description by remember { mutableStateOf(editing.description) }
        var contactPerson by remember { mutableStateOf(editing.contactPerson) }
        var phone by remember { mutableStateOf(editing.phone) }
        var email by remember { mutableStateOf(editing.email) }
        var isActive by remember { mutableStateOf(editing.isActive) }

        Dialog(onDismissRequest = {
            isAddingCompany = false
            companyBeingEdited = null
        }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.padding(12.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = if (editing.id.isBlank()) "Add Company" else "Edit Company",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Company Name *") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Description") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = contactPerson,
                        onValueChange = { contactPerson = it },
                        label = { Text("Contact Person") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        label = { Text("Phone Number") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text("Email") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                isAddingCompany = false
                                companyBeingEdited = null
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel")
                        }

                        Button(
                            onClick = {
                                if (name.isBlank()) return@Button
                                val comp = editing.copy(
                                    name = name.trim(),
                                    description = description.trim(),
                                    contactPerson = contactPerson.trim(),
                                    phone = phone.trim(),
                                    email = email.trim(),
                                    isActive = isActive
                                )
                                repository.saveCompany(comp)
                                Toast.makeText(context, "Company saved", Toast.LENGTH_SHORT).show()
                                isAddingCompany = false
                                companyBeingEdited = null
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                        ) {
                            Text("Save")
                        }
                    }
                }
            }
        }
    }
}
