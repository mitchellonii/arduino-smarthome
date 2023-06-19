#include <ArduinoJson.h>
#define lightSensor A3
#define motionSensor 6
#define greenLED 12
#define redLED 13
#define yellowLED 5
#define servoPin 9

#define buzzerPin A0
#include <Servo.h>
Servo myServo;
bool armed = false;

bool motionDet = false;

void setup() {
  Serial.begin(9600);
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
    pinMode(yellowLED, OUTPUT);
    myServo.attach(9, 600, 2400);
    pinMode(buzzerPin, OUTPUT);
  pinMode(lightSensor, INPUT);
  pinMode(motionSensor, INPUT);

  while (!Serial) continue;

}

void loop() {
  myServo.write(75);
  for(int i = 0; i < 20; i++){
      if(armed){
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
    myServo.write(0);
  }
  else{
    digitalWrite(greenLED, HIGH);
    digitalWrite(redLED, LOW);
        myServo.write(180);

  }
  if(analogRead(lightSensor) > 200){
    digitalWrite(yellowLED, HIGH);
} else{
      digitalWrite(yellowLED, LOW);

}
    for(int i = 0; i < 1000; i++){


  if(i == 999)motionDet = false;
   delay(1);



  if (Serial.available()) {
    char buff[100];
    int length = Serial.readBytes(buff, sizeof(buff) - 1);
    buff[length] = 0;
    StaticJsonDocument<100> packet;
    DeserializationError error = deserializeJson(packet, buff);
    if(error){
      Serial.println("{\"error\":\"parse\"");
      return;
    }

    const char* event = packet["event"];
    const char* id = packet["id"];

    //it saves ~4kb (15%) of storage to use the char type, rather thanimporting the String class and concatenating everything to one line (seebelow)
    if(!strcmp(event, "handshake")){//strcmp (string compare) returns 0 if a char array and a string are equal
      Serial.print("{\"event\":\"");
      Serial.print(event);//it saves 26 bytes to use the event variable, rather than having "handshake" as part of the above string
      Serial.print("\",\"data\":\"success\",\"id\":\"");
      Serial.print(id);
      Serial.println("\"}");
    }
    else if(!strcmp(event, "dataUpdate")){
       bool pir = digitalRead(motionSensor);
      int light = analogRead(lightSensor);
      Serial.print(
"{\"event\":\"data\",\"ref\":\"dataUpdateCall\",\"light\":\"");
      Serial.print(light);
      Serial.print("\",\"motion\":\"");
      Serial.print(pir);
      Serial.print("\",\"armed\":\"");
      Serial.print(armed);
      Serial.println("\"}");
    }
    else if(!strcmp(event, "toggleArm")){
      armed = !armed;
            Serial.print(
"{\"event\":\"data\",\"ref\":\"dataUpdateCall\",\"light\":\"");
                   bool pir = digitalRead(motionSensor);
      int light = analogRead(lightSensor);
      Serial.print(light);
      Serial.print("\",\"motion\":\"");
      Serial.print(pir);
      Serial.print("\",\"armed\":\"");
      Serial.print(armed);
      Serial.println("\"}");
    }
    else{
      Serial.print("{\"event\":\"");
      Serial.print(event);
      Serial.print("\",\"data\":\"unknown\",\"id\":\"");
      Serial.print(id);
      Serial.print("\"}");
    }

}

  if(digitalRead(motionSensor) == 1 && motionDet == false){
    motionDet = true;

     bool pir = digitalRead(motionSensor);
      int light = analogRead(lightSensor);
      Serial.print(
"{\"event\":\"alert\",\"light\":\"");
      Serial.print(light);
      Serial.print("\",\"motion\":\"");
      Serial.print(pir);
      Serial.print("\",\"armed\":\"");
      Serial.print(armed);
    Serial.print("\"motion\":\"1\"}");

    if(armed){
    digitalWrite(buzzerPin, HIGH);
    delay(500);
    digitalWrite(buzzerPin, LOW);
    }

  }}

  }



  bool pir = digitalRead(motionSensor);
  int light = analogRead(lightSensor);
  Serial.print("{\"event\":\"data\",\"light\":\"");
  Serial.print(light);
  Serial.print("\",\"motion\":\"");
  Serial.print(pir);
        Serial.print("\",\"armed\":\"");
      Serial.print(armed);
  Serial.println("\"}");





}
