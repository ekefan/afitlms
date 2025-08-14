import serial
try:
    ser = serial.Serial('COM7', 9600, timeout=1)
    print("✓ COM7 is now accessible!")
    ser.close()
except Exception as e:
    print(f"✗ Still can't access COM7: {e}")