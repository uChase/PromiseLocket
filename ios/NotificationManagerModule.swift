//
//  NotificationManager.swift
//  PromiseLocket
//
//  Created by Chase Hameetman on 5/29/25.
//

import Foundation
import UserNotifications
import React

@objc(NotificationManagerModule)
class NotificationManagerModule: NSObject {
  
  // Request permission once, ideally at app launch
  @objc(requestPermission)
  func requestPermission() {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        print("Notification permission error:", error)
      } else {
        print("Notification permission granted:", granted)
      }
    }
  }

  // Schedule a notification after `seconds` from now and return the notification ID via Promise
  @objc(scheduleNotification:withTitle:withBody:resolve:reject:)
  func scheduleNotification(seconds: TimeInterval, title: String, body: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = body
    content.sound = .default

    let identifier = UUID().uuidString
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: seconds, repeats: false)
    let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger)

    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        print("Error scheduling notification:", error)
        reject("NOTIFICATION_ERROR", "Failed to schedule notification", error)
      } else {
        print("Notification scheduled with ID: \(identifier)")
        resolve(identifier)
      }
    }
  }

  // Cancel a specific notification by ID
  @objc(cancelNotification:)
  func cancelNotification(identifier: String) {
    UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [identifier])
  }
}
