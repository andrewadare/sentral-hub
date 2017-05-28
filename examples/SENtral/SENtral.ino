#include "SENtral.h"
#include <i2c_t3.h>

#define MCU_LED_PIN 13
#define IMU_INT_PIN 6

SENtral imu;

elapsedMillis printTimer = 0;
unsigned int printerval = 50; // ms

void printSentralData()
{
  Serial.print("\nAltimeter temperature = ");
  Serial.print(imu.temperature, 2);
  Serial.print(" C, "); // temperature in degrees Celsius
  Serial.print(9.*imu.temperature/5. + 32., 2);
  Serial.println(" F"); // temperature in degrees Fahrenheit
  Serial.print("Altimeter pressure = ");
  Serial.print(imu.pressure, 2);
  Serial.println(" mbar");// pressure in millibar
  imu.altitude = 145366.45f*(1.0f - pow((imu.pressure/1013.25f), 0.190284f));
  Serial.print("Altitude = ");
  Serial.print(imu.altitude, 2);
  Serial.println(" feet");

  Serial.print("IMU qw, qx, qy, qz: ");
  Serial.print(imu.q[0], 2);
  Serial.print(", ");
  Serial.print(imu.q[1], 2);
  Serial.print(", ");
  Serial.print(imu.q[2], 2);
  Serial.print(", ");
  Serial.println(imu.q[3], 2);

  Serial.print("IMU yaw, pitch, poll: ");
  Serial.print(imu.yaw, 2);
  Serial.print(", ");
  Serial.print(imu.pitch, 2);
  Serial.print(", ");
  Serial.println(imu.roll, 2);
}

void setup()
{
  // Wire.begin();
  // TWBR = 12;  // 400 kbit/sec I2C speed for Pro Mini
  // Setup for Master mode, pins 18/19, external pullups, 400kHz for Teensy 3.1
  Wire.begin(I2C_MASTER, 0x00, I2C_PINS_16_17, I2C_PULLUP_EXT, I2C_RATE_400);
  delay(1000);
  Serial.begin(115200);

  pinMode(MCU_LED_PIN, OUTPUT);
  digitalWrite(MCU_LED_PIN, LOW);

  imu.I2Cscan(); // should detect SENtral at 0x28
  imu.printDeviceInfo();

  imu.fetchCalibData();
  imu.configure();

  // Set declination here to use true north instead of mag. north.
  // Mag. declination in Boulder, CO (39d 58m 47s N, 105d 15m 9s W):
  // 8.45 +/- 0.35 deg.
  // https://www.ngdc.noaa.gov/geomag-web/#declination
  // imu.declination = 8.45;
  imu.declination = 0;
}

void loop()
{
  imu.update();
  if (printTimer >= printerval)
  {
    printTimer -= printerval;
    printSentralData();
  }
}
