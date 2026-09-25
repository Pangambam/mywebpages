import pandas as pd
import json

# --------------------------------------------------
# INPUT / OUTPUT FILES
# --------------------------------------------------

input_file = "MCAToC.csv"
output_file = "MCAToC.json"


# --------------------------------------------------
# SUBJECT INFORMATION
# --------------------------------------------------

subject = "Theory of Computation"
code = "CSA-DSM-2204"
course_class = "MCA-II"
paper_type = "Theory"


# --------------------------------------------------
# READ CSV
# --------------------------------------------------

df = pd.read_csv(input_file)


# --------------------------------------------------
# CONVERT DATA
# --------------------------------------------------

students = []

for _, row in df.iterrows():

    roll = str(row["roll"]).strip()
    marks = row["marks"]

    # Keep "Absent" as text
    if str(marks).strip().lower() == "absent":

        marks = "Absent"

    else:

        # Convert numerical marks to integer where possible
        try:
            marks = int(float(marks))
        except:
            marks = str(marks).strip()

    students.append({
        "roll": roll,
        "marks": marks
    })


# --------------------------------------------------
# CREATE JSON STRUCTURE
# --------------------------------------------------

data = {
    "subject": subject,
    "code": code,
    "class": course_class,
    "type": paper_type,
    "students": students
}


# --------------------------------------------------
# SAVE JSON
# --------------------------------------------------

with open(output_file, "w", encoding="utf-8") as f:

    json.dump(
        data,
        f,
        indent=4,
        ensure_ascii=False
    )


print("Conversion completed!")
print("Created:", output_file)
