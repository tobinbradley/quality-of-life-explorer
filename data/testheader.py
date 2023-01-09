import csv
import os

folder_to_check = "./metric"

def check_header(file, fileName):
  with open(file) as f:
    reader = csv.reader(f)
    header = next(reader)
    for idx, x in enumerate(header):
      if idx == 0:
        if x != "id":
          print(fileName, "id not named id: ", x)
      else:
        if x[0:2] != "y_" or len(x) != 6:
          print(fileName, "year column incorrect: ", x)

count = 0
for file in os.listdir(folder_to_check):
  if file.endswith(".csv"):
    check_header(os.path.join(folder_to_check, file), file)
    count = count + 1

print(count, "files checked")
