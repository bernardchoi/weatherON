# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# expo-location maps JavaScript option objects to Kotlin Record classes at runtime.
# Keep their constructors, fields, and annotations in R8 release builds.
-keepattributes RuntimeVisibleAnnotations,RuntimeInvisibleAnnotations,RuntimeVisibleParameterAnnotations,RuntimeInvisibleParameterAnnotations,AnnotationDefault,Signature,InnerClasses,EnclosingMethod
-keep class expo.modules.location.records.** { *; }
-keep class expo.modules.kotlin.records.** { *; }

# expo-notifications persists scheduled requests through Java serialization.
# R8 must retain the private serialization hooks that convert JSONObject payloads.
-keepclassmembers class expo.modules.notifications.** implements java.io.Serializable {
    private static final long serialVersionUID;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    private void readObjectNoData();
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Add any project specific keep options here:
