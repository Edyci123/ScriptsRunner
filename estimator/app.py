from flask import Flask, request
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
import numpy as np
import re
from data_generator import DataGenerator
from sklearn.model_selection import train_test_split


app = Flask(__name__)

model = None


@app.route("/estimate_execution_time", methods=["POST"])
def estimate_execution_time():
    global model

    # Get the Kotlin script from the request body
    data = request.get_json()
    code = data["code"]

    # Extract features from the code
    features = extract_features(code)

    # Convert features into a numpy array
    features = np.array(features)

    # Update the training data with the new code
    with open("data.txt", "r") as f:
        data = []
        for line in f:
            data.append(line.strip())
        data.append(f"{code}\t{features}\t")

    # Truncate the data to 80% for training and 20% for validation
    # if (len(data)):
    #     training_data = data[: 80 // 100]  # 80% of the data for training
    #     validation_data = data[80 // 100 :][: 20 // 100]  # 20% of the data for validation

    #     # Update the model if necessary
    #     if model is None or model.predict(features.reshape(1, -1))[0][0] >= 1.05:
    #         # Train the model using the updated training data
    #         model = train_model(training_data, validation_data)

    prediction = model.predict(features.reshape(1, -1))[0][0]

    # Extract actual execution time from the request body
    actual_execution_time = request.headers.get("execution-time")

    # Save the code, features, and actual execution time
    with open("data.txt", "a") as f:
        f.write(f"{code}\t{features}\t{actual_execution_time}\n")

    # Return the predicted execution time
    return {"executionTime": prediction}


def extract_features(code):
    # Regular expression to match function declarations
    function_regex = re.compile(r"fun\s+(\w+)\((.*)\)")

    # List of features
    features = []

    # Match function declarations
    for match in function_regex.finditer(code):
        argument_count = len(match.group(2).split(","))
        statements_count = len(match.group(3).split("\\n"))

        # Add features related to the function
        features.append(argument_count)
        features.append(statements_count)

    # Regular expression to match loops
    loop_regex = re.compile("for\\s+(\\w+)\\s+in\\s+(.*)")

    # Match loops
    for match in loop_regex.finditer(code):
        loop_var = match.group(1)
        loop_range = match.group(2)

        # Add features related to the loop
        features.append(loop_var)
        features.append(len(loop_range.split("..")))

    # Regular expression to match complex operators
    complex_operator_regex = re.compile("(\\+|-|\\*|/|\\^)")

    # Count occurrences of complex operators
    complex_operator_count = len(complex_operator_regex.findall(code))
    features.append(complex_operator_count)

    return features


def train_model(training_data, validation_data):
    # Split the data into features and target values
    features = []
    target_values = []
    for data_point in training_data:
        features.append(data_point[0])
        target_values.append(data_point[1])

    features = np.array(features)
    target_values = np.array(target_values)

    # Create the model
    model = keras.Sequential()
    model.add(keras.layers.Dense(10, activation="relu", input_shape=(training_data.shape[1],)))
    model.add(keras.layers.Dense(1))

    # Compile the model
    model.compile(optimizer="adam", loss="mse")

    # Train the model
    model.fit(features, target_values, epochs=10, batch_size=32)

    # Evaluate the model
    scores = model.evaluate(validation_data[0], validation_data[1])
    print("Model evaluation:", scores)

    return model


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="5432")
