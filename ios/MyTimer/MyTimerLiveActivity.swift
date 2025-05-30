//
//  MyTimerLiveActivity.swift
//  MyTimer
//
//  Created by Chase Hameetman on 5/28/25.
//

import ActivityKit
import WidgetKit
import SwiftUI

struct MyTimerAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
      let endTime: Date
      let seconds: Int32
      let isPaused: Bool
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
  let duration: Int32
}

struct MyTimerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: MyTimerAttributes.self) { context in
            // Lock screen/banner UI goes here
          HStack {
            Text("Timer")
                .font(.headline)
                .foregroundColor(.white)
            if context.state.isPaused {
                // Display static seconds when paused
                Text(formatSeconds(context.state.seconds))
                    .font(.title2)
                    .monospacedDigit()
                    .foregroundColor(.white)
            } else {
                // Display countdown timer
                Text(timerInterval: Date()...context.state.endTime, countsDown: true)
                    .font(.title2)
                    .monospacedDigit()
                    .foregroundColor(.white)
            }
          }
          .padding()
                      .activityBackgroundTint(.black.opacity(0.8))
                      .activitySystemActionForegroundColor(.white)

        } dynamicIsland: { context in
          // Minimal Dynamic Island configuration (no visible content)
          DynamicIsland {
              DynamicIslandExpandedRegion(.leading) { EmptyView() }
              DynamicIslandExpandedRegion(.trailing) { EmptyView() }
              DynamicIslandExpandedRegion(.center) { EmptyView() }
              DynamicIslandExpandedRegion(.bottom) { EmptyView() }
          } compactLeading: { EmptyView() }
          compactTrailing: { EmptyView() }
          minimal: { EmptyView() }
      }
    }
    private func formatSeconds(_ seconds: Int32) -> String {
          let hours = seconds / 3600
          let minutes = (seconds % 3600) / 60
          let secs = seconds % 60
          return String(format: "%02d:%02d:%02d", hours, minutes, secs)
      }
}

