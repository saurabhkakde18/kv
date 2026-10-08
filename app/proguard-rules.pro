# Proguard rules for Vehicle Finance Hub
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
-keep class com.vehiclefinancehub.app.data.model.** { *; }
