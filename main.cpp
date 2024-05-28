#include <Wire.h>
#include <MPU6050.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiAP.h>

MPU6050 mpu;

const char *ssid = "ESP32_Hotspot";
const char *password = "12345678";
WiFiServer server(80);

void setup() {
  Serial.begin(115200);

  // Initialize MPU6050
  Wire.begin();
  mpu.initialize();
  if (!mpu.testConnection()) {
    Serial.println("MPU6050 connection failed");
    while (1);
  }

  // Set up WiFi
  WiFi.softAP(ssid, password);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(IP);
  
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    while (client.connected()) {
      int16_t ax, ay, az, gx, gy, gz;
      mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

      // Simple fall detection logic
      bool fallDetected = false;
      if (abs(ax) > 30000 || abs(ay) > 30000 || abs(az) > 30000) {
        fallDetected = true;
      }

      // Simple slip detection logic
      bool slipDetected = false;
      if (abs(gx) > 30000 || abs(gy) > 30000 || abs(gz) > 30000) {
        slipDetected = true;
      }

      String data = "ax:" + String(ax) + ",ay:" + String(ay) + ",az:" + String(az) + 
                    ",gx:" + String(gx) + ",gy:" + String(gy) + ",gz:" + String(gz) + 
                    ",fallDetected:" + String(fallDetected) + ",slipDetected:" + String(slipDetected);
      
      client.println(data);
      delay(100);
    }
    client.stop();
  }
}
