import base64
import json
import os
import cv2
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO

app = FastAPI(title="AgriMarket AI Moderation Worker")

# Enable CORS for local client posts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_BOOT_URL = "http://localhost:8080/api/moderation/livestream-alert"

# Load pre-trained YOLOv8 model (automatically downloads coco weights on first run ~6MB)
try:
    print(">>> Loading YOLOv8 model...")
    yolo_model = YOLO("yolov8n.pt")
    print(">>> YOLOv8 loaded successfully.")
except Exception as e:
    print(f">>> Error loading YOLOv8: {e}. Running in fallback mode.")
    yolo_model = None

# Memory cache to detect static/trash livestreams
# Format: { livestream_id: { "last_frame": ndarray, "static_count": int } }
stream_history = {}


class FramePayload(BaseModel):
    livestreamId: int
    frame: str  # Base64 string


def decode_base64_image(base64_str: str):
    if "," in base64_str:
        base64_str = base64_str.split(",")[1]
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


@app.post("/moderation/frame")
async def moderate_frame(payload: FramePayload):
    try:
        # 1. Decode frame
        img = decode_base64_image(payload.frame)
        if img is None:
            raise HTTPException(status_code=400, detail="Cannot decode image")

        shape = img.shape
        h, w = shape[0], shape[1]
        c = shape[2] if len(shape) > 2 else 1
        violations = []

        # 2. YOLOv8 Object Detection (Weapons / Knives check)
        if yolo_model:
            results = yolo_model(img, verbose=False)
            for r in results:
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    name = r.names[cls_id]

                    # Class ID 43 is knife, 49 is scissors in COCO dataset
                    if (name in ["knife", "scissors"] or cls_id in [43, 49]) and conf > 0.5:
                        violations.append({
                            "type": "WEAPONS",
                            "detail": f"Phát hiện vật thể nguy hiểm: {name} ({conf:.2f})"
                        })

        # 3. Nudity Check (Skin color coverage heuristic)
        # Convert to HSV color space
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        # Define Vietnamese skin color range in HSV
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        skin_pixels = cv2.countNonZero(skin_mask)
        total_pixels = h * w
        skin_ratio = skin_pixels / total_pixels

        # If skin color ratio covers more than 60% of the screen, flag as potential Nudity
        if skin_ratio > 0.60:
            violations.append({
                "type": "NUDITY",
                "detail": f"Phát hiện hình ảnh có tỷ lệ da cao: {skin_ratio * 100:.1f}%"
            })

        # 4. Trash Live Check (Black screen or Still/Static room)
        # Average brightness
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        avg_brightness = np.mean(gray)

        # Black screen check
        if avg_brightness < 12.0:
            violations.append({
                "type": "TRASH_LIVE",
                "detail": f"Phát hiện màn hình đen (độ sáng: {avg_brightness:.1f})"
            })
        else:
            # Static frame check (no motion)
            if payload.livestreamId not in stream_history:
                stream_history[payload.livestreamId] = {"last_frame": gray, "static_count": 0}
            else:
                hist = stream_history[payload.livestreamId]
                last_gray = hist["last_frame"]
                
                # Verify frame shape matches
                if last_gray.shape == gray.shape:
                    diff = cv2.absdiff(gray, last_gray)
                    mean_diff = np.mean(diff)
                    
                    # If pixel change is minimal (< 0.8 average deviation)
                    if mean_diff < 0.8:
                        hist["static_count"] += 1
                        if hist["static_count"] >= 3: # 3 intervals * 10s = 30 seconds of absolute stillness
                            violations.append({
                                "type": "TRASH_LIVE",
                                "detail": "Phát hiện màn hình tĩnh (Không có chuyển động trong 30 giây)"
                            })
                    else:
                        hist["static_count"] = 0
                
                # Update last frame
                hist["last_frame"] = gray

        # 5. Handle violations by forwarding to Spring Boot Webhook
        for violation in violations:
            print(f">>> AI Moderation Violation: {violation['type']} - {violation['detail']}")
            
            webhook_payload = {
                "livestreamId": payload.livestreamId,
                "alertType": violation["type"],
                "evidenceUrl": payload.frame # Post base64 image as evidence
            }
            
            try:
                r = requests.post(SPRING_BOOT_URL, json=webhook_payload)
                if r.status_code == 200:
                    print(f"    Alert successfully reported to Spring Boot.")
                else:
                    print(f"    Failed to report alert to Spring Boot: {r.status_code} - {r.text}")
            except Exception as e:
                print(f"    Error connecting to Spring Boot webhook: {e}")

        return {"status": "success", "violations_found": len(violations)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def index():
    return {"status": "running", "yolo_loaded": yolo_model is not None}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
