//
//  MyTimerModuleModule.swift
//  PromiseLocket
//
//  Created by Chase Hameetman on 5/28/25.
//

import Foundation
import ActivityKit
import React

@objc(MyTimerModule)
class MyTimerModule : NSObject {
  
  private static var timerState: [String: Any] = [
            "endTime": 0.0,
            "seconds": Int32(0),
            "isPaused": false,
            "activityId": "",
            "duration": Int32(0),
            "notifId": ""
    ]
  
  
  @objc(startTimer:resolve:reject:)
  func startTimer(duration: Int32, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock){
    do{
      let startTime = Date()
      let endTime = startTime.addingTimeInterval(TimeInterval(duration))
      let attributes = MyTimerAttributes(name: "Timer", duration: duration)
      let contentState = MyTimerAttributes.ContentState(endTime: endTime, seconds: duration, isPaused: false)
      let activity = try Activity<MyTimerAttributes>.request(attributes: attributes, contentState: contentState, pushType: nil)
      // Update in-memory state
      MyTimerModule.timerState = [
          "endTime": endTime.timeIntervalSince1970,
          "seconds": duration,
          "isPaused": false,
          "activityId": activity.id,
          "duration": duration
      ]
      NotificationManagerModule().scheduleNotification(seconds: Double(duration), title: "Timer Complete", body: "Your timer is complete!") { notifId in
          MyTimerModule.timerState["notifId"] = notifId
          resolve(activity.id)
      } reject: { code, msg, error in
          print("Failed to schedule notification:", msg)
          resolve(activity.id) // Timer started even if notification failed
      }
      
      
    } catch(_)
    {
      reject("ERROR", "Failed to start timer", nil)
    }
  }
  
  @objc(puaseTimer:)
  func puaseTimer(activityId: String) {
      Task {
        
          if MyTimerModule.timerState["isPaused"] as? Bool == true {
                  print("Timer is already paused")
                  return
              }
          guard let activity = Activity<MyTimerAttributes>.activities.first(where: { $0.id == activityId }) else {
              print("Activity not found")
              return
          }

          // Calculate remaining time
          let currentTime = Date()
          let endTime = Date(timeIntervalSince1970: MyTimerModule.timerState["endTime"] as? TimeInterval ?? 0.0)
          let remaining = max(0, Int32(endTime.timeIntervalSince(currentTime)))

          // Update content state to paused
          let updatedState = MyTimerAttributes.ContentState(
              endTime: endTime,
              seconds: remaining,
              isPaused: true
          )
          await activity.update(using: updatedState)

          // Update local memory
          MyTimerModule.timerState["seconds"] = remaining
          MyTimerModule.timerState["isPaused"] = true
        
        NotificationManagerModule().cancelNotification(identifier: MyTimerModule.timerState["notifId"] as! String)
      }
  }
  
  @objc(resumeTimer:)
  func resumeTimer(activityId: String) {
      Task {
          // Check if already resumed
          if MyTimerModule.timerState["isPaused"] as? Bool == false {
              print("Timer is already running")
              return
          }

          // Find the activity
          guard let activity = Activity<MyTimerAttributes>.activities.first(where: { $0.id == activityId }) else {
              print("Activity not found")
              return
          }

          let currentTime = Date()
          let remaining = MyTimerModule.timerState["seconds"] as? Int32 ?? 0
          let newEndTime = currentTime.addingTimeInterval(TimeInterval(remaining))

          // Update Live Activity content state
          let updatedState = MyTimerAttributes.ContentState(
              endTime: newEndTime,
              seconds: remaining,
              isPaused: false
          )
          await activity.update(using: updatedState)

          // Update in-memory state
          MyTimerModule.timerState["endTime"] = newEndTime.timeIntervalSince1970
          MyTimerModule.timerState["isPaused"] = false
        
          NotificationManagerModule().scheduleNotification(seconds: Double(remaining), title: "Timer Complete", body: "Your timer is complete!") { notifId in
              MyTimerModule.timerState["notifId"] = notifId
          } reject: { code, msg, error in
              print("Failed to schedule notification:", msg)
          }
        
          
      }
  }
  
  @objc(endTimer:)
  func endTimer(activityId: String) {
    Task {
      guard let activity = Activity<MyTimerAttributes>.activities.first(where: { $0.id == activityId }) else {
          print("Activity not found")
          return
      }
      
      await activity.end(using: nil, dismissalPolicy: .immediate)
      
      NotificationManagerModule().cancelNotification(identifier: MyTimerModule.timerState["notifId"] as! String)
      
      MyTimerModule.timerState = [
        "endTime": 0.0,
        "seconds": Int32(0),
        "isPaused": false,
        "activityId": "",
        "duration": Int32(0),
        "notifId": ""
    ]
      
    
      
      
       
    }
  }
  
  @objc(getTimerState:reject:)
  func getTimerState(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let endTime = MyTimerModule.timerState["endTime"] as? Double ?? 0
    let duration = MyTimerModule.timerState["duration"] as? Int32 ?? 0
    let isPaused = MyTimerModule.timerState["isPaused"] as? Bool ?? false
    let seconds = isPaused ? (MyTimerModule.timerState["seconds"] as? Int32 ?? 0) : max(0, Int32(endTime - Date().timeIntervalSince1970))
    
    resolve([
        "endTime": endTime,
        "seconds": seconds,
        "isPaused": isPaused,
        "activityId": MyTimerModule.timerState["activityId"] as? String ?? "",
        "duration": duration
    ])
    
  }
}
