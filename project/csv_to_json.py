__author__ = 'patrick'

import csv
import json

input_file = csv.DictReader(open("econ_breakdown.csv", "rU"))
data = [row for row in input_file]
reordered = {}
for row in data:
    year = row['year']
    country = row['country']
    try:
        reordered[year][country] = {'banking': row['banking'],
                                                'currency': row['currency'],
                                                'domdebt': row['domdebt'],
                                                'extdebt': row['extdebt'],
                                                'inflation': row['inflation'],
                                                'stockmarket': row['stockmarket']
                                                }
    except:
        reordered[year] = {country: {'banking': row['banking'],
                                                'currency': row['currency'],
                                                'domdebt': row['domdebt'],
                                                'extdebt': row['extdebt'],
                                                'inflation': row['inflation'],
                                                'stockmarket': row['stockmarket']
                                                }}

with open("econ_breakdown.json", "w") as outfile:
    json.dump(reordered, outfile, indent=4)