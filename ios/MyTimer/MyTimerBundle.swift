//
//  MyTimerBundle.swift
//  MyTimer
//
//  Created by Chase Hameetman on 5/28/25.
//

import WidgetKit
import SwiftUI

@main
struct MyTimerBundle: WidgetBundle {
    var body: some Widget {
        MyTimer()
        MyTimerControl()
        MyTimerLiveActivity()
    }
}
