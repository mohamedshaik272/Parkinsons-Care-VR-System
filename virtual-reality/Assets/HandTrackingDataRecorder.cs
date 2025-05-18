using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.XR;
using UnityEngine.XR.Interaction.Toolkit;

public class HandTrackingDataRecorder : MonoBehaviour
{
    [Header("Hand References")]
    public Transform leftHand;
    public Transform rightHand;
    
    [Header("Recording Settings")]
    public bool recordData = true;
    public float recordingInterval = 0.1f; // Record data every 0.1 seconds
    public string filePath = @"C:\Users\rcheng4\Downloads\hand_tracking_data.csv";
    
    [Header("Pinch Detection")]
    public InputDeviceCharacteristics leftHandCharacteristics = InputDeviceCharacteristics.Left | InputDeviceCharacteristics.TrackedDevice;
    public InputDeviceCharacteristics rightHandCharacteristics = InputDeviceCharacteristics.Right | InputDeviceCharacteristics.TrackedDevice;
    
    private InputDevice leftHandDevice;
    private InputDevice rightHandDevice;
    private StreamWriter writer;
    private float timer;
    private int frameCount = 0;
    
    // Data structure to store hand tracking info
    private class HandData
    {
        public Vector3 position;
        public Quaternion rotation;
        public bool isPinching;
        public float pinchStrength; // 0 to 1
        public DateTime timestamp;
    }
    
    private HandData leftHandData = new HandData();
    private HandData rightHandData = new HandData();

    void Start()
    {
        InitializeDevices();
        InitializeCSV();
        
        // Start recording data
        if (recordData)
        {
            StartCoroutine(RecordDataRoutine());
        }
    }
    
    void InitializeDevices()
    {
        List<InputDevice> leftDevices = new List<InputDevice>();
        List<InputDevice> rightDevices = new List<InputDevice>();
        
        InputDevices.GetDevicesWithCharacteristics(leftHandCharacteristics, leftDevices);
        InputDevices.GetDevicesWithCharacteristics(rightHandCharacteristics, rightDevices);
        
        if (leftDevices.Count > 0)
        {
            leftHandDevice = leftDevices[0];
            Debug.Log("Left hand device found: " + leftHandDevice.name);
        }
        
        if (rightDevices.Count > 0)
        {
            rightHandDevice = rightDevices[0];
            Debug.Log("Right hand device found: " + rightHandDevice.name);
        }
    }
    
    void InitializeCSV()
    {
        try
        {
            // Create directory if it doesn't exist
            string directory = Path.GetDirectoryName(filePath);
            if (!Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
            
            // Create or overwrite file
            writer = new StreamWriter(filePath, false);
            
            // Write CSV header
            writer.WriteLine("Timestamp,Frame,Hand,PositionX,PositionY,PositionZ,RotationX,RotationY,RotationZ,RotationW,IsPinching,PinchStrength");
            writer.Flush();
            
            Debug.Log("CSV file initialized at: " + filePath);
        }
        catch (Exception e)
        {
            Debug.LogError("Error initializing CSV file: " + e.Message);
        }
    }
    
    IEnumerator RecordDataRoutine()
    {
        while (recordData)
        {
            // Update hand data
            UpdateHandData();
            
            // Record data to CSV
            WriteDataToCSV();
            
            // Wait for next recording interval
            yield return new WaitForSeconds(recordingInterval);
        }
    }
    
    void UpdateHandData()
    {
        // Update frame count
        frameCount++;
        
        // Update timestamp
        DateTime now = DateTime.Now;
        leftHandData.timestamp = now;
        rightHandData.timestamp = now;
        
        // Update position and rotation from transforms
        if (leftHand != null)
        {
            leftHandData.position = leftHand.position;
            leftHandData.rotation = leftHand.rotation;
        }
        
        if (rightHand != null)
        {
            rightHandData.position = rightHand.position;
            rightHandData.rotation = rightHand.rotation;
        }
        
        // Update pinch data from input devices
        if (leftHandDevice.isValid)
        {
            leftHandDevice.TryGetFeatureValue(CommonUsages.gripButton, out bool isGripping);
            leftHandDevice.TryGetFeatureValue(CommonUsages.trigger, out float pinchStrength);
            
            leftHandData.isPinching = isGripping || pinchStrength > 0.7f; // Consider it a pinch if grip or trigger pressed enough
            leftHandData.pinchStrength = pinchStrength;
        }
        
        if (rightHandDevice.isValid)
        {
            rightHandDevice.TryGetFeatureValue(CommonUsages.gripButton, out bool isGripping);
            rightHandDevice.TryGetFeatureValue(CommonUsages.trigger, out float pinchStrength);
            
            rightHandData.isPinching = isGripping || pinchStrength > 0.7f;
            rightHandData.pinchStrength = pinchStrength;
        }
    }
    
    void WriteDataToCSV()
    {
        if (writer == null) return;
        
        try
        {
            // Format: Timestamp,Frame,Hand,PositionX,PositionY,PositionZ,RotationX,RotationY,RotationZ,RotationW,IsPinching,PinchStrength
            
            // Write left hand data
            writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11}",
                leftHandData.timestamp.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                frameCount,
                "Left",
                leftHandData.position.x,
                leftHandData.position.y,
                leftHandData.position.z,
                leftHandData.rotation.x,
                leftHandData.rotation.y,
                leftHandData.rotation.z,
                leftHandData.rotation.w,
                leftHandData.isPinching ? 1 : 0,
                leftHandData.pinchStrength
            ));
            
            // Write right hand data
            writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8},{9},{10},{11}",
                rightHandData.timestamp.ToString("yyyy-MM-dd HH:mm:ss.fff"),
                frameCount,
                "Right",
                rightHandData.position.x,
                rightHandData.position.y,
                rightHandData.position.z,
                rightHandData.rotation.x,
                rightHandData.rotation.y,
                rightHandData.rotation.z,
                rightHandData.rotation.w,
                rightHandData.isPinching ? 1 : 0,
                rightHandData.pinchStrength
            ));
            
            writer.Flush();
        }
        catch (Exception e)
        {
            Debug.LogError("Error writing to CSV file: " + e.Message);
        }
    }
    
    void OnApplicationQuit()
    {
        // Close the file when application quits
        if (writer != null)
        {
            writer.Close();
            Debug.Log("CSV file closed. Data saved at: " + filePath);
        }
    }
    
    // Optional: Add a method to manually stop recording
    public void StopRecording()
    {
        recordData = false;
        if (writer != null)
        {
            writer.Close();
            writer = null;
            Debug.Log("Recording stopped. Data saved at: " + filePath);
        }
    }
}