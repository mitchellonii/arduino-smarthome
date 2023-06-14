#include <ArduinoJson.h>
#define lightSensor A3
#define motionSensor 6
#define greenLED 12
#define redLED 13
#define buttonA 11
#define buttonB 10
#define buttonC 9


bool armed = false;

bool motionDet = false;

void setup() {
  Serial.begin(9600);
  pinMode(redLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(lightSensor, INPUT);
  pinMode(motionSensor, INPUT);
  pinMode(buttonA, INPUT);
  pinMode(buttonB, INPUT);
  pinMode(buttonC, INPUT);
  while (!Serial) continue;
  
}

void loop() {


  for(int i = 0; i < 20; i++){
      if(armed){
    digitalWrite(redLED, HIGH);
    digitalWrite(greenLED, LOW);
  }
  else{
    digitalWrite(greenLED, HIGH);
    digitalWrite(redLED, LOW);
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

    //it saves ~4kb (15%) of storage to use the char type, rather than importing the String class and concatenating everything to one line (see below)
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
      Serial.print("{\"event\":\"data\",\"ref\":\"dataUpdateCall\",\"light\":\"");
      Serial.print(light);
      Serial.print("\",\"motion\":\"");
      Serial.print(pir);
      Serial.print("\",\"armed\":\"");
      Serial.print(armed);
      Serial.println("\"}");
    }
    else if(!strcmp(event, "toggleArm")){
      armed = !armed;
            Serial.print("{\"event\":\"data\",\"ref\":\"dataUpdateCall\",\"light\":\"");
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
    Serial.println("{\"event\":\"alert\", \"motion\":\"1\"}");
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

