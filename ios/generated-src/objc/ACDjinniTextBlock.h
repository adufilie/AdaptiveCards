// AUTOGENERATED FILE - DO NOT MODIFY!
// This file generated by Djinni from adaptivecards.djinni

#import "ACDjinniTextColor.h"
#import <Foundation/Foundation.h>
@class ACDjinniBaseCardElement;
@class ACDjinniTextBlock;


@interface ACDjinniTextBlock : NSObject

+ (nullable ACDjinniTextBlock *)Create;

+ (nullable ACDjinniTextBlock *)Deserialize:(nonnull NSString *)jsonString;

- (void)SetText:(nonnull NSString *)text;

- (nonnull NSString *)GetText;

- (void)SetWrap:(BOOL)wrap;

- (BOOL)GetWrap;

- (void)SetTextColor:(ACDjinniTextColor)textColor;

- (ACDjinniTextColor)GetTextColor;

- (nullable ACDjinniBaseCardElement *)AsBaseCardElement;

@end