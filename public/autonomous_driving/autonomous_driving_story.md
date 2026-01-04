# Autonomous Driving System — End-to-End Perception & Decision Pipeline

## Overview
This project implements an end-to-end autonomous driving perception and decision system using a single front-facing camera. The goal was not to build isolated computer vision models, but to design a **coherent pipeline** that transforms raw visual input into driving-relevant decisions such as steering direction and stopping behavior. The system was developed as my diploma thesis and covers multiple perception subtasks integrated into a single workflow.

---

## System Architecture
**Camera Input → Perception Modules → Decision Logic → Driving Command**

The pipeline operates frame-by-frame and combines multiple vision-based components:
- Lane detection and road geometry estimation
- Traffic sign detection and classification
- Traffic light recognition
- Object detection with distance estimation
- Drivable area segmentation

Each module contributes structured information that feeds into lightweight decision logic, producing interpretable driving actions (e.g., turn left/right, go straight, stop).

---

## Core Subsystems

### 1. Lane Detection & Steering Advice
- Detects lane boundaries using image processing and learned features.
- Estimates lane geometry to infer road direction.
- Produces discrete driving suggestions: **TURN LEFT**, **TURN RIGHT**, or **GO STRAIGHT**.
- Demonstrates closed-loop reasoning: perception → geometry → control suggestion.

### 2. Traffic Sign Recognition
- Detects traffic signs in real driving scenes.
- Classifies signs (e.g., STOP) with high confidence (~99% accuracy on test data).
- Uses confidence thresholds to reduce false positives.
- Designed as a safety-critical perception module rather than a standalone classifier.

### 3. Traffic Light Classification
- Identifies traffic lights and classifies their state (e.g., red).
- Integrated with decision rules where misclassification has high cost.
- Emphasizes conservative behavior (false negatives preferred over false positives).

### 4. Object Detection & Distance Estimation
- Detects dynamic and static objects (cars, pedestrians, animals).
- Estimates approximate distance from the ego vehicle.
- Enables basic spatial reasoning and safety-aware decisions.
- Highlights risk assessment rather than raw detection accuracy.

### 5. Drivable Area Segmentation
- Segments the drivable road region from the scene.
- Tested in both day and night conditions to evaluate robustness.
- Used to constrain planning to valid road areas and ignore irrelevant regions.

---

## Key Technical Challenges
- **System integration**: Ensuring independent perception modules produce compatible and usable outputs.
- **Real-world variability**: Handling lighting changes, cluttered urban scenes, and imperfect camera input.
- **Safety constraints**: Designing conservative decision rules for traffic lights and obstacles.
- **Balancing complexity**: Favoring interpretable logic over opaque end-to-end control policies.

---

## Limitations
- Camera-only perception (no LiDAR, radar, or sensor fusion).
- No end-to-end vehicle control loop (focus is perception + decision logic).
- Performance sensitive to extreme weather and severe visual occlusions.
- Designed for research and demonstration, not production deployment.

---

## Key Takeaway
This project demonstrates my ability to design **complete computer vision systems**, not just individual models. It emphasizes system thinking, integration of multiple perception tasks, and translating visual understanding into actionable decisions under safety constraints.
