import random
import re

class DataGenerator:

    def __init__(self, input_size):
        self.input_size = input_size
        
        
    def extract_features(self, code):
        # Regular expression to match function declarations
        function_regex = re.compile("fun(\\s+(\\w+)\\((.*)\\)\\s*(.*)")

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

    def generate_data(self, num_samples):
        data = []

        for _ in range(num_samples):
            code = self.generate_random_code()
            execution_time = self.generate_random_execution_time()
            features = self.extract_features(code)
            data.append((features, execution_time))

        return data

    def generate_random_code(self):
        function_length = random.randint(10, 100)
        loop_count = random.randint(5, 30)
        complex_operator_count = random.randint(3, 10)
        input_size = self.input_size  # Pass the input size here

        code = ""

        for _ in range(function_length):
            function = self.generate_random_function()
            code += function

        for _ in range(loop_count):
            loop = self.generate_random_loop()
            code += loop

        for _ in range(complex_operator_count):
            operator = self.generate_random_complex_operator()
            code += operator

        input = self.generate_random_input(input_size)
        code += f"val input = {input}"

        processing = self.generate_random_processing(input)
        code += processing

        return code

    def generate_random_execution_time(self):
        mean = 100.0
        standard_deviation = 10.0
        return random.gauss(mean, standard_deviation)

    def generate_random_function(self):
        function_name = "myFunction"
        arguments = self.generate_random_arguments(random.randint(1, 10))

        code = f"fun {function_name}({arguments}) { {} }"
        return code

    def generate_random_arguments(self, num_arguments):
        argument_names = ["arg" + str(i) for i in range(1, num_arguments + 1)]
        return argument_names

    def generate_random_loop(self):
        return "for (i in 1..10) { i * i } \n"

    def generate_random_complex_operator(self):
        return "listOf(1, 2, 3).map { it * it }\n"

    def generate_random_input(self, input_size):
        input_elements = [str(random.randint(1, 100)) for _ in range(input_size)]
        return ", ".join(input_elements)

    def generate_random_processing(self, input):
        return "val output = {input}.map { it * it }\n"