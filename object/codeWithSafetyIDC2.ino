#include <OneWire.h>
#include <DallasTemperature.h>

// Define pins for temperature sensor and stepper motor
#define ONE_WIRE_BUS 4  // Data wire for temperature sensor
#define stepPin 2       // Step pin for stepper motor
#define dirPin 5        // Direction pin for stepper motor

// Temperature thresholds
const float UPPER_THRESHOLD = 80.0;  // Fahrenheit
const float LOWER_THRESHOLD = 77.0;  // Fahrenheit

// Setup a oneWire instance to communicate with OneWire devices
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Variable to track window state
bool windowOpen = false;  // 0 = Closed, 1 = Open

// Consecutive reading counters
int aboveThresholdCount = 0;
int belowThresholdCount = 0;
const int REQUIRED_CONSECUTIVE_READINGS = 3;  // How many consecutive readings trigger the action

// Function to rotate the stepper motor
void rotateMotor(bool direction, unsigned long duration) {
  digitalWrite(dirPin, direction ? HIGH : LOW);  // Set direction

  unsigned long startTime = millis();
  while (millis() - startTime < duration) {  // Run for specified time
    digitalWrite(stepPin, HIGH);
    delayMicroseconds(700);  // Adjust step timing as needed
    digitalWrite(stepPin, LOW);
    delayMicroseconds(700);
  }
}

void setup() {
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect
  }

  sensors.begin();
  pinMode(stepPin, OUTPUT);
  pinMode(dirPin, OUTPUT);

  Serial.println("Initializing Temperature Sensor...");
  int deviceCount = sensors.getDeviceCount();
  Serial.print("Found ");
  Serial.print(deviceCount);
  Serial.println(" temperature sensor(s)");
}

void loop() {
  float tempF;
  sensors.requestTemperatures();
  tempF = sensors.getTempFByIndex(0);

  if (tempF == DEVICE_DISCONNECTED_F) {
    Serial.println("Error: Temperature sensor disconnected!");
    delay(1000);
    return;
  }

  Serial.print("Current Temperature: ");
  Serial.print(tempF, 2);
  Serial.println(" °F");

  // Logic for opening and closing the window with consecutive checks
  if (tempF > UPPER_THRESHOLD) {
    aboveThresholdCount++;
    belowThresholdCount = 0;  // Reset below count

    if (aboveThresholdCount >= REQUIRED_CONSECUTIVE_READINGS && !windowOpen) {
      Serial.println("Opening window");
      rotateMotor(true, 5000);  // Rotate to open window
      windowOpen = true;
      aboveThresholdCount = 0;  // Reset counter after action
    }
  }
  else if (tempF < LOWER_THRESHOLD) {
    belowThresholdCount++;
    aboveThresholdCount = 0;  // Reset above count

    if (belowThresholdCount >= REQUIRED_CONSECUTIVE_READINGS && windowOpen) {
      Serial.println("Closing window");
      rotateMotor(false, 5000);  // Rotate to close window
      windowOpen = false;
      belowThresholdCount = 0;  // Reset counter after action
    }
  }
  else {
    // Reset counters if the temperature is within thresholds
    aboveThresholdCount = 0;
    belowThresholdCount = 0;
  }

  delay(1000);  // Delay between temperature checks
}
