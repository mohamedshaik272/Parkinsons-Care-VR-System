# Parkinson's Care VR System

![1st Place Grand Prize & Patient Safety Award](https://img.shields.io/badge/1st_Place-H2AI_Hackathon-gold)
![Status](https://img.shields.io/badge/Status-Prototype-blue)

> A comprehensive AI-powered system integrating VR assessments, speech analysis, and machine learning to improve care for Parkinson's patients. Developed during the Georgetown University H2AI Hackathon, winning 1st Place Grand Prize and Patient Safety Award.

[View Project Presentation](https://www.canva.com/design/DAGh0KRijR8/oKBFJRbwcBhVm206AKvEqw/edit)

## 🌟 The Challenge

Parkinson's patients often struggle to communicate the subtle fluctuations of their symptoms, which can vary daily. This lack of precise tracking makes it difficult for doctors to optimize treatment plans and severely impacts patient safety—30% of Parkinson's patients who experience hip fractures do not survive beyond a year.

## 💡 Our Solution

We've built a continuous feedback loop integrating four key data sources into a comprehensive AI-powered system:

1. **VR Pinch Test** - Measures fine motor control
2. **VR Draw Test** - Assesses coordination through spiral and meander patterns
3. **LLM-powered Text-to-Speech for MDS-UPDRS** - Enhances symptom reporting
4. **Speech Recording Analysis** - Identifies vocal impairments

This enables real-time monitoring, risk prediction, and data-driven decision-making to enhance patient care.

## 🧠 System Components

### 1. VR Assessment Tools (`/virtual-reality`)
- Accurately measures neuromuscular coordination with 92% accuracy compared to clinical assessments
- Generates 3x more data points than traditional methods
- Built with Unity and hand-tracking technology

### 2. VR Training Simulations (`/virtual-reality`)
- 5 immersive environments recreating real-world challenges
- Helps patients identify freezing of gait triggers
- Includes scenarios like crowded spaces, narrow doorways, and complex turns

### 3. Drawing Analysis Model (`/hand/Model`)
- Uses image processing, SVM, and Logistic Regression
- Classifies patients on a 0-4 severity scale
- Analyzes spiral and meander pattern handwriting tests

### 4. Voice Severity Classification (`/speech`)
- Combines SVM and CNN to assess speech impairments
- Detects symptom fluctuations with 78% accuracy
- Analyzes rhythm, pitch, and clarity

### 5. Clinical Dashboard (`/H2AIrabbit/parkinsons-dashboard`)
- Web interface for clinicians
- Visualizes patient data and trends
- Provides treatment recommendations

## 📊 Results & Impact

Our system addresses key challenges in Parkinson's care:

- **Objective Assessment**: Replaces subjective symptom reporting with quantifiable metrics
- **Real-time Monitoring**: Allows for continuous tracking of symptom fluctuations
- **Fall Prevention**: Training simulations help patients develop adaptive strategies
- **Treatment Optimization**: Data-driven insights enable personalized medication adjustments

## 🏆 Awards

- **1st Place Grand Prize** - Georgetown University H2AI Hackathon
- **Patient Safety Award** - Sponsored by LucyRx

## 🛠️ Technologies Used

- **VR/AR**: Unity, Hand Tracking
- **AI/ML**: TensorFlow, SVM, CNN, Logistic Regression
- **Web**: React, Flask
- **Data Analysis**: Python, NumPy, Pandas, SciKit-Learn

## 👥 Team

- **Mohamed Shaik** - VR Development & Integration
- **Edward Sun** - Project Lead & ML Models
- **Udit Verma** - Backend & Data Processing
- **Yufei Chen** - Frontend & UI Design
- **Zamir Osmanzai** - Speech Processing & Analysis

---

*This project was created during the Georgetown University H2AI Hackathon, sponsored by LucyRx, Georgetown's Office of Technology Commercialization, and Georgetown University McDonough School of Business.*
