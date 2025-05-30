//
//  NotificationManagerHeader.m
//  PromiseLocket
//
//  Created by Chase Hameetman on 5/29/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NotificationManagerModule, NSObject)

RCT_EXTERN_METHOD(requestPermission)

RCT_EXTERN_METHOD(scheduleNotification:(double)seconds
                  withTitle:(NSString *)title
                  withBody:(NSString *)body
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancelNotification:(NSString *)identifier)

@end
