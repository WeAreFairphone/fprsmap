import json, os.path, requests, yaml

response = requests.get('https://forum.fairphone.com/raw/48676/1')

if response.status_code == requests.codes.ok :
    with open(os.path.dirname(os.path.abspath(__file__)) + "/../data/angels.json","w") as file:
        json.dump(yaml.safe_load(response.text), file, indent=2)
