from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image
import io

# 🟢 Load mô hình một lần khi import module
processor = AutoImageProcessor.from_pretrained("dima806/facial_emotions_image_detection")
model = AutoModelForImageClassification.from_pretrained("dima806/facial_emotions_image_detection")

# Danh sách các cảm xúc mô hình có thể nhận diện
EMOTION_LABELS = ["angry", "disgust", "fear", "happy", "neutral", "sad", "surprise"]

def predict_emotion(image_bytes):
    """Nhận ảnh dưới dạng bytes và trả về cảm xúc dự đoán."""
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Tiền xử lý ảnh
        inputs = processor(image, return_tensors="pt")

        # Dự đoán cảm xúc
        with torch.no_grad():
            outputs = model(**inputs)

        # Lấy cảm xúc dự đoán có xác suất cao nhất
        predicted_class = torch.argmax(outputs.logits, dim=-1).item()
        predicted_emotion = EMOTION_LABELS[predicted_class]

        return predicted_emotion
    except Exception as e:
        print(f"❌ Error prediction proccess: {e}")
        return None
