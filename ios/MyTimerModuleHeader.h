//
//  MyTimerModuleHeader.h
//  PromiseLocket
//
//  Created by Chase Hameetman on 5/28/25.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MyTimerModule, NSObject)

// startTimer(duration: Int32) → Promise
RCT_EXTERN_METHOD(startTimer:(int)duration
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// puaseTimer(activityId: String)
RCT_EXTERN_METHOD(puaseTimer:(NSString *)activityId)

// resumeTimer(activityId: String)
RCT_EXTERN_METHOD(resumeTimer:(NSString *)activityId)

// endTimer(activityId: String)
RCT_EXTERN_METHOD(endTimer:(NSString *)activityId)

// getTimerState() → Promise
RCT_EXTERN_METHOD(getTimerState:(RCTPromiseResolveBlock)resolve
                  resject:(RCTPromiseRejectBlock)reject)

@end
