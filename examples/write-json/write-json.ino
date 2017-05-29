#include "SENtral.h"
#include <i2c_t3.h>

#define MCU_LED_PIN 13
#define IMU_INT_PIN 6

SENtral imu;

elapsedMillis printTimer = 0;
unsigned int printPeriod = 50; // ms

void printJSON()
{
  String s = String("{\"time\":") + millis()
             // + String(",\"qw\":") + (100*imu.q[0]) // x100 for precision.
             // + String(",\"qx\":") + (100*imu.q[1]) // Normalize downstream
             // + String(",\"qy\":") + (100*imu.q[2])
             // + String(",\"qz\":") + (100*imu.q[3])

             + String(",\"pitch\":") + imu.pitch
             + String(",\"roll\":") + imu.roll
             + String(",\"yaw\":") + imu.yaw

             + String(",\"ax\":") + imu.ax
             + String(",\"ay\":") + imu.ay
             + String(",\"az\":") + imu.az

             + String(",\"t_celsius\":") + imu.temperature
             + String(",\"p_mbar\":") + imu.pressure
             + "}";
  Serial.println(s);
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

  // If true, use magnetometer calibration data stored in EEPROM. No accel.
  // calibrations are applied.
  // This presupposes that the "warm start" calibration procedure has been run!
  imu.configure(true);

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
  if (printTimer >= printPeriod)
  {
    printTimer -= printPeriod;
    printJSON();
  }
}
