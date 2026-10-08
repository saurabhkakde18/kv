package com.vehiclefinancehub.app.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// =================== LUXURY FINTECH PALETTE ===================

// Imperial Gold Accents
val GoldPrimary = Color(0xFFD4AF37)
val GoldLight = Color(0xFFF5E6B3)
val GoldDark = Color(0xFFA07C1C)
val GoldMuted = Color(0xFF785F18)
val GoldContainer = Color(0xFF2E2408)

// Obsidian & Midnight Backgrounds (Dark Mode)
val ObsidianDark = Color(0xFF080D1A)
val ObsidianSurface = Color(0xFF0F172A)
val ObsidianCard = Color(0xFF162238)
val ObsidianElevated = Color(0xFF1E2D4A)
val ObsidianBorder = Color(0xFF2D3F63)

// Pure Light Theme (Gold & Slate)
val LightBg = Color(0xFFF8FAFC)
val LightSurface = Color(0xFFFFFFFF)
val LightCard = Color(0xFFF1F5F9)
val LightBorder = Color(0xFFE2E8F0)
val LightTextPrimary = Color(0xFF0F172A)
val LightTextSecondary = Color(0xFF64748B)

// Sapphire Cobalt & Electric Blue
val SapphirePrimary = Color(0xFF3B82F6)
val SapphireGlow = Color(0xFF60A5FA)
val SapphireDark = Color(0xFF1D4ED8)
val SapphireContainer = Color(0xFF1E3A8A)

// Emerald & Success
val EmeraldSuccess = Color(0xFF10B981)
val EmeraldGlow = Color(0xFF34D399)
val EmeraldContainer = Color(0xFF064E3B)

// Ruby & Alert
val RubyAlert = Color(0xFFEF4444)
val RubyContainer = Color(0xFF450A0A)

// Amber / Warning
val AmberWarning = Color(0xFFF59E0B)

// Text Colors (Dark Mode)
val TextPrimaryDark = Color(0xFFF8FAFC)
val TextSecondaryDark = Color(0xFF94A3B8)
val TextMutedDark = Color(0xFF64748B)

// Luxury Gradients
val LuxuryGoldGradient = Brush.linearGradient(
    colors = listOf(Color(0xFFE5C07B), Color(0xFFD4AF37), Color(0xFFAA820A))
)

val LuxuryCardGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF19253E), Color(0xFF0F172A))
)

val LuxuryBlueGradient = Brush.linearGradient(
    colors = listOf(Color(0xFF1E3A8A), Color(0xFF2563EB), Color(0xFF3B82F6))
)

val GoldBorderGradient = Brush.linearGradient(
    colors = listOf(Color(0xFFD4AF37), Color(0x40D4AF37), Color(0xFFD4AF37))
)
