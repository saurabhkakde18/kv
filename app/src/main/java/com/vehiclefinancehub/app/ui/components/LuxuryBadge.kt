package com.vehiclefinancehub.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vehiclefinancehub.app.ui.theme.EmeraldContainer
import com.vehiclefinancehub.app.ui.theme.EmeraldGlow
import com.vehiclefinancehub.app.ui.theme.GoldContainer
import com.vehiclefinancehub.app.ui.theme.GoldLight
import com.vehiclefinancehub.app.ui.theme.GoldPrimary
import com.vehiclefinancehub.app.ui.theme.RubyAlert
import com.vehiclefinancehub.app.ui.theme.RubyContainer
import com.vehiclefinancehub.app.ui.theme.SapphireContainer
import com.vehiclefinancehub.app.ui.theme.SapphireGlow

@Composable
fun LuxuryBadge(
    text: String,
    modifier: Modifier = Modifier,
    type: String = "default"
) {
    val (bg, textColor, borderColor) = when {
        text.equals("Approved", ignoreCase = true) || text.equals("Active", ignoreCase = true) || text.contains("New", ignoreCase = true) -> {
            Triple(EmeraldContainer, EmeraldGlow, EmeraldGlow.copy(alpha = 0.5f))
        }
        text.equals("Expired", ignoreCase = true) || text.contains("Mandatory", ignoreCase = true) -> {
            Triple(RubyContainer, Color(0xFFFCA5A5), RubyAlert.copy(alpha = 0.5f))
        }
        text.contains("Used", ignoreCase = true) || text.contains("Sedan", ignoreCase = true) || text.contains("SUV", ignoreCase = true) -> {
            Triple(SapphireContainer, SapphireGlow, SapphireGlow.copy(alpha = 0.4f))
        }
        else -> {
            Triple(GoldContainer, GoldLight, GoldPrimary.copy(alpha = 0.3f))
        }
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bg)
            .border(0.6.dp, borderColor, RoundedCornerShape(6.dp))
            .padding(horizontal = 7.dp, vertical = 2.5.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall.copy(
                color = textColor,
                fontWeight = FontWeight.SemiBold,
                fontSize = 10.5.sp
            ),
            maxLines = 1
        )
    }
}
