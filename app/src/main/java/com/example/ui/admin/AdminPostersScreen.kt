package com.example.ui.admin

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import coil.compose.AsyncImage
import com.example.data.model.Poster
import com.example.data.repository.AgroRepository
import com.example.ui.components.EmptyStateView
import com.example.ui.components.formatDateShort
import com.example.ui.theme.ForestGreenPrimary
import com.example.ui.theme.HarvestAmber
import com.example.util.AgroImagePresets

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminPostersScreen(
    repository: AgroRepository
) {
    val context = LocalContext.current
    val posters by repository.posters.collectAsState()

    var isAddingPoster by remember { mutableStateOf(false) }
    var posterBeingEdited by remember { mutableStateOf<Poster?>(null) }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = { isAddingPoster = true },
                containerColor = ForestGreenPrimary,
                contentColor = Color.White
            ) {
                Icon(Icons.Default.AddPhotoAlternate, contentDescription = "Add Poster")
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(MaterialTheme.colorScheme.background)
        ) {
            if (posters.isEmpty()) {
                EmptyStateView(
                    icon = Icons.Default.Campaign,
                    title = "No Promotional Posters",
                    message = "Publish company schemes, discounts, and product launches with banners to retailers' home screens.",
                    actionButtonText = "+ Create New Poster",
                    onActionClick = { isAddingPoster = true },
                    modifier = Modifier.weight(1f)
                )
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(posters, key = { it.id }) { poster ->
                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column {
                                // Poster Banner Image Preview
                                val resolvedImage = poster.imageUrl.ifBlank {
                                    AgroImagePresets.getAutomaticPosterPhoto(poster.title)
                                }
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(130.dp)
                                        .background(MaterialTheme.colorScheme.surfaceVariant)
                                ) {
                                    AsyncImage(
                                        model = resolvedImage,
                                        contentDescription = poster.title,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                    Surface(
                                        shape = RoundedCornerShape(bottomEnd = 8.dp),
                                        color = Color.Black.copy(alpha = 0.65f),
                                        modifier = Modifier.align(Alignment.TopStart)
                                    ) {
                                        Text(
                                            text = "Priority ${poster.priority}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = HarvestAmber,
                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                        )
                                    }
                                }

                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = poster.title,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 16.sp,
                                            modifier = Modifier.weight(1f)
                                        )

                                        Switch(
                                            checked = poster.isActive,
                                            onCheckedChange = { repository.togglePosterActive(poster.id) },
                                            modifier = Modifier.size(36.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))

                                    Text(
                                        text = poster.description,
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )

                                    Spacer(modifier = Modifier.height(6.dp))

                                    Text(
                                        text = "Valid: ${formatDateShort(poster.startDate)} - ${formatDateShort(poster.endDate)}",
                                        fontSize = 11.sp,
                                        color = ForestGreenPrimary
                                    )

                                    Spacer(modifier = Modifier.height(10.dp))
                                    HorizontalDivider(color = MaterialTheme.colorScheme.outline.copy(alpha = 0.15f))
                                    Spacer(modifier = Modifier.height(6.dp))

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        TextButton(
                                            onClick = {
                                                repository.broadcastPushNotification(
                                                    title = "New Scheme: ${poster.title}",
                                                    message = poster.description,
                                                    linkedType = "POSTER",
                                                    linkedId = poster.id
                                                )
                                                Toast.makeText(context, "Push notification sent to all retailers!", Toast.LENGTH_SHORT).show()
                                            }
                                        ) {
                                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text("Push to All Retailers", fontSize = 12.sp)
                                        }

                                        Row {
                                            IconButton(onClick = { posterBeingEdited = poster }) {
                                                Icon(Icons.Default.Edit, contentDescription = "Edit", tint = ForestGreenPrimary)
                                            }
                                            IconButton(onClick = {
                                                repository.deletePoster(poster.id)
                                                Toast.makeText(context, "Poster removed", Toast.LENGTH_SHORT).show()
                                            }) {
                                                Icon(Icons.Default.DeleteOutline, contentDescription = "Delete", tint = MaterialTheme.colorScheme.error)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (isAddingPoster || posterBeingEdited != null) {
        val initial = posterBeingEdited ?: Poster()
        var title by remember { mutableStateOf(initial.title) }
        var description by remember { mutableStateOf(initial.description) }
        var imageUrl by remember { mutableStateOf(initial.imageUrl) }
        var priority by remember { mutableStateOf(initial.priority.toString()) }
        var sendPushOnSave by remember { mutableStateOf(true) }

        val photoPickerLauncher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.PickVisualMedia()
        ) { uri: Uri? ->
            if (uri != null) {
                imageUrl = uri.toString()
                Toast.makeText(context, "Photo selected from device gallery!", Toast.LENGTH_SHORT).show()
            }
        }

        val effectivePreviewImage = remember(imageUrl, title) {
            if (imageUrl.isNotBlank()) imageUrl else AgroImagePresets.getAutomaticPosterPhoto(title)
        }

        Dialog(onDismissRequest = {
            isAddingPoster = false
            posterBeingEdited = null
        }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.92f)
                    .padding(4.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (initial.id.isBlank()) "New Promotional Poster" else "Edit Poster",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = ForestGreenPrimary
                        )
                        IconButton(onClick = {
                            isAddingPoster = false
                            posterBeingEdited = null
                        }) {
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
                        // Poster Banner Photo Upload & Live Preview
                        Text("Poster Photo / Banner", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = ForestGreenPrimary)

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .border(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.2f), RoundedCornerShape(10.dp))
                        ) {
                            AsyncImage(
                                model = effectivePreviewImage,
                                contentDescription = "Poster Preview",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            Surface(
                                shape = RoundedCornerShape(bottomStart = 8.dp),
                                color = Color.Black.copy(alpha = 0.65f),
                                modifier = Modifier.align(Alignment.TopEnd)
                            ) {
                                Text(
                                    text = if (imageUrl.isNotBlank()) "Custom Photo" else "Auto Agro Banner",
                                    fontSize = 10.sp,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Button(
                                onClick = {
                                    photoPickerLauncher.launch(
                                        PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                                    )
                                },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                            ) {
                                Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Upload Photo", fontSize = 12.sp)
                            }

                            if (imageUrl.isNotBlank()) {
                                OutlinedButton(
                                    onClick = { imageUrl = "" },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.AutoFixHigh, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Auto Preset", fontSize = 12.sp)
                                }
                            }
                        }

                        // Presets Quick Selector
                        Text("Or choose Agriculture Template Banner:", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(AgroImagePresets.POSTER_PRESETS) { preset ->
                                Box(
                                    modifier = Modifier
                                        .size(width = 80.dp, height = 50.dp)
                                        .clip(RoundedCornerShape(6.dp))
                                        .border(
                                            width = if (imageUrl == preset.url) 2.dp else 1.dp,
                                            color = if (imageUrl == preset.url) ForestGreenPrimary else MaterialTheme.colorScheme.outline.copy(alpha = 0.3f),
                                            shape = RoundedCornerShape(6.dp)
                                        )
                                        .clickable { imageUrl = preset.url }
                                ) {
                                    AsyncImage(
                                        model = preset.url,
                                        contentDescription = preset.title,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                            }
                        }

                        OutlinedTextField(
                            value = imageUrl,
                            onValueChange = { imageUrl = it },
                            label = { Text("Photo / Image URL (or upload above)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            placeholder = { Text("https://... or content://") }
                        )

                        OutlinedTextField(
                            value = title,
                            onValueChange = { title = it },
                            label = { Text("Scheme / Poster Title *") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            label = { Text("Scheme Offer Details *") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 2
                        )

                        OutlinedTextField(
                            value = priority,
                            onValueChange = { if (it.all { c -> c.isDigit() }) priority = it },
                            label = { Text("Display Priority (1 = First, 2 = Second...)") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Checkbox(checked = sendPushOnSave, onCheckedChange = { sendPushOnSave = it })
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(text = "Send Instant Push Notification to Retailers", fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                isAddingPoster = false
                                posterBeingEdited = null
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Cancel")
                        }

                        Button(
                            onClick = {
                                if (title.isBlank()) return@Button
                                val updated = initial.copy(
                                    title = title.trim(),
                                    description = description.trim(),
                                    imageUrl = imageUrl.trim(),
                                    priority = priority.toIntOrNull() ?: 1,
                                    isActive = true
                                )
                                repository.savePoster(
                                    poster = updated,
                                    sendPushNotification = sendPushOnSave,
                                    targetRetailerOption = "ALL"
                                )
                                Toast.makeText(context, "Poster published successfully!", Toast.LENGTH_SHORT).show()
                                isAddingPoster = false
                                posterBeingEdited = null
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(containerColor = ForestGreenPrimary)
                        ) {
                            Text("Publish")
                        }
                    }
                }
            }
        }
    }
}
