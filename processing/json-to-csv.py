import sys
import csv
import json

input_path = sys.argv[1]
output_path = sys.argv[2]

with open(input_path, 'r') as f:
    data: list[dict] = json.load(f)

row_names = data[0].keys()

with open(output_path, 'w', newline='') as f:
    csv_writer = csv.writer(f)
    csv_writer.writerow(row_names)
    for row in data:
        csv_writer.writerow(row.values())



