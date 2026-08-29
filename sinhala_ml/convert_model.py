import os
import subprocess
import sys


MODEL_PATH = "../assets/models/sinhala/sinhala_alphabet_final.keras"

OUTPUT_DIR = "../assets/models/sinhala/tfjs"


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


command = [
    sys.executable,
    "-m",
    "tensorflowjs.converters",
    "--input_format=keras",
    MODEL_PATH,
    OUTPUT_DIR
]


print("Converting TensorFlow model to TensorFlow.js...")

result = subprocess.run(
    command,
    capture_output=True,
    text=True
)


print(result.stdout)

if result.returncode != 0:

    print(result.stderr)

    raise RuntimeError(
        "TensorFlow.js conversion failed."
    )


print("\nConversion successful.")

print(
    "TensorFlow.js model:",
    OUTPUT_DIR
)