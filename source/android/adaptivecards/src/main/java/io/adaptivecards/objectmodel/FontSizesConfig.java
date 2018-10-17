/* ----------------------------------------------------------------------------
 * This file was automatically generated by SWIG (http://www.swig.org).
 * Version 3.0.12
 *
 * Do not make changes to this file unless you know what you are doing--modify
 * the SWIG interface file instead.
 * ----------------------------------------------------------------------------- */

package io.adaptivecards.objectmodel;

public class FontSizesConfig {
  private transient long swigCPtr;
  protected transient boolean swigCMemOwn;

  protected FontSizesConfig(long cPtr, boolean cMemoryOwn) {
    swigCMemOwn = cMemoryOwn;
    swigCPtr = cPtr;
  }

  protected static long getCPtr(FontSizesConfig obj) {
    return (obj == null) ? 0 : obj.swigCPtr;
  }

  protected void finalize() {
    delete();
  }

  public synchronized void delete() {
    if (swigCPtr != 0) {
      if (swigCMemOwn) {
        swigCMemOwn = false;
        AdaptiveCardObjectModelJNI.delete_FontSizesConfig(swigCPtr);
      }
      swigCPtr = 0;
    }
  }

  public FontSizesConfig() {
    this(AdaptiveCardObjectModelJNI.new_FontSizesConfig__SWIG_0(), true);
  }

  public FontSizesConfig(long smallFontSize, long defaultFontSize, long mediumFontSize, long largeFontSize, long extraLargeFontSize) {
    this(AdaptiveCardObjectModelJNI.new_FontSizesConfig__SWIG_1(smallFontSize, defaultFontSize, mediumFontSize, largeFontSize, extraLargeFontSize), true);
  }

  public static FontSizesConfig Deserialize(JsonValue json, FontSizesConfig defaultValue) {
    return new FontSizesConfig(AdaptiveCardObjectModelJNI.FontSizesConfig_Deserialize(JsonValue.getCPtr(json), json, FontSizesConfig.getCPtr(defaultValue), defaultValue), true);
  }

  public static long GetDefaultFontSize(TextSize size) {
    return AdaptiveCardObjectModelJNI.FontSizesConfig_GetDefaultFontSize(size.swigValue());
  }

  public long GetFontSize(TextSize size) {
    return AdaptiveCardObjectModelJNI.FontSizesConfig_GetFontSize(swigCPtr, this, size.swigValue());
  }

  public void SetFontSize(TextSize size, long value) {
    AdaptiveCardObjectModelJNI.FontSizesConfig_SetFontSize(swigCPtr, this, size.swigValue(), value);
  }

}
