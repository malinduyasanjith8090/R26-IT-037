import os
import json
import numpy as np
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint
)

from sklearn.metrics import classification_report, confusion_matrix


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = "dataset"

MODEL_DIR = "../assets/models/sinhala"

IMAGE_SIZE = 64

BATCH_SIZE = 32

EPOCHS = 50

VALIDATION_SPLIT = 0.2

SEED = 42


# ============================================================
# CREATE MODEL DIRECTORY
# ============================================================

os.makedirs(MODEL_DIR, exist_ok=True)


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading Sinhala handwriting dataset...")

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="training",
    seed=SEED,
    image_size=(IMAGE_SIZE, IMAGE_SIZE),
    color_mode="grayscale",
    batch_size=BATCH_SIZE,
    shuffle=True
)

validation_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=VALIDATION_SPLIT,
    subset="validation",
    seed=SEED,
    image_size=(IMAGE_SIZE, IMAGE_SIZE),
    color_mode="grayscale",
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ============================================================
# CLASS NAMES
# ============================================================

class_names = train_ds.class_names

print("\nDetected classes:")
print(class_names)

print("\nNumber of classes:", len(class_names))


# ============================================================
# SAVE LABELS
# ============================================================

labels_path = os.path.join(MODEL_DIR, "labels.json")

with open(labels_path, "w", encoding="utf-8") as file:
    json.dump(
        {
            "classes": class_names,
            "num_classes": len(class_names)
        },
        file,
        ensure_ascii=False,
        indent=4
    )

print("\nLabels saved:", labels_path)


# ============================================================
# PERFORMANCE OPTIMIZATION
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.cache().shuffle(1000).prefetch(
    buffer_size=AUTOTUNE
)

validation_ds = validation_ds.cache().prefetch(
    buffer_size=AUTOTUNE
)


# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential([
    layers.RandomRotation(0.08),
    layers.RandomZoom(0.10),
    layers.RandomTranslation(
        height_factor=0.08,
        width_factor=0.08
    ),
    layers.RandomContrast(0.15)
])


# ============================================================
# NORMALIZATION
# ============================================================

normalization = layers.Rescaling(
    1.0 / 255.0
)


# ============================================================
# CNN MODEL
# ============================================================

model = models.Sequential([

    layers.Input(
        shape=(IMAGE_SIZE, IMAGE_SIZE, 1)
    ),

    normalization,

    data_augmentation,

    # --------------------------------------------------------
    # Block 1
    # --------------------------------------------------------

    layers.Conv2D(
        32,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.BatchNormalization(),

    layers.Conv2D(
        32,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.MaxPooling2D(
        (2, 2)
    ),

    layers.Dropout(0.20),


    # --------------------------------------------------------
    # Block 2
    # --------------------------------------------------------

    layers.Conv2D(
        64,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.BatchNormalization(),

    layers.Conv2D(
        64,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.MaxPooling2D(
        (2, 2)
    ),

    layers.Dropout(0.25),


    # --------------------------------------------------------
    # Block 3
    # --------------------------------------------------------

    layers.Conv2D(
        128,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.BatchNormalization(),

    layers.Conv2D(
        128,
        (3, 3),
        padding="same",
        activation="relu"
    ),

    layers.MaxPooling2D(
        (2, 2)
    ),

    layers.Dropout(0.30),


    # --------------------------------------------------------
    # Classifier
    # --------------------------------------------------------

    layers.GlobalAveragePooling2D(),

    layers.Dense(
        256,
        activation="relu"
    ),

    layers.Dropout(0.40),

    layers.Dense(
        len(class_names),
        activation="softmax"
    )
])


# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)


# ============================================================
# MODEL SUMMARY
# ============================================================

model.summary()


# ============================================================
# CALLBACKS
# ============================================================

best_model_path = os.path.join(
    MODEL_DIR,
    "sinhala_alphabet.keras"
)

callbacks = [

    ModelCheckpoint(
        best_model_path,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    EarlyStopping(
        monitor="val_accuracy",
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=4,
        min_lr=0.00001,
        verbose=1
    )
]


# ============================================================
# TRAIN
# ============================================================

print("\nStarting training...\n")

history = model.fit(
    train_ds,
    validation_data=validation_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)


# ============================================================
# FINAL EVALUATION
# ============================================================

print("\nEvaluating model...")

loss, accuracy = model.evaluate(
    validation_ds
)

print("\nValidation Loss:", loss)

print(
    "Validation Accuracy:",
    accuracy
)


# ============================================================
# PREDICTIONS
# ============================================================

y_true = []
y_pred = []


for images, labels in validation_ds:

    predictions = model.predict(
        images,
        verbose=0
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:\n")

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred
)

print("\nConfusion Matrix:")
print(cm)


# ============================================================
# SAVE FINAL MODEL
# ============================================================

final_model_path = os.path.join(
    MODEL_DIR,
    "sinhala_alphabet_final.keras"
)

model.save(
    final_model_path
)

print(
    "\nFinal model saved:",
    final_model_path
)

print("\nTraining completed.")